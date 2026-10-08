"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import { uploadAvatar, saveProfileDetails, importProfileCsv, setSiteMaintenance, deleteAccount, formatAccount, type PhotoState } from "@/app/dashboard/settings/actions";
import { TestimonialManager } from "@/components/testimonial-manager";
import type { StoredReview } from "@/lib/testimonials";
import { useLocale } from "@/components/locale-provider";
import { initials } from "@/lib/avatar";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import { formatPhone } from "@/lib/phone";
import { states } from "@/lib/profile-details";

const initialState: PhotoState = { error: "" };

export function SettingsPanel({
  name,
  email,
  phone,
  role,
  photo,
  birthDate,
  region,
  admin,
  closed,
  reviews,
}: {
  name: string;
  email: string;
  phone: string;
  role: string;
  photo: string;
  birthDate: string;
  region: string;
  admin: boolean;
  closed: boolean;
  reviews: StoredReview[];
}) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "photo">("profile");
  const [state, formAction, pending] = useActionState(uploadAvatar, initialState);
  const [details, saveDetails, saving] = useActionState(saveProfileDetails, initialState);
  const [imported, importFile, importing] = useActionState(importProfileCsv, initialState);
  const [siteState, siteAction, sitePending] = useActionState(setSiteMaintenance, initialState);
  const [removed, removeAccount, removing] = useActionState(deleteAccount, initialState);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmFormat, setConfirmFormat] = useState(false);
  const [formatStep, setFormatStep] = useState<"warn" | "upload">("warn");
  const [formatError, setFormatError] = useState("");
  const [formatting, startFormat] = useTransition();
  const deleteTitleId = useId();
  const formatTitleId = useId();
  const [preview, setPreview] = useState("");
  const [birth, setBirth] = useState(birthDate);
  const [homeState, setHomeState] = useState(region);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);
  const [draftPhone, setDraftPhone] = useState(phone);
  const [maxDate, setMaxDate] = useState("");
  const wasPending = useRef(false);
  const wasSaving = useRef(false);
  const wasImporting = useRef(false);
  const wasSite = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const importRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      setPreview("");
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, router, state.error]);

  useEffect(() => {
    if (wasSaving.current && !saving && !details.error) router.refresh();
    wasSaving.current = saving;
  }, [details.error, router, saving]);

  useEffect(() => {
    if (wasImporting.current && !importing && !imported.error) {
      importRef.current?.reset();
      router.refresh();
    }
    wasImporting.current = importing;
  }, [imported.error, importing, router]);

  useEffect(() => {
    if (wasSite.current && !sitePending && !siteState.error) router.refresh();
    wasSite.current = sitePending;
  }, [router, sitePending, siteState.error]);

  useEffect(() => {
    if (!confirmDelete && !confirmFormat) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || removing || formatting) return;
      setConfirmDelete(false);
      setConfirmFormat(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete, confirmFormat, formatting, removing]);

  useEffect(() => {
    setBirth(birthDate);
    setHomeState(region);
  }, [birthDate, region]);

  useEffect(() => {
    setDraftName(name);
    setDraftEmail(email);
    setDraftPhone(phone);
    setEditing(false);
  }, [email, name, phone]);

  useEffect(() => {
    setMaxDate(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const field =
    "mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent";

  function exportCsv() {
    const cells = [name, email, phone, role, birth, homeState];
    const headers = [t.name, t.email, t.phone, t.role, t.dateOfBirth, t.stateLabel];
    const csv = [headers, cells]
      .map((line) =>
        line
          .map((value) => (/[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value))
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "profile.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const tabClass = (active: boolean) =>
    `border-b-2 px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider ${
      active ? "border-accent text-foreground" : "border-transparent text-muted hover:text-foreground"
    }`;

  return (
    <section className="bg-white">
      <div className="border-b border-line px-6 py-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t.settings}</h1>
      </div>
      <div className="flex border-b border-line px-6" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "profile"} className={tabClass(tab === "profile")} onClick={() => setTab("profile")}>
          {t.profile}
        </button>
        <button type="button" role="tab" aria-selected={tab === "photo"} className={tabClass(tab === "photo")} onClick={() => setTab("photo")}>
          {t.photo}
        </button>
      </div>
      {tab === "profile" ? (
        <>
          <form action={saveDetails} className="grid gap-5 px-6 py-6 sm:grid-cols-2">
            <div className="flex justify-end sm:col-span-2">
              <button
                type="button"
                aria-pressed={editing}
                aria-label={t.editProfile}
                onClick={() => {
                  if (editing) {
                    setDraftName(name);
                    setDraftEmail(email);
                    setDraftPhone(phone);
                  }
                  setEditing((value) => !value);
                }}
                className={`grid size-9 place-items-center border border-line ${
                  editing ? "bg-canvas text-foreground" : "text-muted hover:bg-canvas hover:text-foreground"
                }`}
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M2 11.5V14h2.5L12.8 5.7 10.3 3.2 2 11.5zM13.9 4.6a.7.7 0 0 0 0-1L12.4 2.1a.7.7 0 0 0-1 0l-1 1 2.5 2.5 1-1z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <div>
              <label className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted" htmlFor="profile-name">
                {t.name}
              </label>
              {editing ? (
                <input
                  id="profile-name"
                  name="accountName"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  required
                  className={field}
                />
              ) : (
                <>
                  <p id="profile-name" className="mt-2">{name}</p>
                  <input type="hidden" name="accountName" value={name} />
                </>
              )}
            </div>
            <div>
              <label className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted" htmlFor="profile-email">
                {t.email}
              </label>
              {editing ? (
                <input
                  id="profile-email"
                  name="accountEmail"
                  type="email"
                  value={draftEmail}
                  onChange={(event) => setDraftEmail(event.target.value)}
                  required
                  className={field}
                />
              ) : (
                <>
                  <p id="profile-email" className="mt-2">{email}</p>
                  <input type="hidden" name="accountEmail" value={email} />
                </>
              )}
            </div>
            <div>
              <label className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted" htmlFor="profile-phone">
                {t.phone}
              </label>
              {editing ? (
                <input
                  id="profile-phone"
                  name="accountPhone"
                  type="tel"
                  inputMode="tel"
                  value={draftPhone}
                  onChange={(event) => setDraftPhone(formatPhone(event.target.value))}
                  className={field}
                />
              ) : (
                <>
                  <p id="profile-phone" className="mt-2">{phone || "—"}</p>
                  <input type="hidden" name="accountPhone" value={phone} />
                </>
              )}
            </div>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.role}</p>
              <p className="mt-2">{role}</p>
            </div>
            <label className="block">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {t.dateOfBirth}
              </span>
              <input
                name="birth"
                type="date"
                value={birth}
                max={maxDate || undefined}
                onChange={(event) => setBirth(event.target.value)}
                className={field}
              />
            </label>
            <label className="block">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {t.stateLabel}
              </span>
              <select
                name="state"
                value={homeState}
                onChange={(event) => setHomeState(event.target.value)}
                className={field}
              >
                <option value="">{t.chooseState}</option>
                {states.map(([code, label]) => (
                  <option key={code} value={code}>
                    {code} — {label}
                  </option>
                ))}
              </select>
            </label>
            {details.error ? (
              <p role="alert" className="border-l-4 border-accent pl-3 text-sm sm:col-span-2">
                {localizeError(locale, details.error)}
              </p>
            ) : null}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
              >
                {saving ? t.pleaseWait : t.saveDetails}
              </button>
            </div>
          </form>
          <div className="flex flex-wrap items-end gap-4 border-t border-line px-6 py-5">
            <button
              type="button"
              onClick={exportCsv}
              className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-ink hover:text-white"
            >
              {t.exportCsv}
            </button>
            <form ref={importRef} action={importFile} className="flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {t.importCsv}
                </span>
                <input
                  name="csv"
                  type="file"
                  accept=".csv,text/csv"
                  required
                  className="mt-2 block text-sm file:mr-4 file:border-0 file:bg-canvas file:px-4 file:py-3 file:font-display file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-foreground"
                />
              </label>
              <button
                type="submit"
                disabled={importing}
                className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
              >
                {importing ? t.pleaseWait : t.importCsv}
              </button>
            </form>
            {imported.error ? (
              <p role="alert" className="w-full border-l-4 border-accent pl-3 text-sm">
                {localizeError(locale, imported.error)}
              </p>
            ) : null}
          </div>
          {admin ? (
            <form action={siteAction} className="border-t border-line px-6 py-5">
              <p className="text-sm text-muted">{closed ? t.siteDown : t.siteUp}</p>
              {siteState.error ? (
                <p role="alert" className="mt-4 border-l-4 border-accent pl-3 text-sm">
                  {localizeError(locale, siteState.error)}
                </p>
              ) : null}
              <input type="hidden" name="enabled" value={closed ? "false" : "true"} />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={sitePending}
                  className={`px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider disabled:opacity-60 ${
                    closed
                      ? "bg-accent text-ink hover:bg-[#e0b400]"
                      : "bg-ink text-white hover:bg-foreground"
                  }`}
                >
                  {sitePending ? t.pleaseWait : closed ? t.bringSiteBack : t.shutDownSite}
                </button>
                <Link
                  href="/maintenance"
                  target="_blank"
                  className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas"
                >
                  {t.previewMaintenance}
                </Link>
              </div>
            </form>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-5">
            <Link
              href="/forgot"
              className="font-display text-sm font-semibold uppercase tracking-wider text-foreground underline-offset-4 hover:text-accent hover:underline"
            >
              {t.changePassword}
            </Link>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormatError("");
                  setFormatStep("warn");
                  setConfirmFormat(true);
                }}
                className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas"
              >
                {t.formatAccount}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="bg-[#c4322a] px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a82822]"
              >
                {t.deleteAccount}
              </button>
            </div>
          </div>
          {admin ? <TestimonialManager reviews={reviews} /> : null}
          {confirmFormat ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
              onClick={(event) => {
                if (event.target === event.currentTarget && !formatting) setConfirmFormat(false);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={formatTitleId}
                className="w-full max-w-md border border-line bg-white p-6 shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
              >
                <h2 id={formatTitleId} className="font-display text-2xl font-bold uppercase tracking-wide">
                  {t.formatAccount}
                </h2>
                <p className="mt-4 leading-relaxed">
                  {formatStep === "upload" ? t.formatAccountUpload : admin ? t.formatAccountWarning : t.formatOwnWarning}
                </p>
                {formatError ? (
                  <p role="alert" className="mt-4 border-l-4 border-accent pl-3 text-sm">
                    {localizeError(locale, formatError)}
                  </p>
                ) : null}
                {formatStep === "upload" ? (
                  <form
                    action={(formData) => {
                      setFormatError("");
                      startFormat(async () => {
                        const result = await importProfileCsv({ error: "" }, formData);
                        if (result.error) {
                          setFormatError(result.error);
                          return;
                        }
                        window.location.assign("/dashboard");
                      });
                    }}
                    className="mt-6"
                  >
                    <input
                      name="csv"
                      type="file"
                      accept=".csv,text/csv"
                      required
                      className="block w-full text-sm file:mr-4 file:border-0 file:bg-canvas file:px-4 file:py-3 file:font-display file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-foreground"
                    />
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={formatting}
                        onClick={() => setConfirmFormat(false)}
                        className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={formatting}
                        className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
                      >
                        {formatting ? t.pleaseWait : t.importCsv}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={formatting}
                      onClick={() => setConfirmFormat(false)}
                      className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      disabled={formatting}
                      onClick={() => {
                        setFormatError("");
                        const formData = new FormData();
                        formData.set("confirm", "format");
                        startFormat(async () => {
                          const result = await formatAccount({ error: "" }, formData);
                          if (result.error) {
                            setFormatError(result.error);
                            return;
                          }
                          setFormatStep("upload");
                        });
                      }}
                      className="bg-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-foreground disabled:opacity-60"
                    >
                      {formatting ? t.pleaseWait : t.formatAccount}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {confirmDelete ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
              onClick={() => {
                if (!removing) setConfirmDelete(false);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={deleteTitleId}
                className="w-full max-w-md border border-line bg-white p-6 shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id={deleteTitleId} className="font-display text-2xl font-bold uppercase tracking-wide">
                  {t.deleteAccount}
                </h2>
                <p className="mt-4 leading-relaxed">{t.deleteAccountWarning}</p>
                {removed.error ? (
                  <p role="alert" className="mt-4 border-l-4 border-accent pl-3 text-sm">
                    {localizeError(locale, removed.error)}
                  </p>
                ) : null}
                <form action={removeAccount} className="mt-6 flex flex-wrap gap-3">
                  <input type="hidden" name="confirm" value="delete" />
                  <button
                    type="button"
                    disabled={removing}
                    onClick={() => setConfirmDelete(false)}
                    className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={removing}
                    className="bg-[#c4322a] px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a82822] disabled:opacity-60"
                  >
                    {removing ? t.pleaseWait : t.deleteAccount}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <form ref={formRef} action={formAction} className="px-6 py-6">
          <div className="flex items-center gap-5">
            {preview ? (
              <img src={preview} alt="" className="size-24 rounded-full object-cover" />
            ) : photo ? (
              <Image src={photo} alt="" width={96} height={96} className="size-24 rounded-full object-cover" />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-24 place-items-center rounded-full bg-ink font-display text-xl font-semibold tracking-wide text-accent"
              >
                {initials(name)}
              </span>
            )}
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-wide">{t.photo}</p>
              <p className="mt-1 text-sm text-muted">{t.photoHelp}</p>
            </div>
          </div>
          <label className="mt-6 block">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {t.photo}
            </span>
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="mt-2 block w-full text-sm file:mr-4 file:border-0 file:bg-canvas file:px-4 file:py-3 file:font-display file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-foreground"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
          </label>
          {state.error ? (
            <p role="alert" className="mt-4 border-l-4 border-accent pl-3 text-sm">
              {localizeError(locale, state.error)}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
          >
            {pending ? t.pleaseWait : t.uploadPhoto}
          </button>
        </form>
      )}
    </section>
  );
}
