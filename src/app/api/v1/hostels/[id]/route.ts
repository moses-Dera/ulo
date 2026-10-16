import { NextRequest } from "next/server";
import { propertiesController } from "@/modules/properties";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return propertiesController.getHostelDetail(req, context);
}
