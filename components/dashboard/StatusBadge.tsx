import type { JobStatus, LiveJobStatus } from "@/types/titan";

const labels: Record<string, { en: string; es: string }> = {
  available: { en: "Available", es: "Disponible" },
  accepted: { en: "Accepted", es: "Aceptado" },
  in_progress: { en: "In Progress", es: "En curso" },
  submitted: { en: "Submitted", es: "Enviado" },
  under_review: { en: "Under Review", es: "En revisión" },
  partner_verified: { en: "Partner Verified", es: "Verificado por el socio" },
  approved: { en: "Approved", es: "Aprobado" },
  payable: { en: "Payable", es: "Por pagar" },
  paid: { en: "Paid", es: "Pagado" },
  rejected: { en: "Rejected", es: "Rechazado" },
  reversed: { en: "Reversed", es: "Revertido" },
  processing: { en: "Processing", es: "En proceso" },
  done: { en: "Done", es: "Hecho" },
  incomplete: { en: "Incomplete", es: "Incompleto" },
  pending: { en: "Pending", es: "Pendiente" },
  sent: { en: "Sent", es: "Enviado" },
  failed: { en: "Failed", es: "Fallido" },
  not_started: { en: "Not Started", es: "Sin empezar" },
  completed: { en: "Completed", es: "Completado" },
  passed: { en: "Passed", es: "Aprobado" },
  locked: { en: "Locked", es: "Bloqueado" },
};

export function StatusBadge({
  status,
  locale,
}: {
  status: JobStatus | LiveJobStatus | string;
  locale: "en" | "es";
}) {
  const label = labels[status]?.[locale] ?? status;
  return (
    <span className="inline-flex min-h-11 items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.14em]">
      <StatusIcon status={status} />
      {label}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "done" || status === "approved" || status === "paid" || status === "passed" || status === "sent") {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
        <path d="M3 8.5 6.2 12 13 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (status === "incomplete" || status === "rejected" || status === "failed" || status === "reversed") {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
        <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
