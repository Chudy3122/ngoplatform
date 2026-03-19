import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

const locales = ["pl", "en"];
const defaultLocale = "pl";
const publicPaths = ["/login", "/sign-up"];

function getLocale(pathname: string): string {
  const segment = pathname.split("/")[1];
  return locales.includes(segment) ? segment : defaultLocale;
}

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname.includes(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pomiń API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Dodaj domyślny locale jeśli brakuje
  const locale = pathname.split("/")[1];
  if (!locales.includes(locale)) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }

  const token = request.cookies.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  const isPublic = isPublicPath(pathname);

  // Zalogowany próbuje wejść na login/sign-up → redirect na dashboard
  if (session && isPublic) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Zalogowany na stronie głównej → redirect na dashboard
  if (
    session &&
    (pathname === `/${locale}` || pathname === `/${locale}/`)
  ) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Niezalogowany próbuje wejść na chronioną stronę → redirect na login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*) "],
};
