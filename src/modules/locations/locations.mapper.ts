import { campusGates, zones } from "./db";
import { CampusGateDto, ZoneDto } from "./locations.dto";

type GateRow = typeof campusGates.$inferSelect;
type ZoneRow = typeof zones.$inferSelect;

export class LocationsMapper {
  static toGateDto(row: GateRow): CampusGateDto {
    return {
      id: row.id,
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
    };
  }

  static toZoneDto(row: ZoneRow): ZoneDto {
    return {
      id: row.id,
      name: row.name,
      refLat: row.refLat,
      refLng: row.refLng,
    };
  }
}
