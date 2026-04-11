import type { Metadata } from "next";
import type { ReactNode } from "react";

import { notFound } from "next/navigation";

import { supportedLocales } from "@real-estate-ai/domain";
import { getMessages, isSupportedLocale } from "@real-estate-ai/i18n";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const messages = getMessages(locale);

  return {
    description: messages.app.shellNote,
    title: messages.app.name
  };
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
