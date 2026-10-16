import { NextRequest } from "next/server";
import { verifyAccessToken, TokenPayload } from "@/shared/security/jwt";
import { ACCESS_COOKIE_NAME } from "@/shared/security/cookies";
import { UnauthorizedError, ForbiddenError } from "@/shared/errors";

export function getAuthUser(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    // Check Authorization header fallback
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const headerToken = authHeader.substring(7);
      return verifyAccessToken(headerToken);
    }
    return null;
  }
  return verifyAccessToken(token);
}

export function requireAuth(req: NextRequest, allowedRoles?: Array<"student" | "landlord" | "admin">): TokenPayload {
  const user = getAuthUser(req);
  if (!user) {
    throw new UnauthorizedError("Authentication required to access this resource");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Role '${user.role}' is not authorized for this action`);
  }

  return user;
}
