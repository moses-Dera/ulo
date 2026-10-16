import { NextRequest } from "next/server";
import { mediaController } from "@/modules/media";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return mediaController.uploadHostelImage(req, context);
}
