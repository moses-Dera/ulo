import { eventBus } from "@/shared/events";

export function emitVerificationSubmitted(landlordId: string) {
  return eventBus.emit({
    type: "VERIFICATION_SUBMITTED",
    payload: { landlordId },
  });
}
