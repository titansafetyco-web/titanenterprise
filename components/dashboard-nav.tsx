"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { markNavSeenAction } from "@/app/dashboard/alert-actions";
import { initials } from "@/lib/avatar";
import { useLocale } from "@/components/locale-provider";
import type { DashboardAlerts } from "@/lib/alerts";
import { ui } from "@/lib/i18n/ui";

function AlertDot({ label }: { label: string }) {
  return (
    <span className="inline-flex">
      <span className="size-2 shrink-0 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function DashboardNav({
  admin,
  alerts,
  name,
  photo,
}: {
  admin: boolean;
  alerts: DashboardAlerts;
  name: string;
  photo: string;
}) {
  const t = ui(useLocale());
  const pathname = usePathname();
  const [cleared, setCleared] = useState({ messages: false, wallet: false });
  const marketplace = admin
    ? [
        { href: "/dashboard/listing", label: t.addJob },
        { href: "/dashboard/jobs", label: t.yourJobs },
        { href: "/dashboard/onboarding", label: t.yourOnboarding },
      ]
    : [
        { href: "/jobs", label: t.marketplace },
        { href: "/dashboard/jobs", label: t.myJobs },
        { href: "/dashboard/wallet", label: t.earnings },
        { href: "/dashboard/payouts", label: t.payoutsNav },
        { href: "/dashboard/training", label: t.training },
        { href: "/dashboard/onboarding", label: t.yourOnboarding },
      ];
  const sections = admin
    ? [
        { href: "/dashboard/messages", label: t.messages },
        { href: "/dashboard/team", label: t.teamMembers },
        { href: "/dashboard/analytics", label: t.analytics },
        { href: "/dashboard/wallet", label: t.wallet },
      ]
    : [];
  const childOpen = marketplace.some((link) => pathname === link.href);
  const [open, setOpen] = useState(childOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (childOpen) setOpen(true);
  }, [childOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/dashboard/messages") {
      setCleared((current) => ({ ...current, messages: true }));
      markNavSeenAction("messages");
    }
    if (pathname === "/dashboard/wallet") {
      setCleared((current) => ({ ...current, wallet: true }));
      markNavSeenAction("wallet");
    }
  }, [pathname]);

  const lit = {
    messages: alerts.messages && !cleared.messages && pathname !== "/dashboard/messages",
    team: alerts.team,
    wallet: alerts.wallet && !cleared.wallet && pathname !== "/dashboard/wallet",
    onboarding: alerts.onboarding,
  };

  function itemClass(active: boolean) {
    return `inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-l-[3px] px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-canvas hover:text-foreground ${
      active
        ? "border-accent bg-canvas text-foreground"
        : "border-transparent text-muted"
    }`;
  }

  function label(text: string, alert: boolean) {
    return (
      <>
        <span>{text}</span>
        {alert ? <AlertDot label={t.newAlert} /> : null}
      </>
    );
  }

  const settingsActive = pathname === "/dashboard/settings";

  return (
    <aside className="flex flex-col border-b border-line bg-white lg:w-60 lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
      <div className="flex flex-col lg:sticky lg:top-24 lg:z-10 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto">
        <p className="hidden px-6 pt-8 font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent lg:block">
          {t.dashboard}
        </p>
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 pt-3 lg:hidden">
          <Link
            href="/dashboard/settings"
            aria-current={settingsActive ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center justify-self-start rounded-sm px-3 font-display text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              settingsActive
                ? "bg-canvas text-foreground"
                : "bg-white text-muted hover:bg-canvas hover:text-foreground"
            }`}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M8.9 2h2.2l.5 2a6 6 0 0 1 1.5.6l1.8-1 1.6 1.6-1 1.8c.3.5.5 1 .6 1.5l2 .5v2.2l-2 .5a6 6 0 0 1-.6 1.5l1 1.8-1.6 1.6-1.8-1a6 6 0 0 1-1.5.6l-.5 2H8.9l-.5-2a6 6 0 0 1-1.5-.6l-1.8 1-1.6-1.6 1-1.8a6 6 0 0 1-.6-1.5l-2-.5V8.9l2-.5c.1-.5.3-1 .6-1.5l-1-1.8 1.6-1.6 1.8 1a6 6 0 0 1 1.5-.6z" />
              <circle cx="10" cy="10" r="2.4" />
            </svg>
            <span className="sr-only">{admin ? t.settings : t.profile}</span>
          </Link>
          <p className="justify-self-center text-center font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {admin ? t.roleAdmin : t.roleMember}
          </p>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="dashboard-mobile-menu"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex min-h-11 items-center justify-center justify-self-end gap-2 border border-accent bg-accent px-4 font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-[#e0b400]"
          >
            <span>{mobileOpen ? t.close : `${t.dashboard} ${t.menu}`}</span>
            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              className={`h-3 w-3 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M2 4.5 6 8l4-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          {mobileOpen ? (
            <nav
              id="dashboard-mobile-menu"
              aria-label={t.dashboard}
              className="absolute left-3 right-3 top-full z-30 mt-2 border border-line bg-white p-2 shadow-[0_12px_24px_rgba(16,24,32,0.14)]"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href="/dashboard"
                  aria-current={pathname === "/dashboard" ? "page" : undefined}
                  className={itemClass(pathname === "/dashboard")}
                >
                  {label(t.overview, false)}
                </Link>
                <div>
                  <div className="flex items-stretch">
                    <Link
                      href="/jobs"
                      aria-current={pathname.startsWith("/jobs") ? "page" : undefined}
                      className={`${itemClass(pathname.startsWith("/jobs"))} min-w-0 flex-1`}
                    >
                      {label(admin ? t.jobMarketplace : t.marketplace, lit.onboarding && !open)}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls="job-marketplace-menu-mobile"
                      onClick={() => setOpen((value) => !value)}
                      className="shrink-0 border-l-[3px] border-transparent px-2 text-muted transition-colors hover:bg-canvas hover:text-foreground"
                    >
                      <span className="sr-only">{open ? t.close : t.menu}</span>
                      <svg
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                        className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
                      >
                        <path
                          d="M2 4.5 6 8l4-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </button>
                  </div>
                  {open ? (
                    <div id="job-marketplace-menu-mobile" className="ml-3 flex flex-col border-l border-line">
                      {marketplace.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          aria-current={pathname === link.href ? "page" : undefined}
                          className={itemClass(pathname === link.href)}
                        >
                          {label(link.label, link.href === "/dashboard/onboarding" && lit.onboarding)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
                {sections.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={itemClass(pathname === link.href)}
                  >
                    {label(
                      link.label,
                      (link.href === "/dashboard/messages" && lit.messages) ||
                        (link.href === "/dashboard/team" && lit.team) ||
                        (link.href === "/dashboard/wallet" && lit.wallet),
                    )}
                  </Link>
                ))}
              </div>
            </nav>
          ) : null}
        </div>
        <nav
          aria-label={t.dashboard}
          className="hidden lg:flex lg:flex-col lg:gap-1 lg:overflow-visible lg:px-3 lg:pb-2 lg:pt-6"
        >
          <Link
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            className={itemClass(pathname === "/dashboard")}
          >
            {label(t.overview, false)}
          </Link>
          <div>
            <div className="flex items-stretch">
              <Link
                href="/jobs"
                aria-current={pathname.startsWith("/jobs") ? "page" : undefined}
                className={`${itemClass(pathname.startsWith("/jobs"))} min-w-0 flex-1`}
              >
                {label(admin ? t.jobMarketplace : t.marketplace, lit.onboarding && !open)}
              </Link>
              <button
                type="button"
                aria-expanded={open}
                aria-controls="job-marketplace-menu"
                onClick={() => setOpen((value) => !value)}
                className="shrink-0 border-l-[3px] border-transparent px-2 text-muted transition-colors hover:bg-canvas hover:text-foreground"
              >
                <span className="sr-only">{open ? t.close : t.menu}</span>
                <svg
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                  className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
                >
                  <path
                    d="M2 4.5 6 8l4-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>
            {open ? (
              <div
                id="job-marketplace-menu"
                className="lg:ml-3 lg:flex lg:flex-col lg:border-l lg:border-line"
              >
                {marketplace.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={itemClass(pathname === link.href)}
                  >
                    {label(link.label, link.href === "/dashboard/onboarding" && lit.onboarding)}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mx-3 my-2 hidden border-t border-line lg:block" />
          {sections.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={itemClass(pathname === link.href)}
            >
              {label(
                link.label,
                (link.href === "/dashboard/messages" && lit.messages) ||
                  (link.href === "/dashboard/team" && lit.team) ||
                  (link.href === "/dashboard/wallet" && lit.wallet),
              )}
            </Link>
          ))}
        </nav>
        <Link
          href="/dashboard/settings"
          aria-current={settingsActive ? "page" : undefined}
          className={`mx-3 mb-4 hidden items-center gap-3 px-4 py-2.5 transition-colors hover:bg-canvas lg:flex ${
            settingsActive ? "border-l-[3px] border-l-accent bg-canvas" : "border-l-[3px] border-l-transparent"
          }`}
        >
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-ink font-display text-xs font-semibold tracking-wide text-accent">
            {photo ? (
              <Image src={photo} alt="" width={40} height={40} className="size-10 object-cover" />
            ) : (
              initials(name)
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold uppercase tracking-wide">
              {name}
            </span>
            <span className="mt-0.5 block text-muted">
              <span className="inline-flex lg:hidden" aria-hidden="true">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M8.9 2h2.2l.5 2a6 6 0 0 1 1.5.6l1.8-1 1.6 1.6-1 1.8c.3.5.5 1 .6 1.5l2 .5v2.2l-2 .5a6 6 0 0 1-.6 1.5l1 1.8-1.6 1.6-1.8-1a6 6 0 0 1-1.5.6l-.5 2H8.9l-.5-2a6 6 0 0 1-1.5-.6l-1.8 1-1.6-1.6 1-1.8a6 6 0 0 1-.6-1.5l-2-.5V8.9l2-.5c.1-.5.3-1 .6-1.5l-1-1.8 1.6-1.6 1.8 1a6 6 0 0 1 1.5-.6z" />
                  <circle cx="10" cy="10" r="2.4" />
                </svg>
              </span>
              <span className="hidden font-display text-[11px] font-semibold uppercase tracking-[0.14em] lg:block">
                {admin ? t.settings : t.profile}
              </span>
              <span className="sr-only">{admin ? t.settings : t.profile}</span>
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
