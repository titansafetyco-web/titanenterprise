"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestReset, type ResetState } from "@/app/forgot/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

const initialState: ResetState = { error: "", message: "" };

export function ForgotForm() {
  const locale = useLocale();
  const t = ui(locale);
  const [state, formAction, pending] = useActionState(requestReset, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.email}
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        />
      </label>
      {state.error ? (
        <p className="border-l-4 border-accent pl-3 text-sm text-foreground">
          {localizeError(locale, state.error)}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="border-l-4 border-accent pl-3 text-sm text-foreground">
          {localizeError(locale, state.message)}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
      >
        {pending ? t.pleaseWait : t.sendReset}
      </button>
      <p className="text-sm text-muted">
        <Link href="/login" className="text-foreground underline">
          {t.signIn}
        </Link>
      </p>
    </form>
  );
}
