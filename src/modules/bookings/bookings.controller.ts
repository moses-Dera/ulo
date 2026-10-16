import { NextRequest, NextResponse } from "next/server";
import { bookingsService } from "./bookings.service";
import {
  requestBookingSchema,
  approveBookingSchema,
  rejectBookingSchema,
  deferBookingSchema,
  cancelBookingSchema,
} from "./bookings.schema";
import { requireAuth } from "../auth/auth.policy";
import { handleApiError, UnauthorizedError } from "@/shared/errors";
import { runBookingExpiryJob } from "./jobs";
import { config } from "@/shared/config";

export class BookingsController {
  async requestBooking(req: NextRequest) {
    try {
      const user = requireAuth(req, ["student", "admin"]);
      const body = await req.json();
      const validated = requestBookingSchema.parse(body);

      const booking = await bookingsService.requestBooking(user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: booking }, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getStudentBookings(req: NextRequest) {
    try {
      const user = requireAuth(req, ["student", "admin"]);
      const list = await bookingsService.getStudentBookings(user.sub);
      return NextResponse.json({ success: true, data: list });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async cancelBooking(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      const { id } = await params;
      const body = await req.json().catch(() => ({}));
      const validated = cancelBookingSchema.parse(body);

      const result = await bookingsService.cancelBooking(id, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getLandlordBookings(req: NextRequest) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const list = await bookingsService.getLandlordBookings(user.sub);
      return NextResponse.json({ success: true, data: list });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async approveBooking(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id } = await params;
      const body = await req.json().catch(() => ({}));
      const validated = approveBookingSchema.parse(body);

      const result = await bookingsService.approveBooking(id, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async rejectBooking(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id } = await params;
      const body = await req.json();
      const validated = rejectBookingSchema.parse(body);

      const result = await bookingsService.rejectBooking(id, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async deferBooking(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id } = await params;
      const body = await req.json();
      const validated = deferBookingSchema.parse(body);

      const result = await bookingsService.deferBooking(id, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async runExpiryCron(req: NextRequest) {
    try {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${config.cron.secret}`) {
        throw new UnauthorizedError("Invalid or missing cron secret authorization header");
      }
      const result = await runBookingExpiryJob();
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const bookingsController = new BookingsController();
