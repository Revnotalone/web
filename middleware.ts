import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, adminToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const open = pathname === "/admin/login" || pathname === "/api/admin/login";
  if (open) return NextResponse.next();
  const ok = process.env.ADMIN_PASSWORD && req.cookies.get(COOKIE)?.value === (await adminToken());
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
