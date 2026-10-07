import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { loadLeaderboard } from "@/lib/leaderboard";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).leaderboard} · ${site.name}` };
}

function roleName(role: string, t: ReturnType<typeof ui>) {
  if (role === "admin") return t.roleAdmin;
  if (role === "agent") return t.roleAgent;
  if (role === "team") return t.roleTeam;
  if (role === "member") return t.roleMember;
  return t.roleAffiliate;
}

function levelName(level: string, t: ReturnType<typeof ui>) {
  if (level === "expert") return t.levelExpert;
  if (level === "intermediate") return t.levelIntermediate;
  return t.levelBeginner;
}

function stars(count: number) {
  return "★★★★★".slice(0, Math.max(0, Math.min(5, count)));
}

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/leaderboard");
  const locale = await getLocale();
  const t = ui(locale);
  const board = await loadLeaderboard();

  return (
    <section className="bg-white">
      <div className="border-b border-line px-6 py-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t.leaderboard}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {locale === "es"
            ? "Puntos por trabajos completados. Las estrellas resumen el nivel de rendimiento."
            : "Points are earned from completed jobs. Stars summarize performance level."}
        </p>
      </div>
      {board.error ? (
        <p className="px-6 py-8 text-muted">{localizeError(locale, board.error)}</p>
      ) : board.items.length === 0 ? (
        <p className="px-6 py-8 text-muted">{t.leaderboardEmpty}</p>
      ) : (
        <ul>
          {board.items.map((item, index) => (
            <li key={item.id} className="border-b border-line px-6 py-5 last:border-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold uppercase tracking-wide md:text-lg">
                    #{index + 1} {item.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {roleName(item.role, t)} · {levelName(item.level, t)}
                  </p>
                </div>
                <div className="inline-flex min-h-8 items-center border border-[#eadfbe] bg-[#fff4d6] px-2.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
                  {t.points}: {item.points}
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                <div className="border border-line bg-canvas px-2.5 py-2">
                  <dt className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{t.stars}</dt>
                  <dd className="mt-1 font-display text-sm tracking-[0.2em] text-accent">{stars(item.stars)}</dd>
                </div>
                <div className="border border-line bg-canvas px-2.5 py-2">
                  <dt className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{t.completedJobs}</dt>
                  <dd className="mt-1">{item.completedJobs}</dd>
                </div>
                <div className="border border-line bg-canvas px-2.5 py-2">
                  <dt className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{t.jobProcessing}</dt>
                  <dd className="mt-1">{item.activeJobs}</dd>
                </div>
                <div className="border border-line bg-canvas px-2.5 py-2">
                  <dt className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{t.level}</dt>
                  <dd className="mt-1">{levelName(item.level, t)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
