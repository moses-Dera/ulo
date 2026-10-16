import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextResponse } from "next/server";

export const ACCESS_COOKIE_NAME = "ulo_access_token";
export const REFRESH_COOKIE_NAME = "ulo_refresh_token";

const isProd = process.env.NODE_ENV === "production";

export const cookieOptions = {
  access: {
    name: ACCESS_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 15 * 60, // 15 mins
  },
  refresh: {
    name: REFRESH_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  res.cookies.set({
    ...cookieOptions.access,
    value: accessToken,
  });
  res.cookies.set({
    ...cookieOptions.refresh,
    value: refreshToken,
  });
  return res;
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set({
    ...cookieOptions.access,
    value: "",
    maxAge: 0,
  });
  res.cookies.set({
    ...cookieOptions.refresh,
    value: "",
    maxAge: 0,
  });
  return res;
}
