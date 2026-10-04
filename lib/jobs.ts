import { currentUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";

export type JobPay = "weekly" | "biweekly";
export type JobProgress = "processing" | "done" | "incomplete";

export type Job = {
  id: string;
  title: string;
  description: string;
  pay: JobPay;
  createdAt: string;
};

export type ChosenJob = Job & {
  status: JobProgress;
  selectedAt: string;
};

type JobRow = {
  id: string;
  title: string;
  description: string;
  pay: JobPay;
  created_at: string;
};

export function jobProgress(value: string): JobProgress | null {
  if (value === "processing" || value === "done" || value === "incomplete") return value;
  return null;
}

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    pay: row.pay,
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
    .select("id, title, description, pay, created_at")
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
    .select("status, created_at, jobs(id, title, description, pay, created_at)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    const missing = /relation|schema cache|does not exist/i.test(error.message);
    return {
      items: [] as ChosenJob[],
      error: missing ? databaseMessage : "Jobs could not be loaded.",
    };
  }

  const items = (data ?? [])
    .map((row) => {
      const job = row.jobs as JobRow | JobRow[] | null;
      const record = Array.isArray(job) ? job[0] : job;
      const status = jobProgress(String(row.status ?? ""));
      if (!record || !status) return null;
      return { ...mapJob(record), status, selectedAt: String(row.created_at) };
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

export async function addJob(input: { title: string; description: string; pay: string }) {
  const title = input.title.trim();
  const description = input.description.trim();
  const pay = jobPay(input.pay);
  if (title.length < 2) return { error: "Enter a job title." };
  if (title.length > 80) return { error: "Keep the title under 80 characters." };
  if (description.length < 2) return { error: "Write a short description." };
  if (description.length > 500) return { error: "Keep the description under 500 characters." };
  if (!pay) return { error: "Choose weekly or every two weeks." };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };

  const { error } = await supabase.from("jobs").insert({ title, description, pay });
  if (error) return { error: "The job could not be added." };
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

  const { error } = await supabase
    .from("job_selections")
    .update({ status: progress })
    .eq("user_id", userId)
    .eq("job_id", jobId);

  if (error) return { error: "That job status could not be saved." };
  return { error: "" };
}

export async function unselectJob(jobId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const userId = await currentUserId();
  if (!userId) return { error: "The job could not be removed." };

  const { error } = await supabase
    .from("job_selections")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);

  if (error) return { error: "The job could not be removed." };
  return { error: "" };
}
