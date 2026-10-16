import { propertiesRepo } from "./properties.repo";
import { PropertiesPolicy } from "./properties.policy";
import { PropertiesMapper } from "./properties.mapper";
import {
  HostelNotFoundError,
  RoomTypeNotFoundError,
  UnitsBelowOccupiedError,
  CannotDeleteRoomWithBookingsError,
  InsufficientPhotosError,
} from "./properties.errors";
import { emitHostelSubmitted } from "./properties.events";
import { locationsService } from "../locations/locations.service";
import { LandlordsPolicy } from "../landlords/landlords.policy";
import {
  CreateHostelInput,
  UpdateHostelInput,
  CreateRoomTypeInput,
  UpdateRoomTypeInput,
} from "./properties.schema";

export class PropertiesService {
  async createHostel(landlordId: string, actorRole: string, data: CreateHostelInput) {
    // Landlord must be verified by admin before listing (FR-L3)
    if (actorRole !== "admin") {
      await LandlordsPolicy.assertVerified(landlordId);
    }

    if (data.latitude && data.longitude) {
      locationsService.validateNsukkaCoordinates(data.latitude, data.longitude);
    }

    const hostel = await propertiesRepo.createHostel(landlordId, data);

    // Compute gate distances if coordinates are provided
    if (data.latitude && data.longitude) {
      const distances = await locationsService.computeGateDistances(data.latitude, data.longitude);
      await propertiesRepo.setGateDistances(
        hostel.id,
        distances.map((d) => ({ gateId: d.gateId, distanceM: d.distanceM }))
      );
    }

    return hostel;
  }

  async updateHostel(id: string, actorId: string, actorRole: string, data: UpdateHostelInput) {
    const hostel = await propertiesRepo.findById(id);
    if (!hostel) {
      throw new HostelNotFoundError();
    }

    PropertiesPolicy.assertOwnership(hostel, actorId, actorRole);

    if (data.latitude && data.longitude) {
      locationsService.validateNsukkaCoordinates(data.latitude, data.longitude);
    }

    const updated = await propertiesRepo.updateHostel(id, data);

    if (data.latitude && data.longitude) {
      const distances = await locationsService.computeGateDistances(data.latitude, data.longitude);
      await propertiesRepo.setGateDistances(
        id,
        distances.map((d) => ({ gateId: d.gateId, distanceM: d.distanceM }))
      );
    }

    // Material edits to a published listing send it back to review (FR-L5)
    if (hostel.status === "published" && (data.zone || data.latitude || data.longitude)) {
      await propertiesRepo.setHostelStatus(id, "pending_review", "Material edit submitted (location/zone changed)");
    }

    return updated;
  }

  async submitForReview(id: string, actorId: string, actorRole: string) {
    const hostel = await propertiesRepo.findById(id);
    if (!hostel) {
      throw new HostelNotFoundError();
    }

    PropertiesPolicy.assertOwnership(hostel, actorId, actorRole);

    // Enforce 4–10 photos rule with at least 1 room photo (FR-L3 / FR-E14)
    const { total, roomCount } = await propertiesRepo.countHostelImages(id);
    if (total < 4 || total > 10 || roomCount < 1) {
      throw new InsufficientPhotosError();
    }

    const updated = await propertiesRepo.setHostelStatus(id, "pending_review");
    await emitHostelSubmitted(id, hostel.landlordId);

    return updated;
  }

  async addRoomType(hostelId: string, actorId: string, actorRole: string, data: CreateRoomTypeInput) {
    const hostel = await propertiesRepo.findById(hostelId);
    if (!hostel) {
      throw new HostelNotFoundError();
    }

    PropertiesPolicy.assertOwnership(hostel, actorId, actorRole);
    return propertiesRepo.createRoomType(hostelId, data);
  }

  async updateRoomType(roomTypeId: string, actorId: string, actorRole: string, data: UpdateRoomTypeInput) {
    const roomType = await propertiesRepo.findRoomTypeById(roomTypeId);
    if (!roomType) {
      throw new RoomTypeNotFoundError();
    }

    const hostel = await propertiesRepo.findById(roomType.hostelId);
    if (!hostel) {
      throw new HostelNotFoundError();
    }

    PropertiesPolicy.assertOwnership(hostel, actorId, actorRole);

    // TC-015: Total units cannot drop below approved bookings plus blocked units
    if (data.totalUnits !== undefined && data.totalUnits < roomType.totalUnits) {
      const currentSession = await propertiesRepo.getCurrentSession();
      if (currentSession) {
        const { totalOccupied } = await propertiesRepo.countApprovedBookingsAndBlocks(
          roomTypeId,
          currentSession.id
        );
        if (data.totalUnits < totalOccupied) {
          throw new UnitsBelowOccupiedError();
        }
      }
    }

    return propertiesRepo.updateRoomType(roomTypeId, data);
  }

  async deleteRoomType(roomTypeId: string, actorId: string, actorRole: string) {
    const roomType = await propertiesRepo.findRoomTypeById(roomTypeId);
    if (!roomType) {
      throw new RoomTypeNotFoundError();
    }

    const hostel = await propertiesRepo.findById(roomType.hostelId);
    if (!hostel) {
      throw new HostelNotFoundError();
    }

    PropertiesPolicy.assertOwnership(hostel, actorId, actorRole);

    // FR-E5: Cannot delete a room type with approved bookings
    const currentSession = await propertiesRepo.getCurrentSession();
    if (currentSession) {
      const { approvedCount } = await propertiesRepo.countApprovedBookingsAndBlocks(
        roomTypeId,
        currentSession.id
      );
      if (approvedCount > 0) {
        throw new CannotDeleteRoomWithBookingsError();
      }
    }

    await propertiesRepo.deleteRoomType(roomTypeId);
    return { success: true };
  }

  async getHostelDetail(id: string, actorId?: string, actorRole?: string) {
    const data = await propertiesRepo.findHostelFullDetails(id);
    if (!data) {
      throw new HostelNotFoundError();
    }

    // Reveal private details only if actor is owner or admin
    const isOwner = actorId && data.hostel.landlordId === actorId;
    const isAdmin = actorRole === "admin";
    const revealPrivateDetails = Boolean(isOwner || isAdmin);

    return PropertiesMapper.toDetailDto(data, revealPrivateDetails);
  }
}

export const propertiesService = new PropertiesService();
