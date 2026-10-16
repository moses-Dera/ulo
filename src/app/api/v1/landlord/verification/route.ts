import { NextRequest } from "next/server";
import { landlordsController } from "@/modules/landlords";

export async function POST(req: NextRequest) {
  return landlordsController.submitVerification(req);
}

export async function GET(req: NextRequest) {
  return landlordsController.getVerification(req);
}
