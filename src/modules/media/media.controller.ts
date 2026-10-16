import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "./media.service";
import { tagImageSchema } from "./media.schema";
import { requireAuth } from "../auth/auth.policy";
import { handleApiError, BadRequestError } from "@/shared/errors";

export class MediaController {
  async uploadHostelImage(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id: hostelId } = await params;
      const clientIp = req.headers.get("x-forwarded-for") || "unknown";

      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        throw new BadRequestError("File is required in multipart form data");
      }

      const tag = (formData.get("tag") as string) || "exterior";
      const isPrimary = formData.get("isPrimary") === "true";
      const position = formData.get("position") ? parseInt(formData.get("position") as string, 10) : 0;
      const roomTypeId = (formData.get("roomTypeId") as string) || undefined;

      const validatedMeta = tagImageSchema.parse({
        tag,
        isPrimary,
        position,
        roomTypeId,
      });

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await mediaService.processAndSaveHostelImage(
        hostelId,
        user.sub,
        user.role,
        buffer,
        validatedMeta,
        clientIp
      );

      return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const mediaController = new MediaController();
