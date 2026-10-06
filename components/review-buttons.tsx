import { reviewAccount, reviewApplication } from "@/app/admin/review-actions";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function ReviewButtons({
  id,
  kind,
  status,
}: {
  id: string;
  kind: "account" | "application";
  status: string;
}) {
  const action = kind === "account" ? reviewAccount : reviewApplication;
  const t = ui(await getLocale());
  const label =
    status === "pending"
      ? t.statusPending
      : status === "approved"
        ? t.statusApproved
        : status === "denied"
          ? t.statusDenied
          : status;

  return (
    <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {status !== "approved" ? (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value="approved" />
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center bg-accent px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-[#e0b400] sm:w-auto"
          >
            {t.approve}
          </button>
        </form>
      ) : null}
      {status !== "denied" ? (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value="denied" />
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center border border-ink px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-white sm:w-auto"
          >
            {t.deny}
          </button>
        </form>
      ) : null}
    </div>
  );
}
