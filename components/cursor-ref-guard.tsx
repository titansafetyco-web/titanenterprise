"use client";

import { useServerInsertedHTML } from "next/navigation";

const source = `(() => {
  if (window.__titanCursorGuard) return;
  window.__titanCursorGuard = true;
  const names = ["data-cursor-ref", "data-cursor-element-id"];
  const strip = (node) => {
    if (!node || node.nodeType !== 1) return;
    for (const name of names) {
      if (node.hasAttribute(name)) node.removeAttribute(name);
    }
  };
  const walk = (node) => {
    strip(node);
    if (!node.querySelectorAll) return;
    for (const child of node.querySelectorAll("[data-cursor-ref],[data-cursor-element-id]")) strip(child);
  };
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") strip(record.target);
      for (const node of record.addedNodes) walk(node);
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: names,
  });
  walk(document.documentElement);
  const stop = () => observer.disconnect();
  window.addEventListener("pointerdown", stop, { capture: true, once: true });
  setTimeout(stop, 8000);
})();`;

export function CursorRefGuard() {
  useServerInsertedHTML(() => {
    if (process.env.NODE_ENV !== "development") return null;
    return <script dangerouslySetInnerHTML={{ __html: source }} />;
  });

  return null;
}
