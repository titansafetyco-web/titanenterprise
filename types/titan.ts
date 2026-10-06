export type JobStatus =
  | "available"
  | "accepted"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "partner_verified"
  | "approved"
  | "payable"
  | "paid"
  | "rejected"
  | "reversed";

export type LiveJobStatus = "processing" | "done" | "incomplete";

export type Opportunity = {
  id: string;
  title: string;
  category: string;
  description: string;
  compensationLabel: string;
  compensationAmount: string;
  compensationType: string;
  payoutSchedule: string;
  verificationTime: string;
  difficulty: string;
  remote: boolean;
  requirements: string[];
  status: JobStatus;
  featured: boolean;
  trainingRequired: boolean;
  qualifies: string[];
  doesNotQualify: string[];
  steps: string[];
  documents: string[];
  verification: string;
  reversal: string;
};

export type JobAssignment = {
  id: string;
  opportunityId: string;
  memberId: string;
  status: JobStatus | LiveJobStatus;
  acceptedAt: string;
  dueAt: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  compensationCents: number | null;
};

export type Submission = {
  id: string;
  assignmentId: string;
  notes: string;
  attachments: string[];
  status: JobStatus | LiveJobStatus;
  submittedAt: string;
};

export type Commission = {
  id: string;
  memberId: string;
  opportunityId: string;
  amountCents: number;
  status: JobStatus;
  createdAt: string;
};

export type LedgerEntry = {
  id: string;
  memberId: string;
  type: "pending" | "approved" | "available" | "paid" | "reversed" | "adjustment";
  amountCents: number;
  description: string;
  createdAt: string;
  opportunityId: string | null;
};

export type Payout = {
  id: string;
  memberId: string;
  amountCents: number;
  method: string;
  status: "pending" | "processing" | "paid" | "failed" | "sent";
  scheduledFor: string | null;
  paidAt: string | null;
  reference: string;
};

export type AdminPayoutQueueStatus = "ready" | "hold";

export type AdminPayoutQueueItem = {
  memberId: string;
  name: string;
  email: string;
  role: "agent" | "affiliate" | "team" | "member";
  balanceCents: number;
  eligibleCents: number;
  status: AdminPayoutQueueStatus;
  reason: string;
};

export type AdminPayoutBatchSummary = {
  thresholdCents: number;
  totalMembers: number;
  readyMembers: number;
  heldMembers: number;
  readyCents: number;
  heldCents: number;
  generatedAt: string;
};

export type TrainingModule = {
  id: string;
  title: string;
  description: string;
  duration: string;
  requiredScore: string;
  status: "not_started" | "in_progress" | "completed" | "passed" | "locked";
};

export type MemberPerformance = {
  memberId: string;
  qualityScore: number | null;
  approvalRate: number | null;
  partnerRejectionRate: number | null;
  duplicateRate: number | null;
  reversalRate: number | null;
  level: string | null;
};
