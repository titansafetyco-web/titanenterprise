"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  addTestimonial,
  removeTestimonial,
  updateTestimonial,
  type ReviewState,
} from "@/app/dashboard/settings/testimonial-actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import type { StoredReview } from "@/lib/testimonials";

const initialState: ReviewState = { error: "" };
const pageSize = 6;
const avatarColors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
const fieldLabel = "text-xs font-medium text-[#5f6368]";
const fieldClass =
  "mt-1.5 w-full rounded border border-[#dadce0] bg-white px-3 py-2.5 text-sm text-[#202124] outline-none focus-visible:border-[#1a73e8] focus-visible:ring-1 focus-visible:ring-[#1a73e8]";
const googleButton =
  "rounded bg-[#1a73e8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1765cc] disabled:opacity-60";

export function TestimonialManager({ reviews }: { reviews: StoredReview[] }) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addTestimonial, initialState);
  const [removeError, setRemoveError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const wasPending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      setFormKey((value) => value + 1);
      setPage(Math.max(0, Math.ceil((reviews.length + 1) / pageSize) - 1));
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, router, state.error]);

  const pages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const visible = reviews.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => {
    setPage((current) => Math.min(current, pages - 1));
  }, [pages]);

  return (
    <div className="border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span>
          <span className="block font-display text-lg font-bold uppercase tracking-wide">{t.testimonialTitle}</span>
          <span className="mt-2 block max-w-2xl text-sm text-muted">{t.testimonialManageHelp}</span>
        </span>
        <span className="font-display text-lg text-muted" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
      <>
      <form ref={formRef} action={formAction} className="relative grid gap-4 overflow-hidden border-t border-[#dadce0] bg-[#f8f9fa] px-6 py-5 sm:grid-cols-2">
        <GoogleBar />
        <ReviewFields key={formKey} />
        {state.error ? (
          <p role="alert" className="border-l-4 border-[#EA4335] pl-3 text-sm text-[#c5221f] sm:col-span-2">
            {localizeError(locale, state.error)}
          </p>
        ) : null}
        <div className="sm:col-span-2">
          <button type="submit" disabled={pending} className={googleButton}>
            {pending ? t.pleaseWait : t.reviewAdd}
          </button>
        </div>
      </form>
      {reviews.length === 0 ? (
        <p className="border-t border-line px-6 py-8 text-sm text-muted">{t.noReviews}</p>
      ) : (
        <ul className="border-t border-line">
          {visible.map((review) => (
            <li key={review.id} className="border-b border-line px-6 py-4 last:border-b-0">
              {editing === review.id ? (
                <EditReview review={review} onDone={() => setEditing(null)} />
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <ReviewAvatar name={review.name} photoUrl={review.photoUrl} />
                    <div className="min-w-0">
                    <p className="font-display text-sm font-bold uppercase tracking-wide">
                      {review.name}
                      <span className="ml-2 font-sans text-xs font-semibold normal-case tracking-normal text-muted">
                        {review.role} · {review.stars}/5
                      </span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{review.quote}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(review.id)}
                      className="border border-line px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.14em] hover:border-ink"
                    >
                      {t.reviewEdit}
                    </button>
                    <form
                      action={(formData) => {
                        setRemoveError("");
                        void removeTestimonial(formData).then((result) => {
                          if (result.error) setRemoveError(result.error);
                          else router.refresh();
                        });
                      }}
                    >
                      <input type="hidden" name="id" value={review.id} />
                      <button
                        type="submit"
                        className="border border-line px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-[#c4322a] hover:border-[#c4322a]"
                      >
                        {t.remove}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {reviews.length > pageSize ? (
        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
            className="border border-line px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-canvas disabled:text-muted"
          >
            {t.activityPrevious}
          </button>
          <p className="min-w-12 text-center font-display text-xs font-semibold uppercase tracking-wider text-muted">
            {page + 1} / {pages}
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
            disabled={page >= pages - 1}
            className="border border-line px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-canvas disabled:text-muted"
          >
            {t.activityNext}
          </button>
        </div>
      ) : null}
      {removeError ? (
        <p role="alert" className="border-t border-line px-6 py-4 text-sm">
          {localizeError(locale, removeError)}
        </p>
      ) : null}
      </>
      ) : null}
    </div>
  );
}

function ReviewFields({ review }: { review?: StoredReview }) {
  const t = ui(useLocale());
  const [preview, setPreview] = useState(review?.photoUrl ?? "");
  const previewRef = useRef(preview);
  previewRef.current = preview;

  useEffect(() => {
    return () => {
      if (previewRef.current.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  return (
    <>
      <label className="sm:col-span-2">
        <span className={fieldLabel}>{t.reviewPhoto}</span>
        <span className="mt-2 flex items-center gap-3">
          <ReviewAvatar name={review?.name || t.name} photoUrl={preview} />
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview((current) => {
                if (current.startsWith("blob:")) URL.revokeObjectURL(current);
                return file ? URL.createObjectURL(file) : review?.photoUrl ?? "";
              });
            }}
            className="block min-w-0 text-sm text-[#3c4043] file:mr-3 file:rounded file:border file:border-[#dadce0] file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#1a73e8]"
          />
        </span>
        <span className="mt-2 block text-xs text-[#5f6368]">{t.reviewPhotoHint}</span>
      </label>
      <label>
        <span className={fieldLabel}>{t.name}</span>
        <input name="name" required maxLength={80} defaultValue={review?.name} className={fieldClass} />
      </label>
      <label>
        <span className={fieldLabel}>{t.reviewRole}</span>
        <input name="role" required maxLength={80} defaultValue={review?.role} className={fieldClass} />
      </label>
      <label className="sm:col-span-2">
        <span className={fieldLabel}>{t.reviewQuote}</span>
        <textarea name="quote" required maxLength={500} rows={3} defaultValue={review?.quote} className={fieldClass} />
      </label>
      <StarPicker defaultValue={review?.stars ?? 5} />
      <p className="text-xs text-[#5f6368] sm:col-span-2">{t.reviewOptionalEs}</p>
      <label>
        <span className={fieldLabel}>{t.reviewRoleEs}</span>
        <input name="roleEs" maxLength={80} defaultValue={review?.roleEs} className={fieldClass} />
      </label>
      <label className="sm:col-span-2">
        <span className={fieldLabel}>{t.reviewQuoteEs}</span>
        <textarea name="quoteEs" maxLength={500} rows={3} defaultValue={review?.quoteEs} className={fieldClass} />
      </label>
    </>
  );
}

function colorIndex(name: string) {
  return [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length;
}

function GoogleBar() {
  return (
    <span className="pointer-events-none absolute inset-x-0 top-0 flex h-1" aria-hidden="true">
      <span className="flex-1 bg-[#4285F4]" />
      <span className="flex-1 bg-[#EA4335]" />
      <span className="flex-1 bg-[#FBBC05]" />
      <span className="flex-1 bg-[#34A853]" />
    </span>
  );
}

function StarPicker({ defaultValue }: { defaultValue: number }) {
  const t = ui(useLocale());
  const [stars, setStars] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const shown = hover || stars;

  return (
    <fieldset className="min-w-0 border-0 p-0" onMouseLeave={() => setHover(0)}>
      <legend className={fieldLabel}>{t.stars}</legend>
      <div className="mt-2 flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((count) => (
          <label key={count} className="cursor-pointer" onMouseEnter={() => setHover(count)}>
            <input
              type="radio"
              name="stars"
              value={count}
              checked={stars === count}
              onChange={() => setStars(count)}
              className="sr-only"
            />
            <span className="sr-only">{t.testimonialStars.replace("{count}", String(count))}</span>
            <Star filled={count <= shown} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-6 w-6 ${filled ? "fill-[#FBBC04]" : "fill-[#dadce0]"}`} aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function ReviewAvatar({ name, photoUrl }: { name: string; photoUrl: string }) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: avatarColors[colorIndex(name)] }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

function EditReview({ review, onDone }: { review: StoredReview; onDone: () => void }) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateTestimonial, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onDone();
      router.refresh();
    }
    wasPending.current = pending;
  }, [onDone, pending, router, state.error]);

  return (
    <form action={formAction} className="relative grid gap-4 overflow-hidden rounded border border-[#dadce0] bg-[#f8f9fa] p-4 sm:grid-cols-2">
      <GoogleBar />
      <input type="hidden" name="id" value={review.id} />
      <ReviewFields review={review} />
      {state.error ? (
        <p role="alert" className="border-l-4 border-[#EA4335] pl-3 text-sm text-[#c5221f] sm:col-span-2">
          {localizeError(locale, state.error)}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className={googleButton}>
          {pending ? t.pleaseWait : t.reviewSave}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded border border-[#dadce0] bg-white px-5 py-2.5 text-sm font-medium text-[#1a73e8] hover:bg-[#f8f9fa]"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
