import { NextRequest } from "next/server";
import { bookingsController } from "@/modules/bookings";

export async function GET(req: NextRequest) {
  return bookingsController.getLandlordBookings(req);
}
