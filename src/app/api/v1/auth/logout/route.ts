import { NextRequest } from "next/server";
import { authController } from "@/modules/auth";

export async function POST(req: NextRequest) {
  return authController.logout(req);
}
