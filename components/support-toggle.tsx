"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSupportPresence } from "@/app/dashboard/messages/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

export function SupportToggle({ online }: { online: boolean }) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const busy = useRef(false);

  function flip() {
    if (busy.current) return;
    busy.current = true;
    setError("");
    const formData = new FormData();
    formData.set("online", online ? "0" : "1");
    start(async () => {
      const result = await setSupportPresence(formData);
      busy.current = false;
      if (result) {
        setError(localizeError(locale, result));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={flip}
        disabled={pending}
        aria-pressed={online}
        aria-label={online ? t.adminOnline : t.adminOffline}
        className="inline-flex items-center gap-3 border border-line bg-white px-4 py-2 disabled:opacity-60"
      >
        <span
          className={`relative h-6 w-11 rounded-full ${online ? "bg-[#22c55e]" : "bg-[#c4322a]"}`}
          aria-hidden="true"
        >
          <span className={`absolute top-0.5 size-5 rounded-full bg-white ${online ? "left-5" : "left-0.5"}`} />
        </span>
        <span className="font-display text-sm font-semibold uppercase tracking-wider">
          {online ? t.online : t.offline}
        </span>
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
