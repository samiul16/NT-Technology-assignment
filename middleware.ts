import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth-token";

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret || secret.length < 32) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    return (
      typeof payload.sub === "string" &&
      typeof payload.name === "string" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string"
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await isAuthenticated(request);

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isAuthPage = isLoginPage || isSignupPage;
  const isDashboardPage =
    pathname === "/board" || pathname.startsWith("/board/");

  // Authenticated users should not revisit login or signup.
  if (authenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/board", request.url));
  }

  // Protect the board and its nested pages.
  if (!authenticated && isDashboardPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect the root page based on authentication.
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(authenticated ? "/board" : "/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
