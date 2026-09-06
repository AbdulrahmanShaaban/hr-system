import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory tokens are client-side only. The proxy simply passes all
// requests through; the client-side AuthGuard handles redirects.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|logo.*\\.svg).*)"],
};
