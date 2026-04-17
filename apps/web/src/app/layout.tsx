import type { ReactNode } from "react";

import { headers } from "next/headers";

import type { SupportedLocale } from "@real-estate-ai/domain";
import { defaultLocale, getDirection, getMessages, isSupportedLocale } from "@real-estate-ai/i18n";
import { appBodyClassName } from "@real-estate-ai/ui";

import { AppChrome } from "@/components/app-chrome";
import { getCurrentOperatorRole } from "@/lib/operator-session";

import "./globals.css";

export default async function RootLayout(props: {
  children: ReactNode;
}) {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get("x-locale");
  const locale: SupportedLocale = headerLocale && isSupportedLocale(headerLocale) ? headerLocale : defaultLocale;
  const messages = getMessages(locale);
  const currentOperatorRole = await getCurrentOperatorRole();

  return (
    <html dir={getDirection(locale)} lang={locale}>
      <body className={appBodyClassName(locale)}>
        <AppChrome currentOperatorRole={currentOperatorRole} locale={locale} messages={messages}>
          {props.children}
        </AppChrome>
      </body>
    </html>
  );
}
