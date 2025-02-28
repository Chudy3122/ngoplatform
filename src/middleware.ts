// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["pl", "en"];
const defaultLocale = "pl";
const publicPaths = ['/login', '/sign-up']; // Ścieżki dostępne bez logowania

function getLocale(pathname: string): string {
  const locale = pathname.split('/')[1];
  return locales.includes(locale) ? locale : defaultLocale;
}

// Funkcja pomocnicza do sprawdzania czy ścieżka jest publiczna
function isPublicPath(path: string): boolean {
  return publicPaths.some(publicPath => path.includes(publicPath));
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = new URL(request.url);
  const locale = getLocale(pathname);

  // Sprawdź czy to ścieżka API
  if (pathname.includes('/api/')) {
    return NextResponse.next();
  }

  // Jeśli brakuje locale, przekieruj
  if (!locales.includes(locale)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  // Pobierz sesję
  const session = await auth();

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania lub rejestracji
  if (session?.userId && isPublicPath(pathname)) {
    const userRole = (session.sessionClaims?.metadata as { role?: string })?.role || 'student';
    return NextResponse.redirect(new URL(`/${locale}/${userRole}`, request.url));
  }

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
  if (!session?.userId && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};