import type { SupportedLocale } from "@real-estate-ai/contracts";
import { getIntlLocale } from "@real-estate-ai/i18n";

export function formatDateTime(value: string | Date, locale: SupportedLocale, options?: Intl.DateTimeFormatOptions) {
  return toDate(value).toLocaleString(getIntlLocale(locale), options);
}

export function formatDate(value: string | Date, locale: SupportedLocale, options?: Intl.DateTimeFormatOptions) {
  return toDate(value).toLocaleDateString(getIntlLocale(locale), options);
}

export function formatShortDate(value: string | Date, locale: SupportedLocale) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "short"
  }).format(toDate(value));
}

export function formatNumber(value: number, locale: SupportedLocale, options?: Intl.NumberFormatOptions) {
  return value.toLocaleString(getIntlLocale(locale), options);
}

export function formatCurrency(value: number, locale: SupportedLocale, currency: string) {
  return value.toLocaleString(getIntlLocale(locale), {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: "currency"
  });
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}
