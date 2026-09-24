import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, expectedToken } from "./lib/admin-auth";
import { PARTNER_COOKIE, verifyPartnerToken } from "./lib/partner-token";
import { USER_COOKIE, verifyUserToken } from "./lib/user-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const host = (req.headers.get("host") ?? "").replace(/:\d+$/, "").toLowerCase();
  const sub = host.match(/^([a-z0-9-]+)\.14eter\.org$/);
  if (sub && sub[1] !== "www") {
    const slug = sub[1];
    if (pathname.startsWith("/app")) return NextResponse.next();
    return NextResponse.rewrite(new URL(`/app/${slug}${pathname}`, req.url));
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const valid = token === (await expectedToken());

    if (pathname === "/admin/login") {
      if (valid) return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.next();
    }
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/user-dashboard")) {
    const session = await verifyUserToken(req.cookies.get(USER_COOKIE)?.value);
    if (!session) {
      return NextResponse.redirect(new URL("/user/login", req.url));
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const partner = await verifyPartnerToken(req.cookies.get(PARTNER_COOKIE)?.value);
  if (!partner) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|\\.well-known).*)",
  ],
};