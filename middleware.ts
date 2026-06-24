import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/tools/plantillasjm"];
const COOKIE_NAME = "psiqui_session";
const COOKIE_VALUE = process.env.SESSION_SECRET ?? "psiqui-ok";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(COOKIE_NAME);
  if (session?.value === COOKIE_VALUE) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/tools/plantillasjm/:path*"],
};
