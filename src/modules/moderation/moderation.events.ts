import { eventBus } from "@/shared/events";

export function emitVerificationDecided(landlordId: string, status: "verified" | "rejected", reason?: string) {
  return eventBus.emit({
    type: "VERIFICATION_DECIDED",
    payload: { landlordId, status, reason },
  });
}

export function emitHostelModerated(hostelId: string, status: "published" | "rejected", reason?: string) {
  return eventBus.emit({
    type: "HOSTEL_MODERATED",
    payload: { hostelId, status, reason },
  });
}

export function emitListingReported(hostelId: string, reportCount: number) {
  return eventBus.emit({
    type: "LISTING_REPORTED",
    payload: { hostelId, reportCount },
  });
}
