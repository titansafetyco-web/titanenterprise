import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { catalog } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

function Seal({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex w-14 flex-col items-center gap-1.5">
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="#f5c400"
          strokeWidth="1.5"
        />
        <circle
          cx="32"
          cy="32"
          r="25.5"
          fill="none"
          stroke="white"
          strokeWidth="0.75"
          opacity="0.55"
        />
        {children}
      </svg>
      <span className="text-center font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
        {label}
      </span>
    </li>
  );
}

export async function Footer({ name }: { name: string }) {
  const locale = await getLocale();
  const t = ui(locale);
  const { site } = catalog(locale);
  const policies = [
    { href: "/terms", label: t.terms },
    { href: "/privacy", label: t.privacy },
    { href: "/affiliate-policy", label: t.affiliatePolicy },
    { href: "/payout-policy", label: t.payoutPolicy },
  ];

  return (
    <footer className="border-t-4 border-accent bg-ink text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-6 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-10">
        <div className="mx-auto flex max-w-sm flex-col items-center text-center sm:mx-0 sm:items-start sm:text-left">
          <Image
            src="/logo-mark.png"
            alt={name}
            width={787}
            height={271}
            unoptimized
            className="h-28 w-auto max-w-full bg-transparent"
          />
          <p className="mt-3 text-sm leading-snug text-white/70">
            {t.footerBlurb}
          </p>
          <p className="mt-3 text-xs leading-snug text-white/55">
            {t.footerDisclaimer}
          </p>
          <p className="mt-3 text-xs leading-snug text-white/55">
            {t.footerCopyright.replace("{name}", name)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between sm:-my-3 sm:h-full sm:w-auto sm:flex-col sm:self-stretch">
            <ul className="flex justify-center gap-3 sm:translate-y-8" aria-label="Assurances">
            <Seal label={t.safety}>
              <path
                d="M32 16.5 45.5 22v9.8c0 7.6-5.8 13.6-13.5 17.2C24.3 45.4 18.5 39.4 18.5 31.8V22L32 16.5z"
                fill="none"
                stroke="white"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M26.2 32.2 30.1 36.2 38.2 27"
                fill="none"
                stroke="#f5c400"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Seal>
            <Seal label={t.licensed}>
              <rect
                x="22"
                y="18"
                width="20"
                height="26"
                rx="1.5"
                fill="none"
                stroke="white"
                strokeWidth="1.6"
              />
              <path
                d="M26 25.5h12M26 30h12M26 34.5h8"
                fill="none"
                stroke="#f5c400"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="38.5" cy="39.5" r="3.2" fill="#f5c400" />
            </Seal>
            </ul>
            <ul className="flex flex-col items-center gap-2 sm:translate-y-6" aria-label={t.socials}>
              <li>
                <a
                  href="https://www.instagram.com/titan.enterprise_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-white"
                >
                  <InstagramIcon />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@titan.enterprise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-white"
                >
                  <TikTokIcon />
                  TikTok
                </a>
              </li>
            </ul>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:justify-self-end">
        <nav aria-label="Footer" className="sm:-translate-x-4">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t.explore}
          </p>
          <ul className="mt-3 space-y-2">
            {site.nav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/80 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="text-sm text-white/80 transition-colors hover:text-accent"
              >
                {t.memberLogin}
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Policies">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t.policies}
          </p>
          <ul className="mt-3 space-y-2">
            {policies.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/80 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.5 3h2.1a5.2 5.2 0 0 0 3.9 3.7v2.2a7.3 7.3 0 0 1-3.9-1.1v6.7a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.3a3.3 3.3 0 1 0 2.3 3.2V3z"
      />
    </svg>
  );
}
