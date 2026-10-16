import { logger } from "../logger";

export type DomainEvent =
  | { type: "USER_REGISTERED"; payload: { userId: string; email: string; role: string; fullName: string } }
  | { type: "VERIFICATION_SUBMITTED"; payload: { landlordId: string } }
  | { type: "VERIFICATION_DECIDED"; payload: { landlordId: string; status: "verified" | "rejected"; reason?: string } }
  | { type: "HOSTEL_SUBMITTED"; payload: { hostelId: string; landlordId: string } }
  | { type: "HOSTEL_MODERATED"; payload: { hostelId: string; status: "published" | "rejected"; reason?: string } }
  | { type: "BOOKING_REQUESTED"; payload: { bookingId: string; studentId: string; hostelId: string; roomTypeId: string } }
  | { type: "BOOKING_APPROVED"; payload: { bookingId: string; studentId: string; roomTypeId: string; landlordId: string } }
  | { type: "BOOKING_REJECTED"; payload: { bookingId: string; studentId: string; reason?: string } }
  | { type: "BOOKING_CANCELLED"; payload: { bookingId: string; studentId: string; roomTypeId: string } }
  | { type: "BOOKING_EXPIRED"; payload: { bookingId: string; studentId: string } }
  | { type: "LISTING_REPORTED"; payload: { hostelId: string; reportCount: number } };

type EventHandler<T extends DomainEvent["type"]> = (
  event: Extract<DomainEvent, { type: T }>
) => Promise<void> | void;

class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  subscribe<T extends DomainEvent["type"]>(type: T, handler: EventHandler<T>): () => void {
    const list = this.handlers.get(type) || [];
    list.push(handler);
    this.handlers.set(type, list);

    return () => {
      const current = this.handlers.get(type) || [];
      this.handlers.set(
        type,
        current.filter((h) => h !== handler)
      );
    };
  }

  async emit(event: DomainEvent): Promise<void> {
    logger.info(`[EventBus] Emitting event: ${event.type}`, "EventBus", { eventType: event.type });
    const list = this.handlers.get(event.type) || [];
    for (const handler of list) {
      try {
        await handler(event);
      } catch (err) {
        logger.error(`[EventBus] Error in handler for ${event.type}: ${(err as Error).message}`, "EventBus", {
          eventType: event.type,
          error: (err as Error).stack,
        });
      }
    }
  }
}

export const eventBus = new EventBus();
