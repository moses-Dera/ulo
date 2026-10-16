import { landlordsRepo } from "./landlords.repo";
import { LandlordNotFoundError } from "./landlords.errors";
import { emitVerificationSubmitted } from "./landlords.events";
import { LandlordsMapper } from "./landlords.mapper";
import { BadRequestError } from "@/shared/errors";
import { VerificationDocumentInput } from "./landlords.schema";

export class LandlordsService {
  async submitVerification(landlordId: string, docs: VerificationDocumentInput[]) {
    if (docs.length === 0) {
      throw new BadRequestError("At least one verification document is required");
    }

    const record = await landlordsRepo.findByUserId(landlordId);
    if (!record) {
      throw new LandlordNotFoundError();
    }

    const updated = await landlordsRepo.saveVerificationSubmission(landlordId, docs);
    await emitVerificationSubmitted(landlordId);

    return { status: updated.verificationStatus, documentsCount: docs.length };
  }

  async getVerification(landlordId: string) {
    const record = await landlordsRepo.findByUserId(landlordId);
    if (!record) {
      throw new LandlordNotFoundError();
    }

    const docs = await landlordsRepo.findDocuments(landlordId);
    return LandlordsMapper.toVerificationDto(record, docs);
  }

  async getOccupancy(landlordId: string) {
    const currentSession = await landlordsRepo.getCurrentSession();
    const sessionId = currentSession?.id;

    const landlordHostels = await landlordsRepo.findLandlordHostels(landlordId);

    if (landlordHostels.length === 0) {
      return {
        summary: { totalUnits: 0, occupiedUnits: 0, vacantUnits: 0, pendingRequests: 0 },
        hostels: [],
      };
    }

    const hostelIds = landlordHostels.map((h) => h.id);
    const allRoomTypes = await landlordsRepo.findRoomTypesByHostels(hostelIds);
    const roomTypeIds = allRoomTypes.map((r) => r.id);

    const activeBookings = await landlordsRepo.findActiveBookings(roomTypeIds, sessionId);
    const activeBlocks = sessionId ? await landlordsRepo.findActiveBlocks(roomTypeIds, sessionId) : [];

    let totalUnits = 0;
    let occupiedUnits = 0;
    let pendingRequests = 0;

    const hostelStatsMap = new Map<
      string,
      { totalUnits: number; occupiedUnits: number; vacantUnits: number; pendingRequests: number }
    >();

    for (const h of landlordHostels) {
      hostelStatsMap.set(h.id, { totalUnits: 0, occupiedUnits: 0, vacantUnits: 0, pendingRequests: 0 });
    }

    for (const rt of allRoomTypes) {
      const approvedCount = activeBookings.filter((b) => b.roomTypeId === rt.id && b.status === "APPROVED").length;
      const pendingCount = activeBookings.filter((b) => b.roomTypeId === rt.id && b.status === "PENDING").length;
      const blockedCount = activeBlocks
        .filter((ub) => ub.roomTypeId === rt.id)
        .reduce((sum, b) => sum + b.unitsBlocked, 0);

      const occupied = approvedCount + blockedCount;
      const vacant = Math.max(0, rt.totalUnits - occupied);

      totalUnits += rt.totalUnits;
      occupiedUnits += occupied;
      pendingRequests += pendingCount;

      const stat = hostelStatsMap.get(rt.hostelId);
      if (stat) {
        stat.totalUnits += rt.totalUnits;
        stat.occupiedUnits += occupied;
        stat.vacantUnits += vacant;
        stat.pendingRequests += pendingCount;
      }
    }

    const vacantUnits = Math.max(0, totalUnits - occupiedUnits);

    return {
      summary: {
        totalUnits,
        occupiedUnits,
        vacantUnits,
        pendingRequests,
      },
      hostels: landlordHostels.map((h) => ({
        ...h,
        stats: hostelStatsMap.get(h.id) || { totalUnits: 0, occupiedUnits: 0, vacantUnits: 0, pendingRequests: 0 },
      })),
    };
  }
}

export const landlordsService = new LandlordsService();
