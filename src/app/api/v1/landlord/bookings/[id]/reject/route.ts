import { NextRequest } from "next/server";
import { bookingsController } from "@/modules/bookings";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return bookingsController.rejectBooking(req, context);
}
