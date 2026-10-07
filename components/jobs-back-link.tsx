"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "jobs-back-link";

export function JobsBackLink({ locale }: { locale: string }) {
  const [href, setHref] = useState("/dashboard");

  useEffect(() => {
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    let target = "";

    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin) {
          const refPath = `${refUrl.pathname}${refUrl.search}${refUrl.hash}`;
          if (refPath && refPath !== current && refPath !== "/jobs") {
            target = refPath;
          }
        }
      } catch {
        // Ignore invalid referrers.
      }
    }

    if (!target) {
      target = window.sessionStorage.getItem(STORAGE_KEY) || "/dashboard";
    }

    setHref(target);
    window.sessionStorage.setItem(STORAGE_KEY, target);
  }, []);

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-accent"
    >
      <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" aria-hidden="true">
        <path
          d="M8.75 2.5 4.25 7l4.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{locale === "es" ? "Volver" : "Back"}</span>
    </Link>
  );
}
