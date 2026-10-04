import {
  offerings,
  site,
  standards,
  steps,
  tools,
} from "@/lib/site";
import {
  esOfferings,
  esSite,
  esStandards,
  esSteps,
  esTools,
} from "@/lib/i18n/es-content";
import type { Locale } from "@/lib/i18n/locale";

export function catalog(locale: Locale) {
  if (locale === "es") {
    return {
      site: esSite,
      offerings: esOfferings,
      steps: esSteps,
      standards: esStandards,
      tools: esTools,
    };
  }
  return { site, offerings, steps, standards, tools };
}

export function contactChoices(locale: Locale) {
  const local = catalog(locale).offerings;
  const choices: { value: string; label: string }[] = offerings.map((item, index) => ({
    value: item.title,
    label: local[index]?.title ?? item.title,
  }));
  choices.push({
    value: "Affiliate program",
    label: locale === "es" ? "Programa de afiliados" : "Affiliate program",
  });
  choices.push({
    value: "General",
    label: "General",
  });
  return choices;
}

const programLabels: Record<string, string> = {
  "safety-products": "Productos de seguridad",
  "energy-solutions": "Soluciones de energía",
  "digital-media": "Medios digitales",
  "software-development": "Desarrollo de software",
  insurance: "Seguros",
};

export function programLabel(
  locale: Locale,
  program: { id: string; name: string },
) {
  if (locale === "es" && programLabels[program.id]) return programLabels[program.id];
  return program.name;
}
