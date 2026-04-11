import type { ReactNode } from "react";

import { notFound } from "next/navigation";

import { supportedLocales } from "@real-estate-ai/domain";
import { isSupportedLocale } from "@real-estate-ai/i18n";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return props.children;
}
