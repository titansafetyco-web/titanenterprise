"use client";

import { setLocale } from "@/app/locale/actions";
import { useLocale } from "@/components/locale-provider";

const options = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
] as const;

export function LanguageToggle() {
  const locale = useLocale();

  return (
    <form
      action={setLocale}
      aria-label="Language"
      className="inline-flex border border-ink p-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.16em]"
    >
      {options.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="submit"
            name="locale"
            value={option.value}
            aria-pressed={active}
            className={`min-w-9 px-2.5 py-1 transition-colors ${
              active ? "bg-accent text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </form>
  );
}
