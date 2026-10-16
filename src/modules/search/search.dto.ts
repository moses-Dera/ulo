export interface HostelSearchResultDto {
  id: string;
  title: string;
  zone: string;
  streetText: string;
  walkTimeBand: string;
  minRent: number;
  maxRent: number;
  roomTypeLabels: string[];
  primaryImage: string | null;
  primaryImageThumb: string | null;
  distanceToSelectedGateM?: number;
  amenities: string[];
  isVerifiedLandlord: boolean;
  totalAvailableUnits?: number;
}

export interface SearchResponseDto {
  results: HostelSearchResultDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
