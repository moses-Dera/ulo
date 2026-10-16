import { NextRequest, NextResponse } from "next/server";
import { moderationService } from "./moderation.service";
import {
  verificationDecisionSchema,
  listingDecisionSchema,
  suspendUserSchema,
  reportListingSchema,
} from "./moderation.schema";
import { requireAuth } from "../auth/auth.policy";
import { ModerationPolicy } from "./moderation.policy";
import { handleApiError } from "@/shared/errors";

export class ModerationController {
  async getPendingVerifications(req: NextRequest) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);

      const list = await moderationService.getPendingVerifications();
      return NextResponse.json({ success: true, data: list });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async approveVerification(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);
      const { id: landlordId } = await params;

      const result = await moderationService.approveVerification(landlordId, user.sub);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async rejectVerification(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);
      const { id: landlordId } = await params;
      const body = await req.json();
      const validated = verificationDecisionSchema.parse(body);

      const result = await moderationService.rejectVerification(landlordId, user.sub, validated.reason || "");
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getPendingListings(req: NextRequest) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);

      const list = await moderationService.getPendingListings();
      return NextResponse.json({ success: true, data: list });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async approveListing(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);
      const { id: hostelId } = await params;

      const result = await moderationService.approveListing(hostelId, user.sub);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async rejectListing(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);
      const { id: hostelId } = await params;
      const body = await req.json();
      const validated = listingDecisionSchema.parse(body);

      const result = await moderationService.rejectListing(hostelId, user.sub, validated.reason || "");
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async suspendListing(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);
      const { id: hostelId } = await params;
      const body = await req.json();
      const validated = listingDecisionSchema.parse(body);

      const result = await moderationService.suspendListing(hostelId, user.sub, validated.reason || "");
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async suspendUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);
      const { id: targetUserId } = await params;
      const body = await req.json();
      const validated = suspendUserSchema.parse(body);

      const result = await moderationService.suspendUser(targetUserId, user.sub, validated.reason);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async reactivateUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);
      const { id: targetUserId } = await params;

      const result = await moderationService.reactivateUser(targetUserId, user.sub);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async reportListing(req: NextRequest) {
    try {
      const user = requireAuth(req);
      const body = await req.json();
      const validated = reportListingSchema.parse(body);

      const result = await moderationService.reportListing(
        validated.hostelId,
        user.sub,
        validated.reason,
        validated.note
      );
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getMetrics(req: NextRequest) {
    try {
      const user = requireAuth(req);
      ModerationPolicy.assertAdmin(user.role);

      const metrics = await moderationService.getMetrics();
      return NextResponse.json({ success: true, data: metrics });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const moderationController = new ModerationController();
