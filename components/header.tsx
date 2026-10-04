"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

export function Header({
  name,
  links,
  account,
  signOut,
}: {
  name: string;
  links: readonly NavLink[];
  account: { name: string } | null;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onHomeClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    event.preventDefault();
    if (window.location.hash) {
      window.history.pushState(null, "", "/");
    }
    window.scrollTo(0, 0);
  }

  return (
    <header
      className={`sticky top-0 z-20 border-b border-line bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_0_rgba(16,24,32,0.08)]" : "shadow-none"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          scroll
          onClick={onHomeClick}
          className="inline-flex shrink-0 items-center"
        >
          <Image
            src="/logo-mark.png"
            alt={name}
            width={763}
            height={247}
            priority
            className="h-14 w-auto bg-transparent sm:h-16"
          />
        </Link>
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center justify-between gap-3 sm:justify-start sm:gap-7"
        >
          {pathname !== "/" ? (
            <Link
              href="/"
              scroll
              onClick={onHomeClick}
              className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-accent"
            >
              Home
            </Link>
          ) : null}
          {links.map((link) =>
            link.href === "/affiliate" ? (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  pathname === link.href
                    ? "bg-ink text-white"
                    : "border border-ink text-ink hover:bg-ink hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`font-display text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent ${
                  pathname === link.href ? "text-accent" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
          {account ? (
            <>
              <span className="text-sm text-muted">{account.name}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground hover:text-accent"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-accent"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/admin"
            aria-current={onAdmin ? "page" : undefined}
            className={`px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              onAdmin
                ? "bg-ink text-white"
                : "bg-accent text-ink hover:bg-[#e0b400]"
            }`}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
