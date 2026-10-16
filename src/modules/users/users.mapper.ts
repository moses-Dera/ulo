import { UserProfileDto } from "./users.dto";
import { users, students, landlords } from "./db";

type UserRow = typeof users.$inferSelect;
type StudentRow = typeof students.$inferSelect;
type LandlordRow = typeof landlords.$inferSelect;

export class UsersMapper {
  static toProfileDto(data: {
    user: UserRow;
    student?: StudentRow | null;
    landlord?: LandlordRow | null;
  }): UserProfileDto {
    return {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      phone: data.user.phone,
      role: data.user.role as "student" | "landlord" | "admin",
      status: data.user.status,
      emailVerifiedAt: data.user.emailVerifiedAt,
      student: data.student
        ? {
            regNumber: data.student.regNumber,
            department: data.student.department,
          }
        : undefined,
      landlord: data.landlord
        ? {
            verificationStatus: data.landlord.verificationStatus,
            verificationReason: data.landlord.verificationReason,
            verifiedAt: data.landlord.verifiedAt,
          }
        : undefined,
      createdAt: data.user.createdAt,
    };
  }
}
