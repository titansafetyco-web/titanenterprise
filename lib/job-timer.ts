export const JOB_OPEN_LIMIT_SECONDS = 12 * 60 * 60;

export function timerTotalSeconds(elapsed: number, startedAt: string, now = Date.now()) {
  const base = Math.max(0, elapsed);
  if (!startedAt) return base;
  const started = Date.parse(startedAt);
  if (!Number.isFinite(started)) return base;
  return base + Math.max(0, Math.floor((now - started) / 1000));
}

export function pauseExceeded(pausedAt: string, now = Date.now()) {
  const paused = Date.parse(pausedAt);
  if (!Number.isFinite(paused)) return false;
  return now - paused > JOB_OPEN_LIMIT_SECONDS * 1000;
}

export function expirationDeadline(expiresOn: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresOn)) return null;
  const end = Date.parse(`${expiresOn}T23:59:59.999Z`);
  return Number.isFinite(end) ? end : null;
}

export function jobPastExpiration(expiresOn: string, now = Date.now()) {
  const end = expirationDeadline(expiresOn);
  return end !== null && now > end;
}

export type TimerHeat = {
  ratio: number;
  remainingSeconds: number;
  tone: "cool" | "warm" | "hot" | "done" | "incomplete";
};

function heatTone(ratio: number): TimerHeat["tone"] {
  if (ratio >= 0.75) return "hot";
  if (ratio >= 0.5) return "warm";
  return "cool";
}

export function timerHeat(
  input: {
    expiresOn: string;
    startsOn: string;
    elapsed: number;
    startedAt: string;
    status: "processing" | "review" | "done" | "incomplete";
  },
  now = Date.now(),
): TimerHeat {
  if (input.status === "done") return { ratio: 1, remainingSeconds: 0, tone: "done" };
  if (input.status === "incomplete") return { ratio: 1, remainingSeconds: 0, tone: "incomplete" };

  const deadline = expirationDeadline(input.expiresOn);
  if (deadline !== null) {
    const start = /^\d{4}-\d{2}-\d{2}$/.test(input.startsOn)
      ? Date.parse(`${input.startsOn}T00:00:00.000Z`)
      : Number.NaN;
    const windowSeconds =
      Number.isFinite(start) && deadline > start
        ? Math.max(1, Math.round((deadline - start) / 1000))
        : JOB_OPEN_LIMIT_SECONDS;
    const worked = timerTotalSeconds(input.elapsed, input.startedAt, now);
    const ratio = Math.max(0, Math.min(1, worked / windowSeconds));
    return {
      ratio,
      remainingSeconds: Math.max(0, windowSeconds - worked),
      tone: heatTone(ratio),
    };
  }

  const worked = timerTotalSeconds(input.elapsed, input.startedAt, now);
  const ratio = Math.max(0, Math.min(1, worked / JOB_OPEN_LIMIT_SECONDS));
  return {
    ratio,
    remainingSeconds: Math.max(0, JOB_OPEN_LIMIT_SECONDS - worked),
    tone: heatTone(ratio),
  };
}

export function timerShouldClose(
  input: {
    expiresOn: string;
    elapsed: number;
    startedAt: string;
    pausedAt: string;
    running: boolean;
  },
  now = Date.now(),
) {
  if (expirationDeadline(input.expiresOn)) return jobPastExpiration(input.expiresOn, now);
  if (timerTotalSeconds(input.elapsed, input.startedAt, now) > JOB_OPEN_LIMIT_SECONDS) return true;
  return !input.running && input.elapsed > 0 && pauseExceeded(input.pausedAt, now);
}
