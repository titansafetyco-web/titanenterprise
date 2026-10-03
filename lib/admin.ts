export const inquiries = [
  {
    ref: "TS-2408",
    program: "Safety products",
    stage: "Qualified",
    next: "Confirm consent and start onboarding",
  },
  {
    ref: "TS-2407",
    program: "Energy solutions",
    stage: "Onboarding",
    next: "Finish the application",
  },
  {
    ref: "TS-2406",
    program: "Digital media",
    stage: "New",
    next: "Match the offer to the inquiry",
  },
  {
    ref: "TS-2405",
    program: "Software development",
    stage: "Enrolled",
    next: "Track the completed signup",
  },
  {
    ref: "TS-2404",
    program: "Safety products",
    stage: "New",
    next: "Review partner requirements",
  },
] as const;

export const campaigns = [
  {
    name: "Safety product signup",
    channel: "Digital campaign",
    status: "Live",
  },
  { name: "Energy offer", channel: "Referral", status: "Review" },
  { name: "Audience landing page", channel: "Media", status: "Live" },
  { name: "Intake workflow", channel: "Software", status: "Building" },
] as const;

export type InquiryStage = (typeof inquiries)[number]["stage"];
