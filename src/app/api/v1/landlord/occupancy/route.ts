import { NextRequest } from "next/server";
import { landlordsController } from "@/modules/landlords";

export async function GET(req: NextRequest) {
  return landlordsController.getOccupancy(req);
}
