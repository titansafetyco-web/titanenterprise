import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const extensions = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

type RasterType = keyof typeof extensions;

export type WebsiteLogo = {
  bytes: Uint8Array;
  contentType: RasterType;
  ext: (typeof extensions)[RasterType];
};

const invalidWebsite = "Enter a website URL that starts with http://, https://, or www.";
const faviconFailed = "That website's favicon could not be used as the logo.";

export async function websiteFavicon(raw: string): Promise<WebsiteLogo | { error: string }> {
  const page = normalizeWebsite(raw);
  if (!page || !(await isPublicHttpUrl(page))) return { error: page ? faviconFailed : invalidWebsite };

  const home = await fetchPublic(page, "text/html,application/xhtml+xml,image/png,image/jpeg,image/webp,image/*;q=0.8");
  const iconList = home && isHtml(home.contentType, home.bytes) ? iconUrls(home.bytes, home.url) : fallbackIconUrls(page);
  if (home) {
    const direct = asRaster(home.bytes);
    if (direct) return direct;
  }
  for (const iconUrl of iconList) {
    const icon = await fetchPublic(iconUrl, "image/png,image/jpeg,image/webp,image/gif,image/x-icon,*/*;q=0.2");
    const raster = icon ? asRaster(icon.bytes) : null;
    if (raster) return raster;
  }

  const google = new URL(`https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(page.hostname)}`);
  const fallback = await fetchPublic(google, "image/png,image/*");
  const raster = fallback ? asRaster(fallback.bytes) : null;
  if (raster) return raster;
  return { error: faviconFailed };
}

function normalizeWebsite(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 500) return null;
  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== "80" && url.port !== "443") return null;
  const host = url.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return null;
  if (!host.includes(".") && !isIP(host)) return null;
  url.hash = "";
  return url;
}

async function isPublicHttpUrl(url: URL): Promise<boolean> {
  if (url.username || url.password) return false;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;
  if (isIP(host)) return !isBlockedIp(host);
  try {
    const records = await lookup(host, { all: true, verbatim: true });
    return records.length > 0 && records.every((record) => !isBlockedIp(record.address));
  } catch {
    return false;
  }
}

function isBlockedIp(address: string): boolean {
  const raw = address.toLowerCase().replace(/^\[|\]$/g, "");
  const ip = raw.startsWith("::ffff:") ? raw.slice("::ffff:".length) : raw;
  if (ip === "::" || ip === "::1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) return true;
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  const nums = parts.map((part) => Number(part));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = nums;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

async function fetchPublic(url: URL, accept: string) {
  let current = url;
  for (let hop = 0; hop < 4; hop += 1) {
    if (!(await isPublicHttpUrl(current))) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(current, {
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Accept: accept,
          "User-Agent": "Mozilla/5.0 (compatible; TitanEnterprise/1.0)",
        },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location) return null;
        current = new URL(location, current);
        continue;
      }
      if (!response.ok) return null;
      const bytes = await readLimited(response, 1024 * 1024);
      if (!bytes) return null;
      return {
        url: current,
        bytes,
        contentType: (response.headers.get("content-type") ?? "").toLowerCase(),
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function readLimited(response: Response, max: number) {
  if (!response.body) return null;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > max) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  if (total === 0) return null;
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function isHtml(contentType: string, bytes: Uint8Array) {
  if (contentType.includes("text/html") || contentType.includes("application/xhtml")) return true;
  const head = new TextDecoder().decode(bytes.subarray(0, 240)).trim().toLowerCase();
  return head.startsWith("<!doctype html") || head.startsWith("<html") || head.startsWith("<head");
}

function iconUrls(bytes: Uint8Array, pageUrl: URL) {
  const html = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, 300_000));
  const head = html.match(/<head[\s>][\s\S]*?<\/head>/i)?.[0] ?? html.slice(0, 80_000);
  const tags = head.match(/<link\b[^>]*>/gi) ?? [];
  const ranked: { url: URL; score: number }[] = [];
  for (const tag of tags) {
    const rel = attr(tag, "rel").toLowerCase();
    if (!rel.includes("icon")) continue;
    const href = decodeHtml(attr(tag, "href").trim());
    if (!href || href.startsWith("data:") || rel.includes("mask") || href.split("?")[0].toLowerCase().endsWith(".svg")) {
      continue;
    }
    let iconUrl: URL;
    try {
      iconUrl = new URL(href, pageUrl);
    } catch {
      continue;
    }
    if (iconUrl.protocol !== "http:" && iconUrl.protocol !== "https:") continue;
    const type = attr(tag, "type").toLowerCase();
    const sizes = attr(tag, "sizes").toLowerCase();
    let score = 10;
    if (rel.includes("apple-touch")) score += 100;
    if (type.includes("png") || /\.png($|\?)/i.test(href)) score += 40;
    if (type.includes("webp") || /\.webp($|\?)/i.test(href)) score += 35;
    if (type.includes("jpeg") || /\.jpe?g($|\?)/i.test(href)) score += 30;
    if (type.includes("gif") || /\.gif($|\?)/i.test(href)) score += 10;
    const size = sizes.match(/(\d+)\s*x\s*(\d+)/);
    if (size) score += Math.min(512, Number(size[1])) / 8;
    ranked.push({ url: iconUrl, score });
  }
  ranked.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const urls: URL[] = [];
  for (const item of ranked) {
    if (urls.length >= 3) break;
    if (seen.has(item.url.href)) continue;
    seen.add(item.url.href);
    urls.push(item.url);
  }
  for (const path of ["/apple-touch-icon.png", "/favicon-32x32.png", "/favicon.png", "/favicon.ico"]) {
    if (urls.length >= 6) break;
    const iconUrl = new URL(path, `${pageUrl.origin}/`);
    if (seen.has(iconUrl.href)) continue;
    seen.add(iconUrl.href);
    urls.push(iconUrl);
  }
  return urls;
}

function fallbackIconUrls(page: URL) {
  return ["/apple-touch-icon.png", "/favicon-32x32.png", "/favicon.png", "/favicon.ico"].map(
    (path) => new URL(path, `${page.origin}/`),
  );
}

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(String.raw`\b${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function asRaster(bytes: Uint8Array): WebsiteLogo | null {
  const kind = sniff(bytes);
  if (kind === "image/png" || kind === "image/jpeg" || kind === "image/webp" || kind === "image/gif") {
    return { bytes, contentType: kind, ext: extensions[kind] };
  }
  if (kind === "ico") {
    const png = pngFromIco(bytes);
    if (!png) return null;
    return { bytes: png, contentType: "image/png", ext: "png" };
  }
  return null;
}

function sniff(bytes: Uint8Array): RasterType | "ico" | "" {
  if (bytes.byteLength >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.byteLength >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.byteLength >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  if (bytes.byteLength >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes.byteLength >= 6 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) return "ico";
  return "";
}

function pngFromIco(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint16(4, true);
  if (count === 0 || count > 32) return null;
  let best: Uint8Array | null = null;
  let bestArea = 0;
  for (let index = 0; index < count; index += 1) {
    const entry = 6 + index * 16;
    if (entry + 16 > bytes.byteLength) break;
    const width = bytes[entry] || 256;
    const height = bytes[entry + 1] || 256;
    const size = view.getUint32(entry + 8, true);
    const offset = view.getUint32(entry + 12, true);
    if (size < 8 || offset + size > bytes.byteLength) continue;
    const image = bytes.subarray(offset, offset + size);
    if (sniff(image) !== "image/png") continue;
    const area = width * height;
    if (area < bestArea) continue;
    best = new Uint8Array(image);
    bestArea = area;
  }
  return best;
}
