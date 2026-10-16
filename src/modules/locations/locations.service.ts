import { locationsRepo } from "./locations.repo";
import { LocationsMapper } from "./locations.mapper";
import { LocationOutOfBoundsError } from "./locations.errors";

// Nsukka Geographic Bounding Box (TC-024)
const NSUKKA_BOUNDS = {
  minLat: 6.75,
  maxLat: 7.0,
  minLng: 7.3,
  maxLng: 7.55,
};

export class LocationsService {
  calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  validateNsukkaCoordinates(lat: number, lng: number): void {
    if (
      lat < NSUKKA_BOUNDS.minLat ||
      lat > NSUKKA_BOUNDS.maxLat ||
      lng < NSUKKA_BOUNDS.minLng ||
      lng > NSUKKA_BOUNDS.maxLng
    ) {
      throw new LocationOutOfBoundsError(
        `Coordinates (${lat}, ${lng}) lie outside the UNN / Nsukka geographic boundaries (TC-024)`
      );
    }
  }

  async getAllGates() {
    const gates = await locationsRepo.findAllGates();
    return gates.map((g) => LocationsMapper.toGateDto(g));
  }

  async getAllZones() {
    const zones = await locationsRepo.findAllZones();
    return zones.map((z) => LocationsMapper.toZoneDto(z));
  }

  async computeGateDistances(lat: number, lng: number) {
    this.validateNsukkaCoordinates(lat, lng);
    const gates = await this.getAllGates();

    return gates.map((gate) => {
      const distance = this.calculateHaversineDistance(
        lat,
        lng,
        parseFloat(gate.latitude),
        parseFloat(gate.longitude)
      );
      return {
        gateId: gate.id,
        gateName: gate.name,
        distanceM: distance,
      };
    });
  }
}

export const locationsService = new LocationsService();
