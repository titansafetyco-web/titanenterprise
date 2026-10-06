"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n/ui";

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
  const t = ui(useLocale());
  const onDashboard = pathname.startsWith("/dashboard");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
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
            className="h-14 w-auto bg-transparent lg:h-16"
          />
        </Link>
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="inline-flex items-center gap-2 border border-ink px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="primary-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon open={open} />
            {open ? t.close : t.menu}
          </button>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-x-5 lg:flex"
          >
            <PrimaryLinks
              links={links}
              pathname={pathname}
              onHomeClick={onHomeClick}
              account={account}
              onAdmin={onDashboard}
              signOut={signOut}
            />
          </nav>
          <div className="hidden shrink-0 lg:block">
            <LanguageToggle />
          </div>
        </div>
      </div>
      {open ? (
        <nav
          id="primary-menu"
          aria-label="Primary"
          className="absolute inset-x-0 top-full z-30 border-t border-white/40 bg-white/75 px-6 py-4 shadow-[0_18px_40px_rgba(16,24,32,0.12)] backdrop-blur-md lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-1">
            <div className="mb-4 border-b border-white/50 pb-4">
              <LanguageToggle />
            </div>
            <PrimaryLinks
              links={links}
              pathname={pathname}
              onHomeClick={onHomeClick}
              account={account}
              onAdmin={onDashboard}
              signOut={signOut}
              stacked
              onNavigate={() => setOpen(false)}
            />
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function PrimaryLinks({
  links,
  pathname,
  onHomeClick,
  account,
  onAdmin,
  signOut,
  stacked = false,
  onNavigate,
}: {
  links: readonly NavLink[];
  pathname: string;
  onHomeClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  account: { name: string } | null;
  onAdmin: boolean;
  signOut: () => Promise<void>;
  stacked?: boolean;
  onNavigate?: () => void;
}) {
  const t = ui(useLocale());
  const textLink = `whitespace-nowrap font-display text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent ${
    stacked ? "block py-2" : ""
  }`;
  const opportunitiesLink = links.find((link) => link.href === "/#opportunities");
  const workLink = links.find((link) => link.href === "/#work");
  const baseLinks = links.filter(
    (link) => link.href !== "/#opportunities" && link.href !== "/#work",
  );

  return (
    <>
      {pathname !== "/" ? (
        <Link
          href="/"
          scroll
          onClick={(event) => {
            onHomeClick(event);
            onNavigate?.();
          }}
          className={`${textLink} text-foreground`}
        >
          {t.home}
        </Link>
      ) : null}
      {stacked ? (
        <>
          {opportunitiesLink ? (
            <Link
              href={opportunitiesLink.href}
              aria-current={pathname === opportunitiesLink.href ? "page" : undefined}
              onClick={onNavigate}
              className={`${textLink} ${
                pathname === opportunitiesLink.href ? "text-accent" : "text-foreground"
              }`}
            >
              {opportunitiesLink.label}
            </Link>
          ) : null}
          {workLink ? (
            <Link
              href={workLink.href}
              aria-current={pathname === workLink.href ? "page" : undefined}
              onClick={onNavigate}
              className={`${textLink} ${
                pathname === workLink.href ? "text-accent" : "text-foreground"
              }`}
            >
              {workLink.label}
            </Link>
          ) : null}
        </>
      ) : opportunitiesLink ? (
        <div className="group relative">
          <Link
            href={opportunitiesLink.href}
            aria-current={pathname === opportunitiesLink.href ? "page" : undefined}
            onClick={onNavigate}
            className={`${textLink} inline-flex items-center gap-1 ${
              pathname === opportunitiesLink.href ? "text-accent" : "text-foreground"
            }`}
          >
            {opportunitiesLink.label}
            <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
              <path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Link>
          <div className="invisible absolute left-0 top-full z-20 mt-2 min-w-[13rem] border border-line bg-white p-2 opacity-0 shadow-[0_12px_24px_rgba(16,24,32,0.12)] transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            <Link
              href={opportunitiesLink.href}
              onClick={onNavigate}
              className="block px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-canvas hover:text-accent"
            >
              {opportunitiesLink.label}
            </Link>
            {workLink ? (
              <Link
                href={workLink.href}
                onClick={onNavigate}
                className="block px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-canvas hover:text-accent"
              >
                {workLink.label}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      {baseLinks.map((link) =>
        link.href === "/affiliate" ? (
          <Link
            key={link.href}
            href={account ? "/jobs" : link.href}
            aria-current={
              account
                ? pathname.startsWith("/jobs")
                  ? "page"
                  : undefined
                : pathname === link.href
                  ? "page"
                  : undefined
            }
            onClick={onNavigate}
            className={`shrink-0 whitespace-nowrap px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              stacked ? "my-1" : ""
            } ${
              (account ? pathname.startsWith("/jobs") : pathname === link.href)
                ? "bg-ink text-white"
                : "border border-ink text-ink hover:bg-ink hover:text-white"
            }`}
          >
            {account ? t.jobMarketplace : link.label}
          </Link>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            onClick={onNavigate}
            className={`${textLink} ${
              pathname === link.href ? "text-accent" : "text-foreground"
            }`}
          >
            {link.label}
          </Link>
        ),
      )}
      {account ? (
        <>
          <Link
            href="/dashboard"
            aria-current={onAdmin ? "page" : undefined}
            onClick={onNavigate}
            className={`shrink-0 whitespace-nowrap px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              stacked ? "my-1" : ""
            } ${
              onAdmin
                ? "bg-ink text-white"
                : "bg-accent text-ink hover:bg-[#e0b400]"
            }`}
          >
            {t.dashboard}
          </Link>
          <form action={signOut} className="shrink-0">
            <button
              type="submit"
              className={`${textLink} whitespace-nowrap text-foreground`}
            >
              {t.signOut}
            </button>
          </form>
        </>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className={`${textLink} text-foreground`}
        >
          {t.signIn}
        </Link>
      )}
    </>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 14" className="h-3 w-4" aria-hidden="true">
      {open ? (
        <path
          d="M1 1l18 12M19 1L1 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M0 1h20M0 7h20M0 13h20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
