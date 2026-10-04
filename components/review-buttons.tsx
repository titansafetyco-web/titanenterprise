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
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {status !== "approved" ? (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value="approved" />
          <button
            type="submit"
            className="bg-accent px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-[#e0b400]"
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
            className="border border-ink px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-white"
          >
            {t.deny}
          </button>
        </form>
      ) : null}
    </div>
  );
}
