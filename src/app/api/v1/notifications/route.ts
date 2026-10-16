import { NextRequest } from "next/server";
import { notificationsController } from "@/modules/notifications";

export async function GET(req: NextRequest) {
  return notificationsController.getNotifications(req);
}
