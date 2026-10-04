"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword, type PasswordState } from "@/app/reset-password/actions";
import { PasswordFields } from "@/components/auth-form";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

const initialState: PasswordState = { error: "", message: "" };

export function ResetForm() {
  const locale = useLocale();
  const t = ui(locale);
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <PasswordFields
        passwordLabel={t.newPassword}
        confirmLabel={t.confirmPassword}
        showLabel={t.showPassword}
        matchLabel={t.passwordsMatch}
      />
      {state.error ? (
        <p className="border-l-4 border-accent pl-3 text-sm text-foreground">
          {localizeError(locale, state.error)}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
      >
        {pending ? t.pleaseWait : t.savePassword}
      </button>
      <p className="text-sm text-muted">
        <Link href="/forgot" className="text-foreground underline">
          {t.forgotPassword}
        </Link>
      </p>
    </form>
  );
}
