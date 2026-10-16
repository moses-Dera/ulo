import { eventBus } from "@/shared/events";

export interface UserRegisteredEventPayload {
  userId: string;
  email: string;
  role: "student" | "landlord" | "admin";
  fullName: string;
}

export function emitUserRegistered(payload: UserRegisteredEventPayload) {
  return eventBus.emit({
    type: "USER_REGISTERED",
    payload,
  });
}
