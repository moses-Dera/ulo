import { NextRequest } from "next/server";
import { propertiesController } from "@/modules/properties";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return propertiesController.updateHostel(req, context);
}
