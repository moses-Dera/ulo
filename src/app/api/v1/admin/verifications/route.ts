import { NextRequest } from "next/server";
import { moderationController } from "@/modules/moderation";

export async function GET(req: NextRequest) {
  return moderationController.getPendingVerifications(req);
}
