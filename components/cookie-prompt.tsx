"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "titan-cookie-choice";

export function CookiePrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function choose(value: "allowed" | "declined") {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed bottom-5 left-5 z-30 w-[min(22rem,calc(100vw-6.5rem))] rounded-3xl border border-line bg-white px-5 py-5 text-foreground shadow-[0_16px_40px_rgba(16,24,32,0.16)]"
    >
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Cookies
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Titan Safety Co. can store one cookie to remember whether you allow
          it. Allow keeps that choice. Decline continues without it.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="border border-line px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-foreground"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("allowed")}
            className="bg-accent px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400]"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
