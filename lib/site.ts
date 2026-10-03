export const site = {
  name: "Titan Safety Co.",
  description:
    "Titan Safety Co. connects people with essential products and services, and helps partners turn that demand into business.",
  contactEmail: "" as string,
  nav: [
    { href: "/about", label: "About" },
    { href: "/#work", label: "Work" },
    { href: "/#approach", label: "Approach" },
    { href: "/#contact", label: "Contact" },
    { href: "/affiliate", label: "Affiliate programs" },
  ],
} as const;

export const offerings = [
  {
    title: "Safety products",
    image: "/work-safety.jpg",
    text: "Essential products, introduced to people who need them.",
    detail:
      "We find people whose needs match a partner’s safety program, explain the offer clearly, and guide interested applicants through signup. People hear a clear offer and choose whether to continue.",
  },
  {
    title: "Energy solutions",
    image: "/work-energy.jpg",
    text: "Offers that help households and businesses choose with confidence.",
    detail:
      "We introduce relevant energy offers to households and businesses, then stay with interested applicants through signup and onboarding. What we earn depends on the partner’s program: a qualified lead, an approved application, an enrollment, or a completed sale.",
  },
  {
    title: "Digital media",
    image: "/work-media.jpg",
    text: "Campaigns that carry a clear message to the right audience.",
    detail:
      "Audience research tells us who an offer is for. Digital campaigns present that offer plainly, where that audience already is. Media connects the message to the audience.",
  },
  {
    title: "Software development",
    image: "/work-software.jpg",
    text: "Sites, forms, and tools that carry an inquiry to the next step.",
    detail:
      "We build websites, landing pages, intake forms, dashboards, and workflow tools. They support a campaign, organize inquiries, and track results. Software connects the inquiry to the next step.",
  },
] as const;

export const contactTopics = [
  ...offerings.map((item) => item.title),
  "Affiliate program",
  "General",
] as const;

export const steps = [
  {
    title: "Lead scouting",
    text: "Find people whose needs match a partner’s program.",
  },
  {
    title: "Audience research",
    text: "Learn who the offer is for, and what a clear decision requires.",
  },
  {
    title: "Digital campaigns",
    text: "Present the offer plainly, where that audience already is.",
  },
  {
    title: "Onboarding support",
    text: "Guide interested applicants through signup, accurately and completely.",
  },
] as const;

export const standards = [
  {
    title: "Consent",
    text: "People hear a clear offer and choose whether to continue.",
  },
  {
    title: "Lead quality",
    text: "Inquiries are matched to partner requirements before they move forward.",
  },
  {
    title: "Follow-through",
    text: "We stay with the process until the next step is done.",
  },
] as const;

export const tools = [
  "Websites",
  "Landing pages",
  "Intake forms",
  "Dashboards",
  "Workflow tools",
] as const;
