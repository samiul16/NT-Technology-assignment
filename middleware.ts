import { NextResponse } from "next/server";
// Fix: Import from 'next/server' instead of 'next/request'
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userSession = request.cookies.get("user-auth");
  const { pathname } = request.nextUrl;

  // 1. If user is logged in and tries to access /login, redirect to /board
  if (userSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/board", request.url));
  }

  // 2. If user is NOT logged in and tries to access /board (or any dashboard subpage)
  // We allow access to /login to prevent infinite loops
  if (!userSession && pathname.startsWith("/board")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Optional: Redirect root "/" to "/board" if logged in, or "/login" if not
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(userSession ? "/board" : "/login", request.url)
    );
  }

  return NextResponse.next();
}

// Ensure the middleware doesn't run on static assets or icons
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
