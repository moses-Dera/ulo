import { NextRequest } from "next/server";
import { moderationController } from "@/modules/moderation";

export async function POST(req: NextRequest) {
  return moderationController.reportListing(req);
}
