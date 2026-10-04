import type { Locale } from "@/lib/i18n/locale";

export type LegalBlock =
  | string
  | { items: string[] }
  | {
      before: string;
      href: string;
      label: string;
      after: string;
    }
  | {
      before: string;
      href: string;
      label: string;
      middle: string;
      href2: string;
      label2: string;
      after: string;
    };

export type LegalDoc = {
  eyebrow: string;
  title: string;
  sections: { title: string; blocks: LegalBlock[] }[];
};

const privacyEn: LegalDoc = {
  eyebrow: "Policies",
  title: "Privacy policy",
  sections: [
    {
      title: "What this covers",
      blocks: [
        "This policy describes the information the Titan Safety Co. website keeps. It covers accounts, contact messages, the sign-in session, and the cookie notice.",
      ],
    },
    {
      title: "Information you give us",
      blocks: [
        "If you create an account, we keep your name, email, and a scrambled version of your password. We do not keep the password itself. A new account stays pending until it is approved or denied.",
        "If you use the contact form, we keep your name, email, the subject you chose, and your message, along with the time it was sent. A signed-in person can read those messages on the dashboard.",
        "If you use the chat, we keep your name, email, and message, along with the time it was sent. Those notes are read on the same dashboard. A signed-in chat uses the name and email on your account.",
        "If you use the affiliate onboarding form, we keep your name, email, phone number, the programs you chose, your experience, any note, and the time it was sent. A signed-in person can read those forms on the dashboard and approve or deny them.",
        "Insurance is one of those programs. If you ask about auto, home, renters, life, health, or business coverage, we keep the same kind of note: your name, email, the program you chose, any message, and the time it was sent. We are not the insurer. We do not use that note to issue a policy, and we do not sell it.",
      ],
    },
    {
      title: "What stays in your browser",
      blocks: [
        "The cookie notice saves your choice, Allow or Decline, in this browser so the notice does not keep appearing. That choice stays on your device. It is not sent to us.",
        "When you sign in, the site sets a session cookie so you stay signed in. The cookie is marked so page scripts cannot read it. Signing out removes it.",
      ],
    },
    {
      title: "How we use it",
      blocks: [
        "Account details are used to sign you in. Contact messages and chat notes are used so the team can read what you sent. We do not sell personal information, and this site does not run third-party advertising or analytics.",
      ],
    },
    {
      title: "How to reach us",
      blocks: [
        {
          before: "Questions about this policy can go through the ",
          href: "/#contact",
          label: "contact form",
          middle: ". The ",
          href2: "/terms",
          label2: "terms of service",
          after: " cover use of the site.",
        },
      ],
    },
  ],
};

const privacyEs: LegalDoc = {
  eyebrow: "Políticas",
  title: "Política de privacidad",
  sections: [
    {
      title: "Qué cubre esto",
      blocks: [
        "Esta política describe la información que conserva el sitio de Titan Safety Co. Cubre cuentas, mensajes de contacto, la sesión de inicio y el aviso de cookies.",
      ],
    },
    {
      title: "Información que usted nos da",
      blocks: [
        "Si crea una cuenta, conservamos su nombre, correo y una versión cifrada de su contraseña. No conservamos la contraseña en sí. Una cuenta nueva permanece pendiente hasta que se aprueba o se rechaza.",
        "Si usa el formulario de contacto, conservamos su nombre, correo, el asunto que eligió y su mensaje, junto con la hora de envío. Una persona con sesión iniciada puede leer esos mensajes en el panel.",
        "Si usa el chat, conservamos su nombre, correo y mensaje, junto con la hora de envío. Esas notas se leen en el mismo panel. Un chat con sesión iniciada usa el nombre y el correo de su cuenta.",
        "Si usa el formulario de incorporación de afiliados, conservamos su nombre, correo, teléfono, los programas que eligió, su experiencia, cualquier nota y la hora de envío. Una persona con sesión iniciada puede leer esos formularios en el panel y aprobarlos o rechazarlos.",
        "Los seguros son uno de esos programas. Si pregunta por cobertura de auto, hogar, inquilinos, vida, salud o negocios, conservamos el mismo tipo de nota: su nombre, correo, el programa que eligió, cualquier mensaje y la hora de envío. No somos la aseguradora. No usamos esa nota para emitir una póliza, y no la vendemos.",
      ],
    },
    {
      title: "Qué permanece en su navegador",
      blocks: [
        "El aviso de cookies guarda su elección, Permitir o Rechazar, en este navegador para que el aviso no siga apareciendo. Esa elección permanece en su dispositivo. No se nos envía.",
        "Cuando inicia sesión, el sitio coloca una cookie de sesión para que siga con la sesión iniciada. La cookie está marcada para que los scripts de la página no puedan leerla. Cerrar sesión la elimina.",
      ],
    },
    {
      title: "Cómo la usamos",
      blocks: [
        "Los datos de la cuenta se usan para iniciar su sesión. Los mensajes de contacto y las notas de chat se usan para que el equipo lea lo que usted envió. No vendemos información personal, y este sitio no ejecuta publicidad ni analítica de terceros.",
      ],
    },
    {
      title: "Cómo contactarnos",
      blocks: [
        {
          before: "Las preguntas sobre esta política pueden ir por el ",
          href: "/#contact",
          label: "formulario de contacto",
          middle: ". Los ",
          href2: "/terms",
          label2: "términos del servicio",
          after: " cubren el uso del sitio.",
        },
      ],
    },
  ],
};

const termsEn: LegalDoc = {
  eyebrow: "Policies",
  title: "Terms of service",
  sections: [
    {
      title: "The site",
      blocks: [
        "These terms cover the Titan Safety Co. website. By using the site, you agree to them. If you do not agree, please leave the site.",
      ],
    },
    {
      title: "What we do",
      blocks: [
        "Titan Safety Co. connects people with essential products and services and helps partners turn that demand into business. Through affiliate and referral programs, we identify prospective customers, introduce relevant offers, and guide interested applicants through signup and onboarding.",
        {
          before: "We earn commissions for qualified leads, approved applications, enrollments, or completed sales, depending on each partner’s program. The ",
          href: "/affiliate-policy",
          label: "affiliate policy",
          after:
            " describes that work. It is not a promise that a particular application, enrollment, or sale will be approved.",
        },
      ],
    },
    {
      title: "Insurance affiliates",
      blocks: [
        "We also introduce insurance through affiliate and referral programs. The offers can cover auto, home, renters, life, health, and business insurance. We identify prospective customers, explain the offer, and guide interested applicants through signup and onboarding.",
        "Titan Safety Co. is not the insurance company. Coverage, eligibility, and price are set by each partner’s program. A page or form on this site is not a quote, a policy, or a promise that coverage will be offered or approved. Any commission we earn depends on that program: a qualified lead, an approved application, an enrollment, or a completed sale.",
      ],
    },
    {
      title: "Accounts",
      blocks: [
        "You may create an account with your name, email, and a password. You are responsible for keeping that password private and for activity under your account. A new account can sign in after it is approved. A signed-in account can open the dashboard.",
      ],
    },
    {
      title: "Messages",
      blocks: [
        "The contact form sends a note to the team: your name, email, subject, and message. The chat sends a note the same way, with your name, email, and message. The affiliate onboarding form sends your name, email, phone number, the programs you chose, your experience, and any note. Send only information you are willing for the team to read. We may not reply to every note.",
      ],
    },
    {
      title: "Use of the site",
      blocks: [
        "Use the site for its stated purpose. Do not attempt to break it, misuse an account, or send a message that is unlawful or misleading. We may refuse a message or close an account that is used that way.",
      ],
    },
    {
      title: "Changes",
      blocks: [
        {
          before: "We may update these terms as the site changes. The ",
          href: "/privacy",
          label: "privacy policy",
          after: " explains what information the site keeps.",
        },
      ],
    },
  ],
};

const termsEs: LegalDoc = {
  eyebrow: "Políticas",
  title: "Términos del servicio",
  sections: [
    {
      title: "El sitio",
      blocks: [
        "Estos términos cubren el sitio de Titan Safety Co. Al usar el sitio, usted los acepta. Si no está de acuerdo, deje el sitio.",
      ],
    },
    {
      title: "Qué hacemos",
      blocks: [
        "Titan Safety Co. conecta a las personas con productos y servicios esenciales y ayuda a los socios a convertir esa demanda en negocio. Mediante programas de afiliados y referidos, identificamos clientes potenciales, presentamos ofertas pertinentes y guiamos a los solicitantes interesados durante el registro y la incorporación.",
        {
          before:
            "Ganamos comisiones por prospectos calificados, solicitudes aprobadas, inscripciones o ventas completadas, según el programa de cada socio. La ",
          href: "/affiliate-policy",
          label: "política de afiliados",
          after:
            " describe ese trabajo. No es una promesa de que una solicitud, inscripción o venta en particular será aprobada.",
        },
      ],
    },
    {
      title: "Afiliados de seguros",
      blocks: [
        "También presentamos seguros mediante programas de afiliados y referidos. Las ofertas pueden cubrir seguros de auto, hogar, inquilinos, vida, salud y negocios. Identificamos clientes potenciales, explicamos la oferta y guiamos a los solicitantes interesados durante el registro y la incorporación.",
        "Titan Safety Co. no es la compañía de seguros. La cobertura, la elegibilidad y el precio los define el programa de cada socio. Una página o un formulario de este sitio no es una cotización, una póliza ni una promesa de que se ofrecerá o aprobará cobertura. Cualquier comisión que ganemos depende de ese programa: un prospecto calificado, una solicitud aprobada, una inscripción o una venta completada.",
      ],
    },
    {
      title: "Cuentas",
      blocks: [
        "Puede crear una cuenta con su nombre, correo y una contraseña. Usted es responsable de mantener esa contraseña en privado y de la actividad bajo su cuenta. Una cuenta nueva puede iniciar sesión después de ser aprobada. Una cuenta con sesión iniciada puede abrir el panel.",
      ],
    },
    {
      title: "Mensajes",
      blocks: [
        "El formulario de contacto envía una nota al equipo: su nombre, correo, asunto y mensaje. El chat envía una nota del mismo modo, con su nombre, correo y mensaje. El formulario de incorporación de afiliados envía su nombre, correo, teléfono, los programas que eligió, su experiencia y cualquier nota. Envíe solo información que esté dispuesto a que el equipo lea. Puede que no respondamos a cada nota.",
      ],
    },
    {
      title: "Uso del sitio",
      blocks: [
        "Use el sitio para su propósito declarado. No intente dañarlo, usar mal una cuenta ni enviar un mensaje ilícito o engañoso. Podemos rechazar un mensaje o cerrar una cuenta que se use de ese modo.",
      ],
    },
    {
      title: "Cambios",
      blocks: [
        {
          before: "Podemos actualizar estos términos a medida que el sitio cambia. La ",
          href: "/privacy",
          label: "política de privacidad",
          after: " explica qué información conserva el sitio.",
        },
      ],
    },
  ],
};

const policyEn: LegalDoc = {
  eyebrow: "Policies",
  title: "Affiliate policy",
  sections: [
    {
      title: "What this covers",
      blocks: [
        "This policy describes how Titan Safety Co. works through affiliate and referral programs. It covers the programs listed on this site, the onboarding form, and how a commission is earned.",
      ],
    },
    {
      title: "How a program works",
      blocks: [
        {
          before:
            "Through affiliate and referral programs, we identify prospective customers, introduce relevant offers, and guide interested applicants through signup and onboarding. The programs you can choose are the ones currently listed on the ",
          href: "/affiliate",
          label: "affiliate programs",
          after: " page. The team adds and removes those names.",
        },
        "Sending the onboarding form tells the team which program you chose. It does not, by itself, approve an application, complete an enrollment, or finish a sale.",
      ],
    },
    {
      title: "Insurance",
      blocks: [
        "Insurance affiliates are part of this work. We introduce offers for auto, home, renters, life, health, and business coverage, then guide interested applicants through signup and onboarding.",
        "We are not the insurer. Coverage, eligibility, and price are set by each partner’s program. Choosing Insurance on the onboarding form, or reading about it on this site, is not a quote and is not a promise that coverage will be offered or approved.",
      ],
    },
    {
      title: "Commissions",
      blocks: [
        "Our business earns commissions for qualified leads, approved applications, enrollments, or completed sales, depending on each partner’s program. What counts, and what is paid, is set by that program.",
        "A description on this site is not a promise that a particular application, enrollment, or sale will be approved, or that a commission will be paid.",
      ],
    },
    {
      title: "How we work",
      blocks: [
        "Consent, lead quality, and reliable follow-through are central to how we work. People hear a clear offer and choose whether to continue. Inquiries are matched to partner requirements before they move forward. We stay with the process until the next step is done.",
      ],
    },
    {
      title: "What the form keeps",
      blocks: [
        {
          before:
            "The onboarding form keeps your name, email, phone number, the programs you chose, your experience, any note, and the time it was sent. A signed-in person can read those forms on the dashboard. The ",
          href: "/privacy",
          label: "privacy policy",
          middle: " describes that information. The ",
          href2: "/terms",
          label2: "terms of service",
          after: " cover use of the site.",
        },
      ],
    },
  ],
};

const policyEs: LegalDoc = {
  eyebrow: "Políticas",
  title: "Política de afiliados",
  sections: [
    {
      title: "Qué cubre esto",
      blocks: [
        "Esta política describe cómo Titan Safety Co. trabaja mediante programas de afiliados y referidos. Cubre los programas listados en este sitio, el formulario de incorporación y cómo se gana una comisión.",
      ],
    },
    {
      title: "Cómo funciona un programa",
      blocks: [
        {
          before:
            "Mediante programas de afiliados y referidos, identificamos clientes potenciales, presentamos ofertas pertinentes y guiamos a los solicitantes interesados durante el registro y la incorporación. Los programas que puede elegir son los que aparecen ahora en la página de ",
          href: "/affiliate",
          label: "programas de afiliados",
          after: ". El equipo agrega y quita esos nombres.",
        },
        "Enviar el formulario de incorporación le dice al equipo qué programa eligió. Por sí solo, no aprueba una solicitud, no completa una inscripción ni termina una venta.",
      ],
    },
    {
      title: "Seguros",
      blocks: [
        "Los afiliados de seguros forman parte de este trabajo. Presentamos ofertas de cobertura de auto, hogar, inquilinos, vida, salud y negocios, y luego guiamos a los solicitantes interesados durante el registro y la incorporación.",
        "No somos la aseguradora. La cobertura, la elegibilidad y el precio los define el programa de cada socio. Elegir Seguros en el formulario de incorporación, o leer sobre ello en este sitio, no es una cotización ni una promesa de que se ofrecerá o aprobará cobertura.",
      ],
    },
    {
      title: "Comisiones",
      blocks: [
        "Nuestro negocio gana comisiones por prospectos calificados, solicitudes aprobadas, inscripciones o ventas completadas, según el programa de cada socio. Qué cuenta, y qué se paga, lo define ese programa.",
        "Una descripción en este sitio no es una promesa de que una solicitud, inscripción o venta en particular será aprobada, ni de que se pagará una comisión.",
      ],
    },
    {
      title: "Cómo trabajamos",
      blocks: [
        "El consentimiento, la calidad del prospecto y un seguimiento confiable son el centro de cómo trabajamos. Las personas escuchan una oferta clara y eligen si continúan. Las consultas se relacionan con los requisitos del socio antes de avanzar. Acompañamos el proceso hasta que el siguiente paso está hecho.",
      ],
    },
    {
      title: "Qué conserva el formulario",
      blocks: [
        {
          before:
            "El formulario de incorporación conserva su nombre, correo, teléfono, los programas que eligió, su experiencia, cualquier nota y la hora de envío. Una persona con sesión iniciada puede leer esos formularios en el panel. La ",
          href: "/privacy",
          label: "política de privacidad",
          middle: " describe esa información. Los ",
          href2: "/terms",
          label2: "términos del servicio",
          after: " cubren el uso del sitio.",
        },
      ],
    },
  ],
};

export function privacyCopy(locale: Locale) {
  return locale === "es" ? privacyEs : privacyEn;
}

export function termsCopy(locale: Locale) {
  return locale === "es" ? termsEs : termsEn;
}

export function policyCopy(locale: Locale) {
  return locale === "es" ? policyEs : policyEn;
}

const payoutEn: LegalDoc = {
  eyebrow: "Policies",
  title: "Payout policy",
  sections: [
    {
      title: "Version 1.0",
      blocks: ["Effective date: October 4, 2026."],
    },
    {
      title: "Purpose and scope",
      blocks: [
        "This policy explains how Titan Safety Co. (“Titan,” “we,” “us,” or “our”) calculates, approves, and pays compensation to participating agents and members for qualifying affiliate results and agreed contractor jobs.",
        "The terms “agent” and “member” describe platform roles and do not determine employment status. Employee wages are handled through a separate payroll process. Applicable legal payment requirements take priority over conflicting provisions in this policy.",
      ],
    },
    {
      title: "How compensation is earned",
      blocks: [
        "Each offer or written job agreement identifies:",
        {
          items: [
            "The work or qualifying result required.",
            "The compensation amount or calculation.",
            "Required documentation or evidence.",
            "Approval and validation requirements.",
            "Any applicable cancellation or reversal conditions.",
            "Any specific payment due date.",
          ],
        },
        "Compensation may be a fixed amount per qualified lead, application, enrollment, sale, or accepted deliverable. An offer may also provide percentage-based compensation with a clearly defined calculation.",
        "Creating an account, submitting a lead, or completing an application does not automatically qualify a member for payment. The requirements stated in the applicable offer must be satisfied.",
        "Titan records the compensation rate applicable when work is accepted or a qualifying referral is attributed. Later rate changes apply prospectively and do not change compensation for previously accepted work.",
      ],
    },
  ],
};

const payoutEs: LegalDoc = {
  eyebrow: "Políticas",
  title: "Política de pagos",
  sections: [
    {
      title: "Versión 1.0",
      blocks: ["Fecha de vigencia: 4 de octubre de 2026."],
    },
    {
      title: "Propósito y alcance",
      blocks: [
        "Esta política explica cómo Titan Safety Co. (“Titan”, “nosotros” o “nuestro”) calcula, aprueba y paga la compensación a los agentes y miembros participantes por resultados de afiliados que califican y por trabajos de contratista acordados.",
        "Los términos “agente” y “miembro” describen roles de la plataforma y no determinan la condición de empleo. Los salarios de empleados se gestionan mediante un proceso de nómina separado. Los requisitos legales de pago aplicables tienen prioridad sobre las disposiciones de esta política que entren en conflicto.",
      ],
    },
    {
      title: "Cómo se gana la compensación",
      blocks: [
        "Cada oferta o acuerdo de trabajo por escrito identifica:",
        {
          items: [
            "El trabajo o resultado que califica.",
            "El monto o el cálculo de la compensación.",
            "La documentación o evidencia requerida.",
            "Los requisitos de aprobación y validación.",
            "Cualquier condición de cancelación o reversión que aplique.",
            "Cualquier fecha específica de pago.",
          ],
        },
        "La compensación puede ser un monto fijo por prospecto calificado, solicitud, inscripción, venta o entregable aceptado. Una oferta también puede prever una compensación porcentual con un cálculo definido con claridad.",
        "Crear una cuenta, enviar un prospecto o completar una solicitud no califica automáticamente a un miembro para el pago. Deben cumplirse los requisitos indicados en la oferta aplicable.",
        "Titan registra la tarifa de compensación aplicable cuando se acepta el trabajo o se atribuye un referido que califica. Los cambios posteriores de tarifa se aplican hacia adelante y no modifican la compensación de trabajo ya aceptado.",
      ],
    },
  ],
};

export function payoutCopy(locale: Locale) {
  return locale === "es" ? payoutEs : payoutEn;
}
