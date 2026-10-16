export interface VerificationDocumentDto {
  id: string;
  docType: "nin" | "drivers_license" | "deed" | "authority_letter";
  storageKey: string;
  createdAt: Date;
}

export interface LandlordVerificationDto {
  status: "unsubmitted" | "pending" | "verified" | "rejected";
  reason: string | null;
  verifiedAt: Date | null;
  documents: VerificationDocumentDto[];
}

export interface OccupancyStatsDto {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  pendingRequests: number;
}
