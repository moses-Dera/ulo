import { NextRequest } from "next/server";
import { authController } from "@/modules/auth";
import "@/modules/bootstrap";

export async function POST(req: NextRequest) {
  return authController.login(req);
}
