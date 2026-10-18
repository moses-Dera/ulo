import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/shared/security/cookies";

interface JwtPayload {
  sub: string;
  email: string;
  role: "student" | "landlord" | "admin";
  fullName?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

  let payload: JwtPayload | null = null;

  if (accessToken) {
    const candidate = decodeJwtPayload(accessToken);
    if (candidate && (!candidate.exp || Date.now() < candidate.exp * 1000)) {
      payload = candidate;
    }
  }

  // Fallback to refresh token if access token has expired (15-min rotation)
  if (!payload && refreshToken) {
    const candidate = decodeJwtPayload(refreshToken);
    if (candidate && (!candidate.exp || Date.now() < candidate.exp * 1000)) {
      payload = candidate;
    }
  }

  const isAuthenticated = !!payload;
  const userRole = payload?.role;

  // 1. Redirect already authenticated users away from Login / Register
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    if (isAuthenticated) {
      if (userRole === "landlord") {
        return NextResponse.redirect(new URL("/landlord/dashboard", req.url));
      }
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard/bookings", req.url));
    }
    return NextResponse.next();
  }

  // 2. AuthGuard & RoleGuard for Landlord Area (/landlord/*)
  if (pathname.startsWith("/landlord")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // RoleGuard: Students cannot access landlord dashboard
    if (userRole !== "landlord" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/bookings?denied=landlord_only", req.url));
    }

    return NextResponse.next();
  }

  // 3. AuthGuard & RoleGuard for Admin Console (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // RoleGuard: Only admins can access admin console
    if (userRole !== "admin") {
      const fallback = userRole === "landlord" ? "/landlord/dashboard" : "/dashboard/bookings";
      return NextResponse.redirect(new URL(`${fallback}?denied=admin_only`, req.url));
    }

    return NextResponse.next();
  }

  // 4. AuthGuard for Student Dashboard (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 5. AuthGuard for User Profile (/profile/*)
  if (pathname.startsWith("/profile")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/landlord/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
