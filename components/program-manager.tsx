"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import {
  addProgramAction,
  removeProgramAction,
  type ProgramState,
} from "@/app/admin/program-actions";

const initialState: ProgramState = { error: "" };

export function ProgramManager({
  programs,
}: {
  programs: readonly { id: string; name: string }[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    addProgramAction,
    initialState,
  );

  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) router.refresh();
    wasPending.current = pending;
  }, [pending, router]);

  function remove(formData: FormData) {
    return removeProgramAction(formData).then(() => router.refresh());
  }

  return (
    <section className="mt-12 bg-white">
      <div className="border-b border-line px-6 py-5">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
          Programs
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          These names fill the menus on the affiliate onboarding form.
        </p>
      </div>
      <form
        key={programs.map((program) => program.id).join("-")}
        action={formAction}
        className="flex flex-wrap items-end gap-3 px-6 py-5"
      >
        <label className="min-w-0 flex-1">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Program name
          </span>
          <input
            name="name"
            required
            className="mt-2 w-full border border-line px-3 py-3 outline-none focus-visible:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400] disabled:opacity-60"
        >
          Add
        </button>
        {state.error ? (
          <p role="alert" className="w-full border-l-4 border-accent pl-3 text-sm">
            {state.error}
          </p>
        ) : null}
      </form>
      {programs.length === 0 ? (
        <p className="border-t border-line px-6 py-8 text-muted">
          No programs yet. Add one to open the menus.
        </p>
      ) : (
        <ul className="border-t border-line">
          {programs.map((program) => (
            <li
              key={program.id}
              className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 last:border-0"
            >
              <p className="font-display text-lg font-semibold uppercase tracking-wide">
                {program.name}
              </p>
              <form action={remove}>
                <input type="hidden" name="id" value={program.id} />
                <button
                  type="submit"
                  className="border border-line px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:border-ink"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
