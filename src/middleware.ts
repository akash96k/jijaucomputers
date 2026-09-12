import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verify cryptographic Admin Session Token
  const adminSession = await getAdminSession(request);
  const isAuthenticated = adminSession !== null;

  // 1. Protect Admin Backend APIs (Block unauthorized API access with 401 JSON)
  const publicAdminApis = ["/api/admin/login", "/api/admin/restore-full", "/api/admin/sync-db", "/api/admin/seed-brands"];
  if (pathname.startsWith("/api/admin") && !publicAdminApis.includes(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized: Valid administrator session required to access this endpoint." },
        { status: 401 }
      );
    }
  }

  // 2. Protect Admin Frontend Pages (Redirect to Login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
