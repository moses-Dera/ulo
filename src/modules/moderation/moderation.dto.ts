export interface PlatformMetricsDto {
  totalUsers: number;
  studentsCount: number;
  landlordsCount: number;
  verifiedLandlordsCount: number;
  publishedHostelsCount: number;
  pendingListingsCount: number;
  totalBookings: number;
  approvedBookings: number;
  approvalRatePercentage: number;
  hostelsByZone: Record<string, number>;
}

export interface PendingVerificationItemDto {
  landlordId: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  documents: Array<{
    id: string;
    docType: string;
    storageKey: string;
    createdAt: Date;
  }>;
}
