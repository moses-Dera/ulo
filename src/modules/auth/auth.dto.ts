import { TokenPayload } from "@/shared/security/jwt";

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: "student" | "landlord" | "admin";
    status: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserSessionDto extends TokenPayload {}
