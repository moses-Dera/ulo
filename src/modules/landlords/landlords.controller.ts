import { NextRequest, NextResponse } from "next/server";
import { landlordsService } from "./landlords.service";
import { verificationDocumentSchema } from "./landlords.schema";
import { requireAuth } from "../auth/auth.policy";
import { handleApiError } from "@/shared/errors";
import { z } from "zod";

const submitVerificationListSchema = z.object({
  documents: z.array(verificationDocumentSchema).min(1, "At least one document is required"),
});

export class LandlordsController {
  async submitVerification(req: NextRequest) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const body = await req.json();
      const validated = submitVerificationListSchema.parse(body);

      const result = await landlordsService.submitVerification(user.sub, validated.documents);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getVerification(req: NextRequest) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const result = await landlordsService.getVerification(user.sub);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getOccupancy(req: NextRequest) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const result = await landlordsService.getOccupancy(user.sub);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const landlordsController = new LandlordsController();
