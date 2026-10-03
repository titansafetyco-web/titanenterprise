"use client";

import { useActionState, useState } from "react";
import { sendMessage, type ContactState } from "@/app/contact/actions";
import { contactTopics } from "@/lib/site";

const initialState: ContactState = { error: "", ok: false };

export function ContactForm() {
  const [formKey, setFormKey] = useState(0);

  return (
    <ContactFields
      key={formKey}
      onReset={() => setFormKey((value) => value + 1)}
    />
  );
}

function ContactFields({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(sendMessage, initialState);

  if (state.ok) {
    return (
      <div className="mt-10 border-l-4 border-accent pl-4" role="status">
        <p className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Message received
        </p>
        <p className="mt-3 max-w-xl text-white/75">
          Thanks. Your note is with the team.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-6 border border-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-ink"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-10 grid gap-5 sm:grid-cols-2">
      <Field label="Name" name="name" type="text" autoComplete="name" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <label className="block sm:col-span-2">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
          Subject
        </span>
        <select
          name="interest"
          required
          defaultValue=""
          className="mt-2 w-full border border-white/20 bg-white px-3 py-3 text-ink outline-none focus-visible:border-accent"
        >
          <option value="" disabled>
            Choose one
          </option>
          {contactTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={5}
          minLength={10}
          maxLength={2000}
          className="mt-2 w-full resize-y border border-white/20 bg-white px-3 py-3 text-ink outline-none focus-visible:border-accent"
        />
      </label>
      {state.error ? (
        <p role="alert" className="border-l-4 border-accent pl-3 text-sm text-white sm:col-span-2">
          {state.error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400] disabled:opacity-60"
        >
          {pending ? "Please wait" : "Send message"}
        </button>
      </div>
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
      <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="mt-2 w-full border border-white/20 bg-white px-3 py-3 text-ink outline-none focus-visible:border-accent"
      />
    </label>
  );
}
