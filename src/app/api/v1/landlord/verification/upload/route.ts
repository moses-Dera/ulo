import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/modules/auth/auth.policy";
import { handleApiError, BadRequestError } from "@/shared/errors";
import { storageService } from "@/shared/storage";
import crypto from "crypto";

const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB

function validateDocumentFile(buffer: Buffer): string {
  if (buffer.length < 4) {
    throw new BadRequestError("Invalid document file buffer");
  }

  // PDF: %PDF (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "pdf";
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }

  throw new BadRequestError("Unsupported document format. Please upload a PDF, JPG, or PNG.");
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ["landlord", "admin"]);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = (formData.get("docType") as string) || "deed";

    if (!file) {
      throw new BadRequestError("No document file was provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_DOC_SIZE) {
      throw new BadRequestError("Document file exceeds maximum allowed size (10 MB)");
    }

    const ext = validateDocumentFile(buffer);
    const safeDocType = docType.replace(/[^a-z_]/g, "");
    const fileId = crypto.randomUUID().slice(0, 12);
    const filename = `${user.sub.slice(0, 8)}_${safeDocType}_${Date.now()}_${fileId}.${ext}`;

    const uploadResult = await storageService.upload({
      bucket: "private",
      folder: "verifications",
      filename,
      buffer,
      contentType: file.type || (ext === "pdf" ? "application/pdf" : `image/${ext}`),
    });

    return NextResponse.json({
      success: true,
      data: {
        storageKey: uploadResult.storageKey,
        originalName: file.name,
        docType: safeDocType,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
