"use client";

import { useActionState, useState } from "react";
import {
  sendApplication,
  type ApplicationState,
} from "@/app/affiliate/actions";

const initialState: ApplicationState = { error: "", ok: false };

export function AffiliateForm({
  programs,
}: {
  programs: readonly { id: string; name: string }[];
}) {
  const [formKey, setFormKey] = useState(0);

  if (programs.length === 0) {
    return (
      <p className="mt-8 text-muted">No programs are open for onboarding.</p>
    );
  }

  return (
    <AffiliateFields
      key={formKey}
      programs={programs}
      onReset={() => setFormKey((value) => value + 1)}
    />
  );
}

function AffiliateFields({
  programs,
  onReset,
}: {
  programs: readonly { id: string; name: string }[];
  onReset: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    sendApplication,
    initialState,
  );

  if (state.ok) {
    return (
      <div className="mt-8 border-l-4 border-accent pl-4" role="status">
        <p className="font-display text-2xl font-bold uppercase tracking-wide">
          Onboarding received
        </p>
        <p className="mt-3 text-muted">Thanks. Your note is with the team.</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-6 border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-white"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <Field label="Name" name="name" type="text" autoComplete="name" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Menu label="Program" name="program" programs={programs} required />
      <Menu
        label="Second program"
        name="second"
        programs={programs}
        emptyLabel="None"
      />
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Note
        </span>
        <textarea
          name="note"
          rows={4}
          maxLength={2000}
          className="mt-2 w-full resize-y border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
        />
      </label>
      {state.error ? (
        <p role="alert" className="border-l-4 border-accent pl-3 text-sm">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400] disabled:opacity-60"
      >
        {pending ? "Please wait" : "Start onboarding"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
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
        className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
      />
    </label>
  );
}

function Menu({
  label,
  name,
  programs,
  required = false,
  emptyLabel = "Choose one",
}: {
  label: string;
  name: string;
  programs: readonly { id: string; name: string }[];
  required?: boolean;
  emptyLabel?: string;
}) {
  return (
    <label className="block">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
      >
        <option value="" disabled={required}>
          {emptyLabel}
        </option>
        {programs.map((program) => (
          <option key={program.id} value={program.id}>
            {program.name}
          </option>
        ))}
      </select>
    </label>
  );
}
