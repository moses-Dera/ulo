export interface ProcessedImageDto {
  id: string;
  hostelId: string;
  storageKey: string;
  thumbKey: string;
  tag: "exterior" | "room" | "bathroom" | "kitchen_or_other";
  isPrimary: boolean;
  position: number;
  roomTypeId: string | null;
}
