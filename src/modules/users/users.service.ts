import { usersRepo } from "./users.repo";
import { UsersPolicy } from "./users.policy";
import { UsersMapper } from "./users.mapper";
import { UserNotFoundError, CannotAnonymizeLastAdminError } from "./users.errors";
import { UpdateStudentProfileInput, UpdateLandlordProfileInput } from "./users.schema";

export class UsersService {
  async getProfile(userId: string) {
    const data = await usersRepo.findUserWithProfile(userId);
    if (!data) {
      throw new UserNotFoundError();
    }
    return UsersMapper.toProfileDto(data);
  }

  async updateStudentProfile(
    userId: string,
    actorId: string,
    actorRole: string,
    data: UpdateStudentProfileInput
  ) {
    UsersPolicy.assertCanModify(userId, actorId, actorRole);
    const updated = await usersRepo.updateStudentProfile(userId, data);
    return UsersMapper.toProfileDto(updated);
  }

  async updateLandlordProfile(
    userId: string,
    actorId: string,
    actorRole: string,
    data: UpdateLandlordProfileInput
  ) {
    UsersPolicy.assertCanModify(userId, actorId, actorRole);
    const updated = await usersRepo.updateLandlordProfile(userId, data);
    return UsersMapper.toProfileDto(updated);
  }

  async anonymizeAccount(userId: string, actorId: string, actorRole: string) {
    UsersPolicy.assertCanModify(userId, actorId, actorRole);

    const data = await usersRepo.findUserWithProfile(userId);
    if (!data) {
      throw new UserNotFoundError();
    }

    // FR-E19: The last active admin cannot be deleted or suspended
    if (data.user.role === "admin") {
      const adminCount = await usersRepo.countActiveAdmins();
      if (adminCount <= 1) {
        throw new CannotAnonymizeLastAdminError();
      }
    }

    await usersRepo.anonymizeUser(userId);
    return { success: true, message: "Account successfully anonymized in compliance with NDPA 2023" };
  }
}

export const usersService = new UsersService();
