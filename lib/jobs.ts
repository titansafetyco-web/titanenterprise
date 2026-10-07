import { currentUserId } from "@/lib/auth";
import { dollarsToCents } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";

export type JobPay = "weekly" | "biweekly";
export type JobProgress = "processing" | "done" | "incomplete";
export type JobProgram = "safety" | "energy" | "media" | "software" | "insurance";
export type JobQualification = "beginner" | "intermediate" | "expert";

export type Job = {
  id: string;
  title: string;
  description: string;
  pay: JobPay;
  startsOn: string;
  expiresOn: string;
  payCents: number;
  message: string;
  link: string;
  program: JobProgram | "";
  qualification: JobQualification;
  customPayDays: number | null;
  messageEnabled: boolean;
  logoPath: string;
  createdAt: string;
};

export type ChosenJob = Job & {
  status: JobProgress;
  selectedAt: string;
  timerElapsedSeconds: number;
  timerStartedAt: string;
  timerRunning: boolean;
};

type JobRow = {
  id: string;
  title: string;
  description: string;
  pay: JobPay;
  starts_on: string | null;
  pay_cents: number | null;
  message: string | null;
  link: string | null;
  program: string | null;
  created_at: string;
};

const jobColumns = "id, title, description, pay, starts_on, pay_cents, message, link, program, created_at";
const JOB_META_PREFIX = "[[job-meta]]";

type JobMeta = {
  qualification: JobQualification;
  customPayDays: number | null;
  messageEnabled: boolean;
  expiresOn: string;
  logoPath: string;
  message: string;
};

function parseJobMeta(raw: string): JobMeta {
  const fallback: JobMeta = {
    qualification: "beginner",
    customPayDays: null,
    messageEnabled: raw.trim().length > 0,
    expiresOn: "",
    logoPath: "",
    message: raw,
  };
  if (!raw.startsWith(JOB_META_PREFIX)) return fallback;
  const splitAt = raw.indexOf("\n");
  if (splitAt < 0) return fallback;
  const head = raw.slice(JOB_META_PREFIX.length, splitAt).trim();
  const body = raw.slice(splitAt + 1);
  try {
    const parsed = JSON.parse(head) as {
      qualification?: string;
      customPayDays?: number | null;
      messageEnabled?: boolean;
      expiresOn?: string;
      logoPath?: string;
    };
    const qualification =
      parsed.qualification === "intermediate" || parsed.qualification === "expert"
        ? parsed.qualification
        : "beginner";
    const customPayDays =
      typeof parsed.customPayDays === "number" && Number.isFinite(parsed.customPayDays) && parsed.customPayDays > 0
        ? Math.round(parsed.customPayDays)
        : null;
    const messageEnabled = parsed.messageEnabled !== false;
    const expiresOn =
      typeof parsed.expiresOn === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(parsed.expiresOn) &&
      !Number.isNaN(Date.parse(`${parsed.expiresOn}T12:00:00Z`))
        ? parsed.expiresOn
        : "";
    return {
      qualification,
      customPayDays,
      messageEnabled,
      expiresOn,
      logoPath: typeof parsed.logoPath === "string" ? parsed.logoPath : "",
      message: body,
    };
  } catch {
    return fallback;
  }
}

function encodeJobMeta(input: {
  qualification: JobQualification;
  customPayDays: number | null;
  messageEnabled: boolean;
  expiresOn: string;
  logoPath: string;
  message: string;
}) {
  const head = JSON.stringify({
    qualification: input.qualification,
    customPayDays: input.customPayDays,
    messageEnabled: input.messageEnabled,
    expiresOn: input.expiresOn,
    logoPath: input.logoPath,
  });
  return `${JOB_META_PREFIX}${head}\n${input.message}`;
}

export function jobProgress(value: string): JobProgress | null {
  if (value === "processing" || value === "done" || value === "incomplete") return value;
  return null;
}

export function jobProgram(value: string): JobProgram | null {
  if (value === "safety" || value === "energy" || value === "media" || value === "software" || value === "insurance") {
    return value;
  }
  return null;
}

function mapJob(row: JobRow): Job {
  const meta = parseJobMeta(row.message ?? "");
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    pay: row.pay,
    startsOn: row.starts_on ?? "",
    expiresOn: meta.expiresOn,
    payCents: row.pay_cents ?? 0,
    message: meta.message,
    link: row.link ?? "",
    program: jobProgram(row.program ?? "") ?? "",
    qualification: meta.qualification,
    customPayDays: meta.customPayDays,
    messageEnabled: meta.messageEnabled,
    logoPath: meta.logoPath,
    createdAt: row.created_at,
  };
}

export function jobPay(value: string): JobPay | null {
  if (value === "weekly" || value === "biweekly") return value;
  return null;
}

export async function listJobs() {
  if (!supabaseConfigured()) return { items: [] as Job[], error: databaseMessage };
  const supabase = await createClient();
  if (!supabase) return { items: [] as Job[], error: databaseMessage };

  const { data, error } = await supabase
    .from("jobs")
    .select(jobColumns)
    .order("created_at", { ascending: false });

  if (error) {
    const missing = /relation|schema cache|does not exist/i.test(error.message);
    return {
      items: [] as Job[],
      error: missing ? databaseMessage : "Jobs could not be loaded.",
    };
  }

  return { items: ((data ?? []) as JobRow[]).map(mapJob), error: "" };
}

export async function listChosenJobs() {
  if (!supabaseConfigured()) return { items: [] as ChosenJob[], error: databaseMessage };
  const supabase = await createClient();
  if (!supabase) return { items: [] as ChosenJob[], error: databaseMessage };
  const userId = await currentUserId();
  if (!userId) return { items: [] as ChosenJob[], error: "" };

  const { data, error } = await supabase
    .from("job_selections")
    .select(`status, created_at, jobs(${jobColumns})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    const missing = /relation|schema cache|does not exist/i.test(error.message);
    return {
      items: [] as ChosenJob[],
      error: missing ? databaseMessage : "Jobs could not be loaded.",
    };
  }

  const timers = await supabase
    .from("job_timers")
    .select("job_id, elapsed_seconds, started_at")
    .eq("user_id", userId);
  if (timers.error && !/relation|schema cache|does not exist/i.test(timers.error.message)) {
    return { items: [] as ChosenJob[], error: "Jobs could not be loaded." };
  }
  const timerByJob = new Map(
    ((timers.data ?? []) as { job_id: string; elapsed_seconds: number | null; started_at: string | null }[]).map((row) => [
      row.job_id,
      {
        elapsed: row.elapsed_seconds ?? 0,
        startedAt: row.started_at ?? "",
      },
    ]),
  );

  const items = (data ?? [])
    .map((row) => {
      const job = row.jobs as JobRow | JobRow[] | null;
      const record = Array.isArray(job) ? job[0] : job;
      const status = jobProgress(String(row.status ?? ""));
      if (!record || !status) return null;
      const base = mapJob(record);
      const timer = timerByJob.get(base.id) ?? { elapsed: 0, startedAt: "" };
      const running = status === "processing" && Boolean(timer.startedAt);
      return {
        ...base,
        status,
        selectedAt: String(row.created_at),
        timerElapsedSeconds: Math.max(0, timer.elapsed ?? 0),
        timerStartedAt: timer.startedAt,
        timerRunning: running,
      };
    })
    .filter((job): job is ChosenJob => job !== null);

  return { items, error: "" };
}

export type JobSelection = {
  userId: string;
  jobId: string;
  title: string;
  pay: JobPay;
  status: JobProgress;
  selectedAt: string;
};

export async function listSelections() {
  if (!supabaseConfigured()) return { items: [] as JobSelection[], error: databaseMessage };
  const supabase = await createClient();
  if (!supabase) return { items: [] as JobSelection[], error: databaseMessage };

  const { data, error } = await supabase
    .from("job_selections")
    .select("user_id, status, created_at, jobs(id, title, pay)")
    .order("created_at", { ascending: false });

  if (error) {
    const missing = /relation|schema cache|does not exist/i.test(error.message);
    return {
      items: [] as JobSelection[],
      error: missing ? databaseMessage : "Jobs could not be loaded.",
    };
  }

  const items = (data ?? [])
    .map((row) => {
      const job = row.jobs as { id: string; title: string; pay: string } | { id: string; title: string; pay: string }[] | null;
      const record = Array.isArray(job) ? job[0] : job;
      const status = jobProgress(String(row.status ?? ""));
      const pay = record ? jobPay(record.pay) : null;
      if (!record || !status || !pay) return null;
      return {
        userId: String(row.user_id),
        jobId: record.id,
        title: record.title,
        pay,
        status,
        selectedAt: String(row.created_at),
      };
    })
    .filter((item): item is JobSelection => item !== null);

  return { items, error: "" };
}

export async function addJob(input: {
  title: string;
  description: string;
  pay: string;
  startsOn: string;
  expiresOn: string;
  amount: string;
  message: string;
  messageEnabled: boolean;
  link: string;
  program: string;
  qualification: string;
  customPayDays: string;
  logoPath: string;
}) {
  const title = input.title.trim();
  const description = input.description.trim();
  const message = input.message.trim();
  const link = input.link.trim();
  const pay = jobPay(input.pay);
  const payKey = input.pay.trim().toLowerCase();
  const program = jobProgram(input.program);
  const qualification =
    input.qualification === "intermediate" || input.qualification === "expert" ? input.qualification : "beginner";
  const customPayDays =
    payKey === "custom"
      ? Number.parseInt(input.customPayDays.trim(), 10)
      : null;
  const normalizedCustomDays =
    customPayDays !== null && Number.isFinite(customPayDays) && customPayDays >= 1 && customPayDays <= 365
      ? customPayDays
      : null;
  const payCents = dollarsToCents(input.amount);
  const startsOn = input.startsOn.trim();
  const expiresOn = input.expiresOn.trim();
  const messageEnabled = input.messageEnabled;
  const logoPath = input.logoPath.trim();
  if (title.length < 2) return { error: "Enter a job title." };
  if (title.length > 80) return { error: "Keep the title under 80 characters." };
  if (!program) return { error: "Choose a program." };
  if (description.length < 2) return { error: "Write a short description." };
  if (description.length > 500) return { error: "Keep the description under 500 characters." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || Number.isNaN(Date.parse(`${startsOn}T12:00:00Z`))) {
    return { error: "Choose a start date." };
  }
  if (
    expiresOn &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(expiresOn) || Number.isNaN(Date.parse(`${expiresOn}T12:00:00Z`)))
  ) {
    return { error: "Choose a valid expiration date." };
  }
  if (expiresOn && Date.parse(`${expiresOn}T12:00:00Z`) < Date.parse(`${startsOn}T12:00:00Z`)) {
    return { error: "Expiration date must be on or after the start date." };
  }
  if (payCents === null) return { error: "Enter an amount from $0.01 to $1,000,000." };
  if (!pay && payKey !== "custom") return { error: "Choose a valid pay schedule." };
  if (payKey === "custom" && normalizedCustomDays === null) return { error: "Enter custom pay days from 1 to 365." };
  if (messageEnabled && message.length < 2) return { error: "Write a short message." };
  if (message.length > 2000) return { error: "Keep the message under 2,000 characters." };
  let parsed: URL;
  try {
    parsed = new URL(link);
  } catch {
    return { error: "Enter a link that starts with https://." };
  }
  if (parsed.protocol !== "https:" || link.length > 500) {
    return { error: "Enter a link that starts with https://." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };

  const { error } = await supabase.from("jobs").insert({
    title,
    description,
    pay: payKey === "custom" ? "weekly" : pay,
    starts_on: startsOn,
    pay_cents: payCents,
    message: encodeJobMeta({
      qualification,
      customPayDays: normalizedCustomDays,
      messageEnabled,
      expiresOn,
      logoPath,
      message: messageEnabled ? message : "",
    }),
    link,
    program,
  });
  if (error) return { error: `The job could not be added. ${error.message}` };
  return { error: "" };
}

export async function removeJob(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) return { error: "The job could not be removed." };
  return { error: "" };
}

export async function selectJob(jobId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const userId = await currentUserId();
  if (!userId) return { error: "That job could not be selected." };

  const { error } = await supabase
    .from("job_selections")
    .insert({ user_id: userId, job_id: jobId });

  if (error && !/duplicate|unique/i.test(error.message)) {
    return { error: "That job could not be selected." };
  }
  return { error: "" };
}

export async function setJobProgress(jobId: string, status: string) {
  const progress = jobProgress(status);
  if (!progress) return { error: "Choose a job status." };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const userId = await currentUserId();
  if (!userId) return { error: "That job status could not be saved." };

  const { error } = await supabase.rpc("settle_job_progress", {
    target_job: jobId,
    next_status: progress,
  });

  if (error) return { error: "That job status could not be saved." };
  return { error: "" };
}

export async function unselectJob(jobId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const userId = await currentUserId();
  if (!userId) return { error: "The job could not be removed." };

  const existing = await supabase
    .from("job_selections")
    .select("status, credited")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();
  if (existing.data?.credited || existing.data?.status === "done") {
    return { error: "A completed job stays on your record." };
  }

  const { error } = await supabase
    .from("job_selections")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);

  if (error) return { error: "The job could not be removed." };
  await supabase.from("job_timers").delete().eq("user_id", userId).eq("job_id", jobId);
  return { error: "" };
}
