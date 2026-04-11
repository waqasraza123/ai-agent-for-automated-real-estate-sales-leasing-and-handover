import type { SupportedLocale } from "@real-estate-ai/domain";
import { isSupportedLocale } from "@real-estate-ai/i18n";

export function getLocaleFromValue(value: string | null | undefined): SupportedLocale {
  if (value && isSupportedLocale(value)) {
    return value;
  }

  return "en";
}

export function getLocaleFromPathname(pathname: string | null): SupportedLocale {
  const firstSegment = pathname?.split("/").filter(Boolean)[0];

  return getLocaleFromValue(firstSegment);
}
