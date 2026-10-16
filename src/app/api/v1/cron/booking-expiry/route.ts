import { NextRequest } from "next/server";
import { bookingsController } from "@/modules/bookings";

export async function POST(req: NextRequest) {
  return bookingsController.runExpiryCron(req);
}
