import { hostelImages } from "./db";
import { ProcessedImageDto } from "./media.dto";

type ImageRow = typeof hostelImages.$inferSelect;

export class MediaMapper {
  static toDto(img: ImageRow): ProcessedImageDto {
    return {
      id: img.id,
      hostelId: img.hostelId,
      storageKey: img.storageKey,
      thumbKey: img.thumbKey,
      tag: img.tag as "exterior" | "room" | "bathroom" | "kitchen_or_other",
      isPrimary: img.isPrimary,
      position: img.position,
      roomTypeId: img.roomTypeId,
    };
  }
}
