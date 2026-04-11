"use client";

import { usePathname } from "next/navigation";

import { RouteErrorShell } from "@/components/route-error-shell";
import { getLocaleFromPathname } from "@/lib/locale";

export default function LocaleError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  return <RouteErrorShell locale={locale} reset={props.reset} />;
}
