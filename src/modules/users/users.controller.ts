import { NextRequest, NextResponse } from "next/server";
import { usersService } from "./users.service";
import { updateStudentProfileSchema, updateLandlordProfileSchema } from "./users.schema";
import { requireAuth } from "../auth/auth.policy";
import { handleApiError } from "@/shared/errors";
import { clearAuthCookies } from "@/shared/security/cookies";

export class UsersController {
  async getProfile(req: NextRequest) {
    try {
      const user = requireAuth(req);
      const profile = await usersService.getProfile(user.sub);
      return NextResponse.json({ success: true, data: profile });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async updateStudentProfile(req: NextRequest) {
    try {
      const user = requireAuth(req, ["student", "admin"]);
      const body = await req.json();
      const validated = updateStudentProfileSchema.parse(body);

      const profile = await usersService.updateStudentProfile(user.sub, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: profile });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async updateLandlordProfile(req: NextRequest) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const body = await req.json();
      const validated = updateLandlordProfileSchema.parse(body);

      const profile = await usersService.updateLandlordProfile(user.sub, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: profile });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async deleteAccount(req: NextRequest) {
    try {
      const user = requireAuth(req);
      const result = await usersService.anonymizeAccount(user.sub, user.sub, user.role);

      const res = NextResponse.json({ success: true, data: result });
      return clearAuthCookies(res);
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const usersController = new UsersController();
