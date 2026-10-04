import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui, type Ui } from "@/lib/i18n/ui";

export async function say(key: keyof Ui) {
  return ui(await getLocale())[key];
}

export { localizeError };
