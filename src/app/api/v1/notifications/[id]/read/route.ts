import { NextRequest } from "next/server";
import { notificationsController } from "@/modules/notifications";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return notificationsController.markAsRead(req, context);
}
