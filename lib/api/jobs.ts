import { listChosenJobs } from "@/lib/jobs";

export async function listMemberJobs() {
  return listChosenJobs();
}

export async function acceptOpportunity(): Promise<{ error: string }> {
  // TODO: connect acceptance to a marketplace assignment when that table exists.
  return { error: "Accepting a catalog opportunity is not available from this screen." };
}
