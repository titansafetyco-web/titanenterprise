import { ratingFromCompletions, type ExperienceLevel } from "@/lib/ratings";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";

export type LeaderboardEntry = {
  id: string;
  name: string;
  role: "agent" | "affiliate" | "admin" | "team" | "member";
  status: "pending" | "approved" | "denied";
  points: number;
  stars: number;
  level: ExperienceLevel;
  completedJobs: number;
  activeJobs: number;
};

function accountRole(value: string): LeaderboardEntry["role"] {
  if (value === "agent" || value === "affiliate" || value === "admin" || value === "team" || value === "member") {
    return value;
  }
  return "affiliate";
}

function accountStatus(value: string): LeaderboardEntry["status"] {
  if (value === "pending" || value === "approved" || value === "denied") return value;
  return "pending";
}

export async function loadLeaderboard() {
  if (!supabaseConfigured()) return { items: [] as LeaderboardEntry[], error: databaseMessage };
  const supabase = await createClient();
  if (!supabase) return { items: [] as LeaderboardEntry[], error: databaseMessage };

  const { data, error } = await supabase.rpc("leaderboard");
  if (error) {
    const missing = /relation|schema cache|does not exist|function/i.test(error.message);
    return { items: [] as LeaderboardEntry[], error: missing ? databaseMessage : "Accounts could not be loaded." };
  }

  const items = ((data ?? []) as {
    id: string;
    name: string;
    role: string;
    status: string;
    completed_jobs: number;
    active_jobs: number;
  }[])
    .map((row) => {
      const rating = ratingFromCompletions(row.completed_jobs ?? 0);
      return {
        id: row.id,
        name: row.name,
        role: accountRole(row.role),
        status: accountStatus(row.status),
        points: rating.points,
        stars: rating.stars,
        level: rating.level,
        completedJobs: row.completed_jobs ?? 0,
        activeJobs: row.active_jobs ?? 0,
      } satisfies LeaderboardEntry;
    })
    .sort((a, b) => b.points - a.points || b.completedJobs - a.completedJobs || a.name.localeCompare(b.name));

  return { items, error: "" };
}
