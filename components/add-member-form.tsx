"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { addMemberAction, type MemberState } from "@/app/dashboard/team/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import { formatPhone } from "@/lib/phone";

const initialState: MemberState = { error: "" };

export function AddMemberForm({
  admin,
  teamCount,
  memberCount,
}: {
  admin: boolean;
  teamCount: number;
  memberCount: number;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addMemberAction, initialState);
  const wasPending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const field =
    "mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent";
  const label = "font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted";

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      setPhone("");
      setOpen(false);
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, router, state.error]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t.teamMembers}</h1>
          <div className="flex items-center gap-2">
            <p className="inline-flex items-baseline gap-2 border border-[#d9c79a] bg-[#fff4d6] px-3 py-1.5">
              <span className="font-display text-xl font-bold leading-none text-[#1c160c]">{teamCount}</span>
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a5b00]">
                {t.roleTeam}
              </span>
            </p>
            <p className="inline-flex items-baseline gap-2 border border-line bg-canvas px-3 py-1.5">
              <span className="font-display text-xl font-bold leading-none">{memberCount}</span>
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                {t.members}
              </span>
            </p>
          </div>
        </div>
        {admin ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400]"
          >
            {t.addMember}
          </button>
        ) : null}
      </div>
      {admin && open ? (
        <form ref={formRef} action={formAction} className="space-y-5 border-b border-line px-6 py-6">
      <label className="block">
        <span className={label}>{t.name}</span>
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="block">
        <span className={label}>{t.email}</span>
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="block">
        <span className={label}>{t.phone}</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="(555) 555-0100"
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          className={field}
        />
      </label>
      <label className="block">
        <span className={label}>{t.role}</span>
        <select name="role" required defaultValue="member" className={field}>
          <option value="member">{t.roleMember}</option>
          <option value="team">{t.roleTeam}</option>
        </select>
      </label>
      <label className="block">
        <span className={label}>{t.password}</span>
        <input name="password" type="password" required autoComplete="new-password" className={field} />
      </label>
      <label className="block">
        <span className={label}>{t.confirmPassword}</span>
        <input name="confirm" type="password" required autoComplete="new-password" className={field} />
      </label>
      {state.error ? (
        <p role="alert" className="border-l-4 border-accent pl-3 text-sm">
          {localizeError(locale, state.error)}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
      >
        {pending ? t.pleaseWait : t.addMember}
      </button>
        </form>
      ) : null}
    </div>
  );
}
