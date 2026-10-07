export type ExperienceLevel = "beginner" | "intermediate" | "expert";

export type RatingSummary = {
  points: number;
  stars: number;
  level: ExperienceLevel;
};

const POINTS_PER_COMPLETION = 20;
const STAR_STEP = 40;

export function ratingFromCompletions(completedJobs: number): RatingSummary {
  const safeCompleted = Math.max(0, Math.floor(completedJobs));
  const points = safeCompleted * POINTS_PER_COMPLETION;
  const stars = Math.max(0, Math.min(5, Math.floor(points / STAR_STEP)));
  const level: ExperienceLevel = points >= 300 ? "expert" : points >= 120 ? "intermediate" : "beginner";
  return { points, stars, level };
}
