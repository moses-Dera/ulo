import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError } from "../errors";

export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: "student" | "landlord" | "admin";
  fullName: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired access token", "TOKEN_EXPIRED");
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired refresh token", "REFRESH_TOKEN_EXPIRED");
  }
}
