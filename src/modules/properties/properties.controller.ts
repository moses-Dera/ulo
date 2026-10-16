import { NextRequest, NextResponse } from "next/server";
import { propertiesService } from "./properties.service";
import {
  createHostelSchema,
  updateHostelSchema,
  createRoomTypeSchema,
  updateRoomTypeSchema,
} from "./properties.schema";
import { requireAuth, getAuthUser } from "../auth/auth.policy";
import { handleApiError } from "@/shared/errors";

export class PropertiesController {
  async createHostel(req: NextRequest) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const body = await req.json();
      const validated = createHostelSchema.parse(body);

      const hostel = await propertiesService.createHostel(user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: hostel }, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async updateHostel(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id } = await params;
      const body = await req.json();
      const validated = updateHostelSchema.parse(body);

      const updated = await propertiesService.updateHostel(id, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: updated });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async submitForReview(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id } = await params;

      const result = await propertiesService.submitForReview(id, user.sub, user.role);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async addRoomType(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id: hostelId } = await params;
      const body = await req.json();
      const validated = createRoomTypeSchema.parse(body);

      const room = await propertiesService.addRoomType(hostelId, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: room }, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async updateRoomType(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id: roomTypeId } = await params;
      const body = await req.json();
      const validated = updateRoomTypeSchema.parse(body);

      const room = await propertiesService.updateRoomType(roomTypeId, user.sub, user.role, validated);
      return NextResponse.json({ success: true, data: room });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async deleteRoomType(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req, ["landlord", "admin"]);
      const { id: roomTypeId } = await params;

      const result = await propertiesService.deleteRoomType(roomTypeId, user.sub, user.role);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getHostelDetail(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = getAuthUser(req);
      const { id } = await params;

      const hostel = await propertiesService.getHostelDetail(id, user?.sub, user?.role);
      return NextResponse.json({ success: true, data: hostel });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const propertiesController = new PropertiesController();
