export interface RoomTypeDto {
  id: string;
  hostelId: string;
  label: string;
  annualRent: string;
  totalUnits: number;
  availableUnits?: number;
  isHidden: boolean;
  description: string | null;
}

export interface HostelDetailDto {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  rules: string | null;
  zone: string;
  streetText: string;
  exactAddress?: string; // Revealed only when authorized
  nearestGateId: string | null;
  nearestGateName?: string;
  walkTimeBand: string;
  latitude: string | null;
  longitude: string | null;
  mapsUrl?: string | null; // Revealed only when authorized
  videoUrl?: string | null; // Video walkthrough (Supabase MP4 or YouTube)
  locationVerified: boolean;
  status: string;
  reviewReason: string | null;
  roomTypes: RoomTypeDto[];
  amenities: Array<{ id: string; name: string }>;
  images: Array<{
    id: string;
    storageKey: string;
    thumbKey: string;
    tag: string;
    isPrimary: boolean;
    position: number;
    roomTypeId: string | null;
  }>;
  gateDistances: Array<{ gateId: string; gateName: string; distanceM: number }>;
}
