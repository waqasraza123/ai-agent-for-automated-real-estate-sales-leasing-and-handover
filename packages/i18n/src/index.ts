import type { SupportedLocale } from "@real-estate-ai/domain";

import { arMessages } from "./messages/ar";
import { enMessages } from "./messages/en";
import type { AppMessages } from "./messages/types";
export type { AppMessages } from "./messages/types";

export const defaultLocale: SupportedLocale = "ar";
export const locales: SupportedLocale[] = ["ar", "en"];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return locales.includes(value as SupportedLocale);
}

export function getDirection(locale: SupportedLocale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getMessages(locale: SupportedLocale): AppMessages {
  return locale === "ar" ? arMessages : enMessages;
}

export function getTranslator(locale: SupportedLocale): AppMessages {
  return getMessages(locale);
}

export function getLocaleLabel(locale: SupportedLocale): string {
  return locale === "ar" ? "العربية" : "English";
}

export function toggleLocale(locale: SupportedLocale): SupportedLocale {
  return locale === "ar" ? "en" : "ar";
}

export function getIntlLocale(locale: SupportedLocale): string {
  return locale === "ar" ? "ar-SA-u-nu-latn" : "en-US";
}
