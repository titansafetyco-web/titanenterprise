"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "@/app/login/actions";
import { AgentOnboardingFields } from "@/components/agent-onboarding-fields";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import { formatPhone } from "@/lib/phone";

const initialState: AuthState = { error: "", message: "" };

export function AuthForm({
  mode,
  next,
  rememberedEmail = "",
  programs = [],
}: {
  mode: "login" | "signup";
  next: string;
  rememberedEmail?: string;
  programs?: readonly { id: string; name: string }[];
}) {
  const locale = useLocale();
  const t = ui(locale);
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);
  const creating = mode === "signup";

  const accountFields = (
    <>
      {creating ? (
        <Field label={t.name} name="name" type="text" autoComplete="name" />
      ) : null}
      <Field
        label={t.email}
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={creating ? undefined : rememberedEmail}
      />
      {creating ? <PhoneField label={t.phone} /> : null}
      {creating ? (
        <label className="block">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t.role}
          </span>
          <select
            name="role"
            required
            defaultValue="agent"
            className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
          >
            <option value="agent">{t.roleAgent}</option>
            <option value="affiliate">{t.roleAffiliateOption}</option>
          </select>
        </label>
      ) : null}
      {creating ? (
        <PasswordFields
          passwordLabel={t.password}
          confirmLabel={t.confirmPassword}
          showLabel={t.showPassword}
          matchLabel={t.passwordsMatch}
        />
      ) : (
        <>
          <Field
            label={t.password}
            name="password"
            type="password"
            autoComplete="current-password"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                name="remember"
                value="1"
                defaultChecked={Boolean(rememberedEmail)}
                className="size-4 accent-ink"
              />
              {t.rememberMe}
            </label>
            <Link href="/forgot" className="text-sm text-foreground underline">
              {t.forgotPassword}
            </Link>
          </div>
        </>
      )}
    </>
  );

  return (
    <form action={formAction} className={creating ? "mt-8" : "mt-8 space-y-5"}>
      <input type="hidden" name="next" value={next} />
      {creating ? (
        <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-8">
          <section className="space-y-5 border border-line bg-white p-5 md:p-8">
            {accountFields}
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
              {pending ? t.pleaseWait : t.createAccount}
            </button>
            <p className="text-sm text-muted">
              {t.already}{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-foreground underline">
                {t.signIn}
              </Link>
            </p>
          </section>
          <section className="border border-line bg-white p-5 md:p-8">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {t.onboarding}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide">
              {t.agentOnboarding}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t.agentOnboardingLead}</p>
            <div className="mt-6">
              {programs.length === 0 ? (
                <p className="text-sm text-muted">{t.noPrograms}</p>
              ) : (
                <AgentOnboardingFields programs={programs} />
              )}
            </div>
          </section>
        </div>
      ) : (
        <>
          {accountFields}
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
            {pending ? t.pleaseWait : t.signIn}
          </button>
          <p className="text-sm text-muted">
            {t.newHere}{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-foreground underline">
              {t.createAccount}
            </Link>
          </p>
        </>
      )}
    </form>
  );
}

function PhoneField({ label }: { label: string }) {
  const [phone, setPhone] = useState("");

  return (
    <label className="block">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <input
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        placeholder="(555) 555-0100"
        value={phone}
        onChange={(event) => setPhone(formatPhone(event.target.value))}
        className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
      />
    </label>
  );
}

export function PasswordFields({
  passwordLabel,
  confirmLabel,
  showLabel,
  matchLabel,
}: {
  passwordLabel: string;
  confirmLabel: string;
  showLabel: string;
  matchLabel: string;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const matched = password.length > 0 && password === confirm;
  const inputType = visible ? "text" : "password";
  const inputClass =
    "mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent";

  return (
    <>
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {passwordLabel}
        </span>
        <input
          name="password"
          type={inputType}
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {confirmLabel}
        </span>
        <span className="relative block">
          <input
            name="confirm"
            type={inputType}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className={`${inputClass} ${matched ? "pr-11" : ""}`}
          />
          {matched ? (
            <span
              role="img"
              aria-label={matchLabel}
              className="pointer-events-none absolute bottom-0 right-3 flex h-[50px] items-center text-[#16803c]"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M4 10.5l4 4 8-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : null}
        </span>
      </label>
      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={visible}
          onChange={(event) => setVisible(event.target.checked)}
          className="size-4 accent-ink"
        />
        {showLabel}
      </label>
    </>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        defaultValue={defaultValue}
        className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
      />
    </label>
  );
}
