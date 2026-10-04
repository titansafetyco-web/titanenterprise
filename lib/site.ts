export const site = {
  name: "Titan Safety Co.",
  description:
    "Titan Safety Co. connects people with essential products and services, including insurance affiliates, and helps partners turn that demand into business.",
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
    points: [
      "Match a need to a partner’s safety program",
      "Explain the offer in plain language",
      "Guide interested applicants through signup",
      "The person chooses whether to continue",
    ],
  },
  {
    title: "Energy solutions",
    image: "/work-energy.jpg",
    text: "Offers that help households and businesses choose with confidence.",
    detail:
      "We introduce relevant energy offers to households and businesses, then stay with interested applicants through signup and onboarding. What we earn depends on the partner’s program: a qualified lead, an approved application, an enrollment, or a completed sale.",
    points: [
      "Households and businesses",
      "A relevant energy offer, explained clearly",
      "Support through signup and onboarding",
      "Commission set by the partner’s program",
    ],
  },
  {
    title: "Digital media",
    image: "/work-media-campaign.jpg",
    text: "Campaigns that carry a clear message to the right audience.",
    detail:
      "Audience research tells us who an offer is for. Digital campaigns present that offer plainly, where that audience already is. Media connects the message to the audience.",
    points: [
      "Research who the offer is for",
      "Say what a clear decision requires",
      "Place the message where that audience already is",
      "Connect the message to the audience",
    ],
  },
  {
    title: "Software development",
    image: "/work-software-dev.jpg",
    text: "Sites, forms, and tools that carry an inquiry to the next step.",
    detail:
      "We build websites, landing pages, intake forms, dashboards, and workflow tools. They support a campaign, organize inquiries, and track results. Software connects the inquiry to the next step.",
    points: [
      "Websites and landing pages",
      "Intake forms",
      "Dashboards and workflow tools",
      "An inquiry connected to the next step",
    ],
  },
  {
    title: "Insurance",
    image: "/work-insurance.jpg",
    text: "Affiliate offers across auto, home, renters, life, health, and business coverage.",
    detail:
      "We also work through insurance affiliates. We introduce relevant offers for auto, home, renters, life, health, and business coverage, then guide interested applicants through signup and onboarding. Coverage, eligibility, and price are set by each partner’s program. We are not the insurer, and an inquiry is not a quote or a promise of coverage.",
    points: [
      "Auto, home, and renters",
      "Life, health, and business",
      "Signup and onboarding support",
      "We are not the insurer",
    ],
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
    detail:
      "We look for prospective customers whose needs match a partner’s program, then introduce a relevant offer. That search covers safety products, energy solutions, digital media, software development, and insurance affiliates. A match is the start of a conversation. It is not an approved application, enrollment, or sale.",
    points: [
      "Safety products and energy solutions",
      "Digital media and software development",
      "Insurance affiliates",
      "A match starts the conversation",
    ],
  },
  {
    title: "Audience research",
    text: "Learn who the offer is for, and what a clear decision requires.",
    detail:
      "Before an offer is presented, we learn who it is for and what a clear decision requires. We read the partner’s requirements so the message fits the people it is meant to reach. The offer is explained plainly, and people choose whether to continue.",
    points: [
      "Who the offer is for",
      "What a clear decision requires",
      "Partner requirements, read first",
      "People choose whether to continue",
    ],
  },
  {
    title: "Digital campaigns",
    text: "Present the offer plainly, where that audience already is.",
    detail:
      "Campaigns carry a clear message to the right audience. We present the offer where those people already are, through websites, landing pages, and the media that connects the message to them. The page describes the offer. It does not promise that a particular application will be approved.",
    points: [
      "A clear message for the right audience",
      "Websites and landing pages",
      "Media connects the message to the audience",
      "The page is not a promise of approval",
    ],
  },
  {
    title: "Onboarding support",
    text: "Guide interested applicants through signup, accurately and completely.",
    detail:
      "When someone wants to continue, we guide them through signup and onboarding accurately and completely. Inquiries are matched to partner requirements before they move forward, and we stay with the process until the next step is done. For insurance, we are not the insurer. Coverage, eligibility, and price stay with that partner’s program.",
    points: [
      "Signup, accurately and completely",
      "Matched to partner requirements",
      "Follow-through until the next step",
      "Insurance: we are not the insurer",
    ],
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
