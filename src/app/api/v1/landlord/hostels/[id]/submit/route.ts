import { NextRequest } from "next/server";
import { propertiesController } from "@/modules/properties";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return propertiesController.submitForReview(req, context);
}
