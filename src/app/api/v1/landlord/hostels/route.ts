import { NextRequest } from "next/server";
import { propertiesController } from "@/modules/properties";

export async function POST(req: NextRequest) {
  return propertiesController.createHostel(req);
}
