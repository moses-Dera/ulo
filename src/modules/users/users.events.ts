import { eventBus } from "@/shared/events";

export function emitUserProfileUpdated(userId: string) {
  return eventBus.emit({
    type: "USER_REGISTERED", // re-uses user event or custom profile event
    payload: { userId, email: "", role: "student", fullName: "" },
  });
}
