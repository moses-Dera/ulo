import { PlatformMetricsDto, PendingVerificationItemDto } from "./moderation.dto";

export class ModerationMapper {
  static toMetricsDto(raw: any): PlatformMetricsDto {
    return {
      totalUsers: raw.totalUsers,
      studentsCount: raw.studentsCount,
      landlordsCount: raw.landlordsCount,
      verifiedLandlordsCount: raw.verifiedLandlordsCount,
      publishedHostelsCount: raw.publishedHostelsCount,
      pendingListingsCount: raw.pendingListingsCount,
      totalBookings: raw.totalBookings,
      approvedBookings: raw.approvedBookings,
      approvalRatePercentage: raw.approvalRatePercentage,
      hostelsByZone: raw.hostelsByZone,
    };
  }
}
