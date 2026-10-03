import Link from "next/link";
import { site } from "@/lib/site";

const policies = [
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy", label: "Privacy policy" },
] as const;

export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t-4 border-accent bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-display text-2xl font-bold uppercase tracking-wide">
            {name}
          </p>
          <span className="mt-4 block h-1 w-12 bg-accent" aria-hidden="true" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            Connecting people with essential products and services, and helping
            partners turn that demand into business.
          </p>
          <a
            href="https://www.instagram.com/titan.safetyco/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-accent"
          >
            <InstagramIcon />
            Instagram
          </a>
        </div>
        <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Explore
          </p>
          <ul className="mt-4 space-y-3">
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
          </ul>
        </nav>
        <nav aria-label="Policies" className="lg:col-span-3">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Policies
          </p>
          <ul className="mt-4 space-y-3">
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
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-6 py-5 font-display text-xs uppercase tracking-[0.16em] text-white/50">
          © 2026 {name}
        </p>
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
