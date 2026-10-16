import { moderationRepo } from "./moderation.repo";
import { ModerationMapper } from "./moderation.mapper";
import {
  CannotSuspendLastAdminError,
  ReasonRequiredError,
} from "./moderation.errors";
import {
  emitVerificationDecided,
  emitHostelModerated,
  emitListingReported,
} from "./moderation.events";
import { authRepo } from "../auth/auth.repo";
import { mailer } from "@/shared/mail/mailer";
import { NotFoundError } from "@/shared/errors";

export class ModerationService {
  async getPendingVerifications() {
    return moderationRepo.findPendingVerifications();
  }

  async approveVerification(landlordId: string, adminId: string) {
    const landlordUser = await authRepo.findById(landlordId);
    if (!landlordUser) {
      throw new NotFoundError("Landlord user not found");
    }

    const updated = await moderationRepo.setLandlordVerification(landlordId, "verified", undefined, adminId);
    await emitVerificationDecided(landlordId, "verified");

    mailer.sendMail({
      to: landlordUser.email,
      subject: "Verification Approved — Ụlọ Landlord Registry",
      html: `
        <p>Hello <strong>${landlordUser.fullName}</strong>,</p>
        <p>Your property ownership and identity documents have been verified by administration.</p>
        <p>You can now create and publish lodge listings across Behind Flat, Hilltop, Odim Gate, and Green House.</p>
      `,
    });

    return updated;
  }

  async rejectVerification(landlordId: string, adminId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new ReasonRequiredError("A mandatory reason must be provided when rejecting verification");
    }

    const landlordUser = await authRepo.findById(landlordId);
    if (!landlordUser) {
      throw new NotFoundError("Landlord user not found");
    }

    const updated = await moderationRepo.setLandlordVerification(landlordId, "rejected", reason, adminId);
    await emitVerificationDecided(landlordId, "rejected", reason);

    mailer.sendMail({
      to: landlordUser.email,
      subject: "Verification Update — Ụlọ Landlord Registry",
      html: `
        <p>Hello <strong>${landlordUser.fullName}</strong>,</p>
        <p>Your verification submission was not approved for the following reason:</p>
        <p><strong>${reason}</strong></p>
        <p>You may resubmit clear copies of your government ID, property deed, or caretaker letter of authority.</p>
      `,
    });

    return updated;
  }

  async getPendingListings() {
    return moderationRepo.findPendingListings();
  }

  async approveListing(hostelId: string, _adminId: string) {
    const updated = await moderationRepo.setHostelModeration(hostelId, "published");
    await emitHostelModerated(hostelId, "published");
    return updated;
  }

  async rejectListing(hostelId: string, _adminId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new ReasonRequiredError("A mandatory rejection reason is required");
    }

    const updated = await moderationRepo.setHostelModeration(hostelId, "rejected", reason);
    await emitHostelModerated(hostelId, "rejected", reason);
    return updated;
  }

  async suspendListing(hostelId: string, _adminId: string, reason: string) {
    return moderationRepo.setHostelModeration(hostelId, "suspended", reason);
  }

  async suspendUser(targetUserId: string, _adminId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new ReasonRequiredError();
    }

    const user = await authRepo.findById(targetUserId);
    if (!user) {
      throw new NotFoundError("Target user not found");
    }

    // FR-E19: The last active admin cannot be deleted or suspended
    if (user.role === "admin") {
      const activeAdmins = await moderationRepo.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new CannotSuspendLastAdminError();
      }
    }

    return moderationRepo.setUserStatus(targetUserId, "suspended");
  }

  async reactivateUser(targetUserId: string, _adminId: string) {
    const user = await authRepo.findById(targetUserId);
    if (!user) {
      throw new NotFoundError("Target user not found");
    }
    return moderationRepo.setUserStatus(targetUserId, "active");
  }

  async reportListing(hostelId: string, reporterUserId: string, reason: string, note?: string) {
    const result = await moderationRepo.submitReport(hostelId, reporterUserId, reason, note);
    await emitListingReported(hostelId, result.distinctReports);
    return result;
  }

  async getMetrics() {
    const metrics = await moderationRepo.getPlatformMetrics();
    return ModerationMapper.toMetricsDto(metrics);
  }
}

export const moderationService = new ModerationService();
