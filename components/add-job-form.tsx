"use client";

import { useActionState, useEffect, useState } from "react";
import { addJobAction, type JobState } from "@/app/jobs/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

const initialState: JobState = { error: "", success: false };
const fieldLabel = "font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted";
const fieldClass =
  "mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent";

function faviconPreviewUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (!url.hostname.includes(".")) return "";
    return `${url.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

export function AddJobForm() {
  const locale = useLocale();
  const t = ui(locale);
  const [state, formAction, pending] = useActionState(addJobAction, initialState);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoWebsite, setLogoWebsite] = useState("");
  const [useLogoWebsite, setUseLogoWebsite] = useState(false);
  const [hasLogoFile, setHasLogoFile] = useState(false);
  const [payMode, setPayMode] = useState<"weekly" | "biweekly" | "custom">("weekly");
  const [customPayDays, setCustomPayDays] = useState(1);
  const [useMessage, setUseMessage] = useState(false);
  const [workMode, setWorkMode] = useState<"remote" | "field">("remote");
  const [slots, setSlots] = useState(1);

  useEffect(() => {
    if (!state.success || pending) return;
    // Hard navigation guarantees fresh server render + latest marketplace data.
    window.location.assign(`/jobs?posted=${Date.now()}`);
  }, [pending, state.success]);

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function onLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    if (!file) {
      setHasLogoFile(false);
      setLogoPreview(useLogoWebsite ? faviconPreviewUrl(logoWebsite) : "");
      return;
    }
    setHasLogoFile(true);
    setLogoPreview(URL.createObjectURL(file));
  }

  function onWebsiteChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setLogoWebsite(value);
    if (hasLogoFile) return;
    setLogoPreview(faviconPreviewUrl(value));
  }

  function onUseLogoWebsite(event: React.ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    setUseLogoWebsite(checked);
    if (hasLogoFile) return;
    setLogoPreview(checked ? faviconPreviewUrl(logoWebsite) : "");
  }

  return (
    <>
      <h2 className="mb-5 font-display text-2xl font-bold uppercase tracking-wide">{t.addJob}</h2>
      <form
        id="listing"
        action={formAction}
        className="space-y-5 bg-white px-6 py-6"
      >
      <div className="mb-2 flex items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <label className="shrink-0">
            <span className={fieldLabel}>{t.jobSlots}</span>
            <div className="mt-1 flex w-28 overflow-hidden border border-line bg-white">
              <button
                type="button"
                onClick={() => setSlots((value) => Math.max(1, value - 1))}
                className="inline-flex h-10 w-8 items-center justify-center border-r border-line font-display text-lg text-foreground hover:bg-canvas"
                aria-label={locale === "es" ? "Quitar un cupo" : "Remove one slot"}
              >
                -
              </button>
              <input
                name="slots"
                type="number"
                min={1}
                max={999}
                required
                value={slots}
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value || "1", 10);
                  if (Number.isNaN(next)) return;
                  setSlots(Math.max(1, Math.min(999, next)));
                }}
                className="h-10 min-w-0 flex-1 border-0 px-1 text-center text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label={t.jobSlots}
              />
              <button
                type="button"
                onClick={() => setSlots((value) => Math.min(999, value + 1))}
                className="inline-flex h-10 w-8 items-center justify-center border-l border-line font-display text-lg text-foreground hover:bg-canvas"
                aria-label={locale === "es" ? "Agregar un cupo" : "Add one slot"}
              >
                +
              </button>
            </div>
          </label>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`font-display text-[11px] font-semibold uppercase tracking-[0.14em] ${workMode === "remote" ? "text-ink" : "text-muted"}`}
            >
              {t.remote}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={workMode === "field"}
              aria-label={`${t.remote} / ${t.workField}`}
              onClick={() => setWorkMode((mode) => (mode === "remote" ? "field" : "remote"))}
              className="relative h-8 w-14 rounded-full border border-line bg-canvas"
            >
              <span
                className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-accent shadow-sm transition-[left] duration-200 ${workMode === "field" ? "left-[calc(100%-1.625rem)]" : "left-0.5"}`}
              />
            </button>
            <span
              className={`font-display text-[11px] font-semibold uppercase tracking-[0.14em] ${workMode === "field" ? "text-ink" : "text-muted"}`}
            >
              {t.workField}
            </span>
            <input type="hidden" name="workMode" value={workMode} />
          </div>
          {logoPreview ? (
          <div className="shrink-0">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-line bg-canvas p-0.5 shadow-sm">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview}
                  alt={locale === "es" ? "Vista previa del logo" : "Logo preview"}
                  className="h-full w-full object-contain"
                  onError={() => {
                    if (!logoPreview.startsWith("http")) return;
                    try {
                      const host = new URL(logoPreview).hostname;
                      const fallback = `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(host)}`;
                      if (fallback !== logoPreview) setLogoPreview(fallback);
                    } catch {
                      return;
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </div>
      <label className="block">
        <span className={fieldLabel}>{t.jobTitle}</span>
        <input name="title" required className={fieldClass} />
      </label>
      <label className="block">
        <span className={fieldLabel}>{t.jobProgram}</span>
        <select name="program" required defaultValue="" className={fieldClass}>
          <option value="">{t.jobProgram}</option>
          <option value="safety">{t.jobProgramSafety}</option>
          <option value="energy">{t.jobProgramEnergy}</option>
          <option value="media">{t.jobProgramMedia}</option>
          <option value="software">{t.jobProgramSoftware}</option>
          <option value="insurance">{t.jobProgramInsurance}</option>
        </select>
      </label>
      <div>
        <label className="block">
          <span className={fieldLabel}>{locale === "es" ? "Logo de la empresa" : "Company logo"}</span>
          <input
            name="companyLogo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onLogoChange}
            className="mt-2 w-full border border-dashed border-line bg-canvas px-3 py-3 text-sm text-foreground file:mr-3 file:border-0 file:bg-accent file:px-3 file:py-2 file:font-display file:text-xs file:font-semibold file:uppercase file:tracking-[0.12em] file:text-ink hover:file:bg-[#e0b400]"
          />
          <p className="mt-1 text-xs text-muted">
            {locale === "es"
              ? "Opcional. Usa JPG, PNG o WebP."
              : "Optional. Use JPG, PNG, or WebP."}
          </p>
        </label>
        <div className="mt-4 border border-line bg-canvas px-3 py-2.5">
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={useLogoWebsite}
              onChange={onUseLogoWebsite}
              className="size-4 border border-line accent-accent"
            />
            <span className="font-display text-xs font-semibold uppercase tracking-[0.12em]">
              {locale === "es" ? "Usar URL del sitio" : "Use website URL"}
            </span>
          </label>
          {useLogoWebsite ? (
            <label className="mt-3 block">
              <span className={fieldLabel}>{locale === "es" ? "URL del sitio" : "Website URL"}</span>
              <input
                name="logoWebsite"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="www."
                value={logoWebsite}
                onChange={onWebsiteChange}
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-muted">
                {locale === "es"
                  ? "Opcional. Usa el favicon del sitio como logo."
                  : "Optional. Uses the site favicon as the logo."}
              </p>
            </label>
          ) : null}
        </div>
      </div>
      <label className="block">
        <span className={fieldLabel}>{t.jobDescription}</span>
        <textarea name="description" required rows={4} className={fieldClass} />
      </label>
      <div className="grid gap-5 md:grid-cols-5">
        <label className="block">
          <span className={fieldLabel}>{t.jobDate}</span>
          <input name="startsOn" type="date" required className={fieldClass} />
        </label>
        <label className="block">
          <span className={fieldLabel}>{locale === "es" ? "Fecha de vencimiento" : "Expiration date"}</span>
          <input name="expiresOn" type="date" className={fieldClass} />
        </label>
        <label className="block">
          <span className={fieldLabel}>{locale === "es" ? "Calificación" : "Qualification"}</span>
          <select name="qualification" defaultValue="beginner" className={fieldClass}>
            <option value="beginner">{locale === "es" ? "Principiante" : "Beginner"}</option>
            <option value="intermediate">{locale === "es" ? "Intermedio" : "Intermediate"}</option>
            <option value="expert">{locale === "es" ? "Experto" : "Expert"}</option>
          </select>
        </label>
        <label className="block">
          <span className={fieldLabel}>{t.jobPaid}</span>
          <span className="relative mt-2 block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              name="amount"
              inputMode="decimal"
              required
              placeholder="0.00"
              className="w-full border border-line bg-white py-3 pl-7 pr-3 text-foreground outline-none focus-visible:border-accent"
            />
          </span>
        </label>
        <label className="block">
          <span className={fieldLabel}>{t.payTiming}</span>
          {payMode !== "custom" ? (
            <select
              name="pay"
              required
              value={payMode}
              onChange={(event) => setPayMode(event.target.value as "weekly" | "biweekly" | "custom")}
              className={fieldClass}
            >
              <option value="weekly">{t.payWeekly}</option>
              <option value="biweekly">{t.payBiweekly}</option>
              <option value="custom">{locale === "es" ? "Días personalizados" : "Custom days"}</option>
            </select>
          ) : (
            <>
              <input type="hidden" name="pay" value="custom" />
              <input type="hidden" name="customPayDays" value={String(customPayDays)} />
              <div className="mt-2 flex overflow-hidden border border-line bg-white">
                <button
                  type="button"
                  onClick={() => setCustomPayDays((value) => Math.max(1, value - 1))}
                  className="inline-flex h-12 w-10 items-center justify-center border-r border-line font-display text-lg text-foreground hover:bg-canvas"
                  aria-label={locale === "es" ? "Restar un día" : "Subtract one day"}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={customPayDays}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value || "1", 10);
                    if (Number.isNaN(next)) return;
                    setCustomPayDays(Math.max(1, Math.min(365, next)));
                  }}
                  className="h-12 min-w-0 flex-1 border-0 px-2 text-center text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label={locale === "es" ? "Días personalizados para pagar" : "Custom payout days"}
                />
                <button
                  type="button"
                  onClick={() => setCustomPayDays((value) => Math.min(365, value + 1))}
                  className="inline-flex h-12 w-10 items-center justify-center border-l border-line font-display text-lg text-foreground hover:bg-canvas"
                  aria-label={locale === "es" ? "Sumar un día" : "Add one day"}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPayMode("weekly")}
                className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-foreground"
              >
                {locale === "es" ? "Cambiar tipo de pago" : "Change pay type"}
              </button>
            </>
          )}
        </label>
      </div>
      {payMode !== "custom" ? <input type="hidden" name="customPayDays" value="" /> : null}
      <label className="block">
        <span className={fieldLabel}>{locale === "es" ? "Detalles" : "Details"}</span>
        <div className="mt-2 border border-line bg-canvas px-3 py-2.5">
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="useMessage"
              checked={useMessage}
              onChange={(event) => setUseMessage(event.target.checked)}
              className="size-4 border border-line accent-accent"
            />
            <span className="font-display text-xs font-semibold uppercase tracking-[0.12em]">
              {locale === "es" ? "Usar campo de mensaje" : "Use message field"}
            </span>
          </label>
        </div>
        {useMessage ? (
          <textarea
            name="message"
            required
            rows={4}
            className={fieldClass}
          />
        ) : (
          <input type="hidden" name="message" value="" />
        )}
      </label>
      <label className="block">
        <span className={fieldLabel}>{locale === "es" ? "Enlace del trabajo" : "Job link"}</span>
        <input name="link" type="text" inputMode="url" required placeholder="www." className={fieldClass} />
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
        {pending ? t.pleaseWait : t.addJob}
      </button>
      </form>
    </>
  );
}
