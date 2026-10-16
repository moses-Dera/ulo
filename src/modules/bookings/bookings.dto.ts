export interface BookingDto {
  id: string;
  studentId: string;
  roomTypeId: string;
  roomTypeLabel: string;
  hostelId: string;
  hostelTitle: string;
  hostelZone: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  rentAtRequest: string;
  studentNote: string | null;
  decisionNote: string | null;
  requestedAt: Date;
  decidedAt: Date | null;
  expiresAt: Date;
  // Unlocked Landlord details (revealed ONLY when status === 'APPROVED')
  landlordContact?: {
    name: string;
    phone: string;
    email: string;
    exactAddress: string;
    mapsUrl: string | null;
  };
}
