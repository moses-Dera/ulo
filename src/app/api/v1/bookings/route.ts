import { NextRequest } from "next/server";
import { bookingsController } from "@/modules/bookings";

export async function POST(req: NextRequest) {
  return bookingsController.requestBooking(req);
}

export async function GET(req: NextRequest) {
  return bookingsController.getStudentBookings(req);
}
