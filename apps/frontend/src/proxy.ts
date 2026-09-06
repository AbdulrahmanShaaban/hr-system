import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/forgot-password", "/reset-password", "/api"];
const onboardingPrefix = "/onboarding";
const platformPrefix = "/platform";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without auth
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".svg") ||
    pathname.includes(".ico")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Platform admin routes: check via backend header
  // The backend will enforce the actual check — this is defense-in-depth
  if (pathname.startsWith(platformPrefix)) {
    // Add a header so backend knows to verify admin status
    const headers = new Headers(request.headers);
    headers.set("x-platform-route", "true");
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|logo.*\\.svg).*)"],
};
