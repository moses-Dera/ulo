import { NextRequest } from "next/server";
import { propertiesController } from "@/modules/properties";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return propertiesController.updateRoomType(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return propertiesController.deleteRoomType(req, context);
}
