import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { defaultLocale } from "@real-estate-ai/i18n";

import { getPreferredLocale, localeCookieName } from "@/lib/locale";

export default async function RootPage() {
  const cookieStore = await cookies();
  const locale = getPreferredLocale(cookieStore.get(localeCookieName)?.value ?? defaultLocale);

  redirect(`/${locale}`);
}
