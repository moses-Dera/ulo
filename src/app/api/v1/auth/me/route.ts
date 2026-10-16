import { NextRequest } from "next/server";
import { authController } from "@/modules/auth";

export async function GET(req: NextRequest) {
  return authController.getMe(req);
}
