export const site = {
  name: "Titan Connective",
  description:
    "Connecting businesses, people, and opportunities. Titan Connective connects companies, independent agents, and interested customers through partner programs, marketing, and technology. titanconnective.com",
  contactEmail: "admin@titansafetystore.com",
  nav: [
    { href: "/about", label: "About" },
    { href: "/#opportunities", label: "Opportunities" },
    { href: "/#work", label: "Work" },
    { href: "/#approach", label: "Approach" },
    { href: "/affiliate", label: "Partner programs" },
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
  {
    title: "Transparent compensation",
    text: "The workflow is designed to show the compensation type, the payout schedule, and what must be verified before a result is payable.",
  },
  {
    title: "Tracked results",
    text: "The workflow is designed to show a submission from review through approval, reversal, or payout.",
  },
] as const;

export const tools = [
  {
    title: "Websites",
    image: "/tech-websites.jpg",
    text: "Campaign sites that give an offer a clear place to be seen.",
    detail:
      "We develop websites that support a campaign and give people a clear place to learn about an offer. Media connects the message to the audience.",
    points: [
      "A clear page for the offer",
      "Support for the campaign",
      "A place to start an inquiry",
    ],
  },
  {
    title: "Landing pages",
    image: "/tech-landing.jpg",
    text: "A focused page for one offer.",
    detail:
      "Landing pages present a relevant offer plainly, so an interested person can move to the next step. A page is not a promise of approval.",
    points: [
      "One offer, stated plainly",
      "A path to the next step",
      "Not a promise of approval",
    ],
  },
  {
    title: "Intake forms",
    image: "/tech-forms.jpg",
    text: "Forms that organize an inquiry.",
    detail:
      "Intake forms collect what a partner’s program needs, so an inquiry can be organized and followed through accurately.",
    points: [
      "The fields a program asks for",
      "Inquiries kept in order",
      "Accurate follow-through",
    ],
  },
  {
    title: "Dashboards",
    image: "/tech-dashboards.jpg",
    text: "A view of inquiries and results.",
    detail:
      "Dashboards organize inquiries and track results for a campaign, so the team can see what moved forward.",
    points: [
      "Inquiries in one view",
      "Results for the campaign",
      "What moved to the next step",
    ],
  },
  {
    title: "Workflow tools",
    image: "/tech-workflow.jpg",
    text: "Tools that carry an inquiry to the next step.",
    detail:
      "Workflow tools connect an inquiry to signup and onboarding, so the process stays clear from first interest to a qualified opportunity.",
    points: [
      "From inquiry to the next step",
      "Signup and onboarding support",
      "A clear path through the process",
    ],
  },
] as const;
