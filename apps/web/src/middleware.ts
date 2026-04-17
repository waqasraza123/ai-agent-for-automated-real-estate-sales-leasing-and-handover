import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, isSupportedLocale } from "@real-estate-ai/i18n";

import { extractLocaleFromPathname, getPreferredLocale, localeCookieName, withLocalePrefix } from "@/lib/locale";

export function middleware(request: NextRequest) {
  const pathnameLocale = extractLocaleFromPathname(request.nextUrl.pathname);

  if (!pathnameLocale) {
    const locale = getPreferredLocale(request.cookies.get(localeCookieName)?.value ?? defaultLocale);
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = withLocalePrefix(request.nextUrl.pathname, locale);
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", pathnameLocale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  if (!isSupportedLocale(request.cookies.get(localeCookieName)?.value ?? "")) {
    response.cookies.set(localeCookieName, pathnameLocale, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return response;
  }

  if (request.cookies.get(localeCookieName)?.value !== pathnameLocale) {
    response.cookies.set(localeCookieName, pathnameLocale, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"]
};
