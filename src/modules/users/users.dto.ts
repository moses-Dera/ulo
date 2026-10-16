export interface StudentProfileDto {
  regNumber: string;
  department: string;
}

export interface LandlordProfileDto {
  verificationStatus: string;
  verificationReason: string | null;
  verifiedAt: Date | null;
}

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: "student" | "landlord" | "admin";
  status: string;
  emailVerifiedAt: Date | null;
  student?: StudentProfileDto;
  landlord?: LandlordProfileDto;
  createdAt: Date;
}
