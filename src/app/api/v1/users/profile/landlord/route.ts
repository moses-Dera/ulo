import { NextRequest } from "next/server";
import { usersController } from "@/modules/users";

export async function PATCH(req: NextRequest) {
  return usersController.updateLandlordProfile(req);
}
