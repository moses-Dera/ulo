import { NextRequest } from "next/server";
import { locationsController } from "@/modules/locations";

export async function GET(req: NextRequest) {
  return locationsController.getGates(req);
}
