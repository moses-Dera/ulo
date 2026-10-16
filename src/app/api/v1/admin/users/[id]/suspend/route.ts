import { NextRequest } from "next/server";
import { moderationController } from "@/modules/moderation";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return moderationController.suspendUser(req, context);
}
