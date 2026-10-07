import type { Locale } from "@/lib/i18n/locale";

const aboutEn = {
  eyebrow: "Company bio",
  hero: "Titan Connective connects companies, independent agents, and interested customers.",
  closer:
    "Connecting businesses, people, and opportunities.",
  work: "Our work",
  chapters: [
    {
      id: "Purpose",
      label: "Purpose",
      points: [
        "Safety products",
        "Energy solutions",
        "Digital media",
        "Software development",
        "Insurance affiliates",
      ],
      text: "Titan Connective is a customer acquisition, affiliate, marketing, and technology business. We connect companies, independent agents, and interested customers through safety products, energy solutions, digital media, software development, and insurance affiliates.",
    },
    {
      id: "Programs",
      label: "Programs",
      points: [
        "Auto, home, and renters",
        "Life, health, and business",
        "Commissions set by each program",
        "We are not the insurer",
      ],
      text: "Through affiliate and referral programs, we identify prospective customers, introduce relevant offers, and guide interested applicants through signup and onboarding. That includes insurance affiliates for auto, home, renters, life, health, and business coverage. We are not the insurer. Coverage, eligibility, and price are set by each partner’s program. Our business earns commissions for qualified leads, approved applications, enrollments, or completed sales, depending on that program.",
    },
    {
      id: "Approach",
      label: "Approach",
      points: [
        "Lead scouting",
        "Audience research",
        "Digital campaigns",
        "Onboarding support",
      ],
      text: "Our approach combines lead scouting, audience research, digital campaigns, and hands-on onboarding support. We focus on understanding partner requirements, communicating offers clearly, and helping customers complete the process accurately. Consent, lead quality, and reliable follow-through are central to how we work.",
    },
    {
      id: "Technology",
      label: "Technology",
      points: [
        "Websites and landing pages",
        "Intake forms",
        "Dashboards",
        "Workflow tools",
      ],
      text: "Behind that process is our technology capability. We develop websites, landing pages, intake forms, dashboards, and workflow tools that support campaigns, organize inquiries, and track results. Our media work connects the message to the audience; our software connects the inquiry to the next step.",
    },
  ],
};

const aboutEs: typeof aboutEn = {
  eyebrow: "Biografía de la empresa",
  hero: "Titan Connective conecta compañías, agentes independientes y clientes interesados.",
  closer:
    "Conectamos empresas, personas y oportunidades.",
  work: "Nuestro trabajo",
  chapters: [
    {
      id: "Purpose",
      label: "Propósito",
      points: [
        "Productos de seguridad",
        "Soluciones de energía",
        "Medios digitales",
        "Desarrollo de software",
        "Afiliados de seguros",
      ],
      text: "Titan Connective es un negocio de captación de clientes, afiliados, marketing y tecnología. Conectamos compañías, agentes independientes y clientes interesados mediante productos de seguridad, soluciones de energía, medios digitales, desarrollo de software y afiliados de seguros.",
    },
    {
      id: "Programs",
      label: "Programas",
      points: [
        "Auto, hogar e inquilinos",
        "Vida, salud y negocios",
        "Comisiones definidas por cada programa",
        "No somos la aseguradora",
      ],
      text: "Mediante programas de afiliados y referidos, identificamos clientes potenciales, presentamos ofertas pertinentes y guiamos a los solicitantes interesados durante el registro y la incorporación. Eso incluye afiliados de seguros de auto, hogar, inquilinos, vida, salud y negocios. No somos la aseguradora. La cobertura, la elegibilidad y el precio los define el programa de cada socio. Nuestro negocio gana comisiones por prospectos calificados, solicitudes aprobadas, inscripciones o ventas completadas, según ese programa.",
    },
    {
      id: "Approach",
      label: "Enfoque",
      points: [
        "Búsqueda de prospectos",
        "Investigación de audiencia",
        "Campañas digitales",
        "Apoyo de incorporación",
      ],
      text: "Nuestro enfoque combina búsqueda de prospectos, investigación de audiencia, campañas digitales y apoyo directo de incorporación. Nos concentramos en entender los requisitos del socio, comunicar las ofertas con claridad y ayudar a los clientes a completar el proceso con exactitud. El consentimiento, la calidad del prospecto y un seguimiento confiable son el centro de cómo trabajamos.",
    },
    {
      id: "Technology",
      label: "Tecnología",
      points: [
        "Sitios y páginas de destino",
        "Formularios de ingreso",
        "Paneles",
        "Herramientas de flujo",
      ],
      text: "Detrás de ese proceso está nuestra capacidad tecnológica. Desarrollamos sitios, páginas de destino, formularios de ingreso, paneles y herramientas de flujo que sostienen las campañas, organizan las consultas y siguen los resultados. Nuestro trabajo de medios conecta el mensaje con la audiencia; nuestro software conecta la consulta con el siguiente paso.",
    },
  ],
};

const affiliateEn = {
  eyebrow: "Partner programs",
  title: "Partner with Titan",
  alt: "Two professionals reviewing a folder in a bright office.",
  linesLabel: "Lines of business",
  lines: [
    "Safety products",
    "Energy solutions",
    "Digital media",
    "Software development",
    "Insurance affiliates",
  ],
  purpose: "Purpose",
  purposeLead:
    "Titan Connective connects companies, independent agents, and interested customers. Companies offer partner programs. Members review the requirements, and approved participants submit qualifying results.",
  purposeBody:
    "The work covers safety products, energy solutions, digital media, software development, and insurance affiliates. Through affiliate and referral programs, we identify prospective customers, introduce relevant offers, and guide interested applicants through signup and onboarding.",
  insurance: "Insurance",
  insuranceBody:
    "Insurance is part of that work. We introduce affiliate offers for auto, home, renters, life, health, and business coverage. We are not the insurer. Coverage, eligibility, and price are set by each partner’s program, and an inquiry is not a quote or a promise of coverage.",
  sequence: "Sequence",
  sequenceTitle: "That work follows a clear sequence.",
  sequenceItems: [
    {
      title: "Lead scouting",
      text: "Finds people whose needs match a partner’s program.",
    },
    {
      title: "Audience research",
      text: "Learns who the offer is for, and what a clear decision requires.",
    },
    {
      title: "Digital campaigns",
      text: "Present the offer plainly, where that audience already is.",
    },
    {
      title: "Onboarding support",
      text: "Guides interested applicants through signup, accurately and completely.",
    },
  ],
  commission:
    "Our business earns commissions for qualified leads, approved applications, enrollments, or completed sales, depending on each partner’s program. What we earn is set by that program. It is not a promise that a particular application, enrollment, or sale will be approved.",
  standards: "Standards",
  standardsTitle:
    "Consent, lead quality, and reliable follow-through are central to how we work.",
  standardsItems: [
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
  ],
  technology: "Technology",
  technologyBody:
    "Behind that process is our technology. We develop websites, landing pages, intake forms, dashboards, and workflow tools that support campaigns, organize inquiries, and track results. Media connects the message to the audience. Software connects the inquiry to the next step.",
  tools: [
    "Websites",
    "Landing pages",
    "Intake forms",
    "Dashboards",
    "Workflow tools",
  ],
  closer:
    "Connecting businesses, people, and opportunities.",
};

const affiliateEs: typeof affiliateEn = {
  eyebrow: "Programas de socios",
  title: "Asóciese con Titan",
  alt: "Dos profesionales revisan una carpeta en una oficina luminosa.",
  linesLabel: "Líneas de negocio",
  lines: [
    "Productos de seguridad",
    "Soluciones de energía",
    "Medios digitales",
    "Desarrollo de software",
    "Afiliados de seguros",
  ],
  purpose: "Propósito",
  purposeLead:
    "Titan Connective conecta compañías, agentes independientes y clientes interesados. Las compañías ofrecen programas de socios. Los miembros revisan los requisitos y los participantes aprobados envían resultados que califican.",
  purposeBody:
    "El trabajo cubre productos de seguridad, soluciones de energía, medios digitales, desarrollo de software y afiliados de seguros. Mediante programas de afiliados y referidos, identificamos clientes potenciales, presentamos ofertas pertinentes y guiamos a los solicitantes interesados durante el registro y la incorporación.",
  insurance: "Seguros",
  insuranceBody:
    "Los seguros forman parte de ese trabajo. Presentamos ofertas de afiliados para cobertura de auto, hogar, inquilinos, vida, salud y negocios. No somos la aseguradora. La cobertura, la elegibilidad y el precio los define el programa de cada socio, y una consulta no es una cotización ni una promesa de cobertura.",
  sequence: "Secuencia",
  sequenceTitle: "Ese trabajo sigue una secuencia clara.",
  sequenceItems: [
    {
      title: "Búsqueda de prospectos",
      text: "Encuentra personas cuyas necesidades coinciden con el programa de un socio.",
    },
    {
      title: "Investigación de audiencia",
      text: "Aprende para quién es la oferta y qué requiere una decisión clara.",
    },
    {
      title: "Campañas digitales",
      text: "Presentan la oferta con claridad, donde esa audiencia ya está.",
    },
    {
      title: "Apoyo de incorporación",
      text: "Guía a los solicitantes interesados durante el registro, con exactitud y por completo.",
    },
  ],
  commission:
    "Nuestro negocio gana comisiones por prospectos calificados, solicitudes aprobadas, inscripciones o ventas completadas, según el programa de cada socio. Lo que ganamos lo define ese programa. No es una promesa de que una solicitud, inscripción o venta en particular será aprobada.",
  standards: "Normas",
  standardsTitle:
    "El consentimiento, la calidad del prospecto y un seguimiento confiable son el centro de cómo trabajamos.",
  standardsItems: [
    {
      title: "Consentimiento",
      text: "Las personas escuchan una oferta clara y eligen si continúan.",
    },
    {
      title: "Calidad del prospecto",
      text: "Las consultas se relacionan con los requisitos del socio antes de avanzar.",
    },
    {
      title: "Seguimiento",
      text: "Acompañamos el proceso hasta que el siguiente paso está hecho.",
    },
  ],
  technology: "Tecnología",
  technologyBody:
    "Detrás de ese proceso está nuestra tecnología. Desarrollamos sitios, páginas de destino, formularios de ingreso, paneles y herramientas de flujo que sostienen las campañas, organizan las consultas y siguen los resultados. Los medios conectan el mensaje con la audiencia. El software conecta la consulta con el siguiente paso.",
  tools: [
    "Sitios",
    "Páginas de destino",
    "Formularios de ingreso",
    "Paneles",
    "Herramientas de flujo",
  ],
  closer:
    "Conectamos empresas, personas y oportunidades.",
};

export function aboutCopy(locale: Locale) {
  return locale === "es" ? aboutEs : aboutEn;
}

export function affiliateCopy(locale: Locale) {
  return locale === "es" ? affiliateEs : affiliateEn;
}
