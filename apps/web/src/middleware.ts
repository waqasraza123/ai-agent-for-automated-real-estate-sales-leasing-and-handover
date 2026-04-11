import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isSupportedLocale } from "@real-estate-ai/i18n";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const localeSegment = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  const locale = localeSegment && isSupportedLocale(localeSegment) ? localeSegment : "en";

  requestHeaders.set("x-locale", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"]
};
