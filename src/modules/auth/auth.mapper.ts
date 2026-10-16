import { users } from "./db";
import { AuthResponseDto } from "./auth.dto";

type UserRow = typeof users.$inferSelect;

export class AuthMapper {
  static toAuthResponse(user: UserRow, accessToken: string, refreshToken: string): AuthResponseDto {
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role as "student" | "landlord" | "admin",
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }

  static toPublicProfile(user: UserRow) {
    return {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    };
  }
}
