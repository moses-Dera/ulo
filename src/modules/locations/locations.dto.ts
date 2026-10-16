export interface CampusGateDto {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
}

export interface ZoneDto {
  id: string;
  name: string;
  refLat: string | null;
  refLng: string | null;
}
