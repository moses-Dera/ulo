import { NextRequest, NextResponse } from "next/server";
import { notificationsService } from "./notifications.service";
import { requireAuth } from "../auth/auth.policy";
import { handleApiError } from "@/shared/errors";

export class NotificationsController {
  async getNotifications(req: NextRequest) {
    try {
      const user = requireAuth(req);
      const list = await notificationsService.getUserNotifications(user.sub);
      return NextResponse.json({ success: true, data: list });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async markAsRead(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      const { id } = await params;
      const result = await notificationsService.markAsRead(id, user.sub, user.role);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const notificationsController = new NotificationsController();
