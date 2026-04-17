import type { SupportedLocale } from "@real-estate-ai/domain";
import { defaultLocale, isSupportedLocale } from "@real-estate-ai/i18n";

export const localeCookieName = "rea_locale";

export function getLocaleFromValue(value: string | null | undefined, fallback: SupportedLocale = defaultLocale): SupportedLocale {
  if (value && isSupportedLocale(value)) {
    return value;
  }

  return fallback;
}

export function extractLocaleFromPathname(pathname: string | null): SupportedLocale | null {
  const firstSegment = pathname?.split("/").filter(Boolean)[0];

  return firstSegment && isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function getLocaleFromPathname(pathname: string | null, fallback: SupportedLocale = defaultLocale): SupportedLocale {
  return extractLocaleFromPathname(pathname) ?? fallback;
}

export function getPreferredLocale(cookieLocale: string | null | undefined): SupportedLocale {
  return getLocaleFromValue(cookieLocale, defaultLocale);
}

export function replacePathLocale(pathname: string | null | undefined, locale: SupportedLocale): string {
  const normalizedPathname = pathname && pathname.length > 0 ? pathname : "/";
  const segments = normalizedPathname.split("/").filter(Boolean);
  const leadingSegment = segments[0];

  if (segments.length === 0) {
    return `/${locale}`;
  }

  if (leadingSegment && isSupportedLocale(leadingSegment)) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return `/${locale}/${segments.join("/")}`;
}

export function withLocalePrefix(pathname: string | null | undefined, locale: SupportedLocale): string {
  return replacePathLocale(pathname, locale);
}
