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

function HelpIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" />
      <path d="M7.7 7.8a2.35 2.35 0 1 1 3.15 2.2c-.65.35-1.05.8-1.05 1.55" strokeLinecap="round" />
      <circle cx="9.8" cy="14.15" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
  role,
  alerts,
  name,
  photo,
}: {
  admin: boolean;
  role: string;
  alerts: DashboardAlerts;
  name: string;
  photo: string;
}) {
  const t = ui(useLocale());
  const roleLabel =
    role === "admin"
      ? t.roleAdmin
      : role === "agent"
        ? t.roleAgent
        : role === "team"
          ? t.roleTeam
          : role === "member"
            ? t.roleMember
            : t.roleAffiliate;
  const pathname = usePathname();
  const [cleared, setCleared] = useState({ messages: false, wallet: false });
  const marketplace = admin
    ? [
        { href: "/dashboard/listing", label: t.addJob },
        { href: "/dashboard/jobs", label: t.yourJobs },
        { href: "/dashboard/reviews", label: t.jobReviews },
        { href: "/dashboard/leaderboard", label: t.leaderboard },
      ]
    : [
        { href: "/jobs", label: t.marketplace },
        { href: "/dashboard/jobs", label: t.myJobs },
        { href: "/dashboard/wallet", label: t.earnings },
        { href: "/dashboard/payouts", label: t.payoutsNav },
        { href: "/dashboard/training", label: t.training },
        { href: "/dashboard/leaderboard", label: t.leaderboard },
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
    return `inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
      active
        ? "bg-[#fff4d2] text-[#1c160c] shadow-[inset_3px_0_0_#e0b000]"
        : "text-[#6e5c43] hover:bg-[#f3e6c8] hover:text-[#2a2116]"
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

  function openHelp() {
    window.dispatchEvent(new Event("titan-open-support"));
    setMobileOpen(false);
  }

  return (
    <aside className="flex flex-col border-b border-[#e7dcc4] bg-[#fbf6ec] lg:w-60 lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
      <div className="flex flex-col lg:sticky lg:top-24 lg:z-10 lg:max-h-[calc(100svh-6rem)] lg:min-h-[calc(100svh-6rem)] lg:overflow-y-auto">
        <p className="hidden px-6 pt-7 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7200] lg:block">
          {t.dashboard}
        </p>
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 pt-3 lg:hidden">
          <Link
            href="/dashboard/settings"
            aria-current={settingsActive ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center justify-self-start rounded-md px-3 font-display text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              settingsActive
                ? "bg-[#fff4d2] text-[#1c160c]"
                : "bg-[#fffaf1] text-[#6e5c43] hover:bg-[#f3e6c8] hover:text-[#2a2116]"
            }`}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M8.9 2h2.2l.5 2a6 6 0 0 1 1.5.6l1.8-1 1.6 1.6-1 1.8c.3.5.5 1 .6 1.5l2 .5v2.2l-2 .5a6 6 0 0 1-.6 1.5l1 1.8-1.6 1.6-1.8-1a6 6 0 0 1-1.5.6l-.5 2H8.9l-.5-2a6 6 0 0 1-1.5-.6l-1.8 1-1.6-1.6 1-1.8a6 6 0 0 1-.6-1.5l-2-.5V8.9l2-.5c.1-.5.3-1 .6-1.5l-1-1.8 1.6-1.6 1.8 1a6 6 0 0 1 1.5-.6z" />
              <circle cx="10" cy="10" r="2.4" />
            </svg>
            <span className="sr-only">{admin ? t.settings : t.profile}</span>
          </Link>
          <p className="justify-self-center text-center font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e5c43]">
            {roleLabel}
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
              className="absolute left-3 right-3 top-full z-30 mt-2 rounded-lg border border-[#e7dcc4] bg-[#fbf6ec] p-2 shadow-[0_16px_32px_rgba(62,42,12,0.12)]"
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
                  <div className="flex items-center gap-1">
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
                      className="grid size-8 shrink-0 place-items-center rounded-md text-[#6e5c43] transition-colors hover:bg-[#f3e6c8] hover:text-[#2a2116]"
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
                    <div id="job-marketplace-menu-mobile" className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-[#e4d3ae] pl-2">
                      {marketplace.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          aria-current={pathname === link.href ? "page" : undefined}
                          className={itemClass(pathname === link.href)}
                        >
                          {label(link.label, false)}
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
                <button type="button" onClick={openHelp} className={itemClass(false)}>
                  <HelpIcon />
                  {t.help}
                </button>
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
            <div className="flex items-center gap-1">
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
                className="grid size-8 shrink-0 place-items-center rounded-md text-[#6e5c43] transition-colors hover:bg-[#f3e6c8] hover:text-[#2a2116]"
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
                className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-[#e4d3ae] pl-2"
              >
                {marketplace.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={itemClass(pathname === link.href)}
                  >
                    {label(link.label, false)}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mx-3 my-3 hidden border-t border-[#e4d3ae] lg:block" />
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
        <div className="mx-3 mb-5 mt-auto hidden flex-col gap-2 lg:flex">
          <button type="button" onClick={openHelp} className={`${itemClass(false)} w-full justify-start`}>
            <HelpIcon />
            {t.help}
          </button>
          <Link
            href="/dashboard/settings"
            aria-current={settingsActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
              settingsActive ? "bg-[#fff4d2] shadow-[inset_3px_0_0_#e0b000]" : "bg-[#fffaf1] hover:bg-[#f3e6c8]"
            }`}
          >
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1c160c] font-display text-xs font-semibold tracking-wide text-[#f5c400] ring-2 ring-[#f0c431]">
            {photo ? (
              <Image src={photo} alt="" width={40} height={40} className="size-10 object-cover" />
            ) : (
              initials(name)
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold uppercase tracking-wide text-[#1c160c]">
              {name}
            </span>
            <span className="mt-0.5 block text-[#6e5c43]">
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
      </div>
    </aside>
  );
}
