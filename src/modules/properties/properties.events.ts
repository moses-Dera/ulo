import { eventBus } from "@/shared/events";

export function emitHostelSubmitted(hostelId: string, landlordId: string) {
  return eventBus.emit({
    type: "HOSTEL_SUBMITTED",
    payload: { hostelId, landlordId },
  });
}
