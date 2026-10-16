import { HostelDetailDto, RoomTypeDto } from "./properties.dto";
import { hostels, roomTypes, hostelImages } from "./db";

type HostelRow = typeof hostels.$inferSelect;
type RoomTypeRow = typeof roomTypes.$inferSelect;
type ImageRow = typeof hostelImages.$inferSelect;

export class PropertiesMapper {
  static toDetailDto(
    data: {
      hostel: HostelRow;
      rooms: RoomTypeRow[];
      images: ImageRow[];
      amenities: Array<{ id: string; name: string }>;
      gateDistances: Array<{ gateId: string; gateName: string; distanceM: number }>;
      nearestGateName?: string;
    },
    revealPrivateDetails: boolean = false
  ): HostelDetailDto {
    return {
      id: data.hostel.id,
      landlordId: data.hostel.landlordId,
      title: data.hostel.title,
      description: data.hostel.description,
      rules: data.hostel.rules,
      zone: data.hostel.zone,
      streetText: data.hostel.streetText,
      // Private fields stripped for general public
      exactAddress: revealPrivateDetails ? data.hostel.exactAddress : undefined,
      mapsUrl: revealPrivateDetails ? data.hostel.mapsUrl : undefined,
      nearestGateId: data.hostel.nearestGateId,
      nearestGateName: data.nearestGateName,
      walkTimeBand: data.hostel.walkTimeBand,
      latitude: data.hostel.latitude,
      longitude: data.hostel.longitude,
      locationVerified: data.hostel.locationVerified,
      status: data.hostel.status,
      reviewReason: data.hostel.reviewReason,
      roomTypes: data.rooms.map((r) => this.toRoomDto(r)),
      amenities: data.amenities,
      images: data.images.map((img) => ({
        id: img.id,
        storageKey: img.storageKey,
        thumbKey: img.thumbKey,
        tag: img.tag,
        isPrimary: img.isPrimary,
        position: img.position,
        roomTypeId: img.roomTypeId,
      })),
      gateDistances: data.gateDistances,
    };
  }

  static toRoomDto(r: RoomTypeRow): RoomTypeDto {
    return {
      id: r.id,
      hostelId: r.hostelId,
      label: r.label,
      annualRent: r.annualRent,
      totalUnits: r.totalUnits,
      isHidden: r.isHidden,
      description: r.description,
    };
  }
}
