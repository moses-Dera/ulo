import { NextRequest } from "next/server";
import { usersController } from "@/modules/users";

export async function GET(req: NextRequest) {
  return usersController.getProfile(req);
}

export async function DELETE(req: NextRequest) {
  return usersController.deleteAccount(req);
}
