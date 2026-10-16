import { NextRequest, NextResponse } from "next/server";
import { authService } from "./auth.service";
import { studentRegisterSchema, landlordRegisterSchema, loginSchema } from "./auth.schema";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE_NAME } from "@/shared/security/cookies";
import { handleApiError, UnauthorizedError } from "@/shared/errors";
import { checkRateLimit } from "@/shared/security/rate-limiter";
import { getAuthUser } from "./auth.policy";

export class AuthController {
  async registerStudent(req: NextRequest) {
    try {
      const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
      const limit = checkRateLimit(`register_${ip}`, 10, 60 * 1000);
      if (!limit.success) {
        return NextResponse.json(
          { success: false, error: { code: "RATE_LIMITED", message: "Too many registration attempts. Please wait." } },
          { status: 429 }
        );
      }

      const body = await req.json();
      const validated = studentRegisterSchema.parse(body);
      const result = await authService.registerStudent(validated);

      const res = NextResponse.json({
        success: true,
        data: { user: result.user },
      });
      return setAuthCookies(res, result.accessToken, result.refreshToken);
    } catch (err) {
      return handleApiError(err);
    }
  }

  async registerLandlord(req: NextRequest) {
    try {
      const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
      const limit = checkRateLimit(`register_${ip}`, 10, 60 * 1000);
      if (!limit.success) {
        return NextResponse.json(
          { success: false, error: { code: "RATE_LIMITED", message: "Too many registration attempts. Please wait." } },
          { status: 429 }
        );
      }

      const body = await req.json();
      const validated = landlordRegisterSchema.parse(body);
      const result = await authService.registerLandlord(validated);

      const res = NextResponse.json({
        success: true,
        data: { user: result.user },
      });
      return setAuthCookies(res, result.accessToken, result.refreshToken);
    } catch (err) {
      return handleApiError(err);
    }
  }

  async login(req: NextRequest) {
    try {
      const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
      const limit = checkRateLimit(`login_${ip}`, 10, 60 * 1000);
      if (!limit.success) {
        return NextResponse.json(
          { success: false, error: { code: "RATE_LIMITED", message: "Too many login attempts. Please wait." } },
          { status: 429 }
        );
      }

      const body = await req.json();
      const validated = loginSchema.parse(body);
      const result = await authService.login(validated);

      const res = NextResponse.json({
        success: true,
        data: { user: result.user },
      });
      return setAuthCookies(res, result.accessToken, result.refreshToken);
    } catch (err) {
      return handleApiError(err);
    }
  }

  async logout(_req: NextRequest) {
    const res = NextResponse.json({
      success: true,
      data: { message: "Successfully logged out" },
    });
    return clearAuthCookies(res);
  }

  async refresh(req: NextRequest) {
    try {
      const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
      if (!refreshToken) {
        throw new UnauthorizedError("Refresh token missing");
      }

      const result = await authService.refresh(refreshToken);
      const res = NextResponse.json({
        success: true,
        data: { user: result.user },
      });
      return setAuthCookies(res, result.accessToken, result.refreshToken);
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getMe(req: NextRequest) {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        throw new UnauthorizedError("Not authenticated");
      }
      const data = await authService.getMe(authUser.sub);
      return NextResponse.json({ success: true, data });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const authController = new AuthController();
