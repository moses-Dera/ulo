import { authRepo } from "./auth.repo";
import { hashPassword, comparePassword } from "@/shared/security/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken, TokenPayload } from "@/shared/security/jwt";
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  AccountSuspendedError,
  IdentifierBannedError,
  AuthError,
} from "./auth.errors";
import { emitUserRegistered } from "./auth.events";
import { AuthMapper } from "./auth.mapper";
import { mailer } from "@/shared/mail/mailer";
import { config } from "@/shared/config";
import { StudentRegisterInput, LandlordRegisterInput, LoginInput } from "./auth.schema";

export class AuthService {
  async registerStudent(input: StudentRegisterInput) {
    // 1. Check banned telephone / identifier (TC-023)
    const isBanned = await authRepo.checkBannedIdentifier(input.phone);
    if (isBanned) {
      throw new IdentifierBannedError();
    }

    // 2. Check email and phone uniqueness
    const exists = await authRepo.checkEmailOrPhoneExists(input.email, input.phone);
    if (exists) {
      throw new UserAlreadyExistsError("A user with this email or phone number already exists");
    }

    // 3. Check student reg number uniqueness (TC-007 / FR-A1)
    const regExists = await authRepo.checkRegNumberExists(input.regNumber);
    if (regExists) {
      throw new UserAlreadyExistsError("A student with this UNN Registration Number is already registered");
    }

    // 4. Hash password with bcrypt cost 12
    const passwordHash = await hashPassword(input.password);

    // 5. Create student in atomic transaction
    const user = await authRepo.createStudentUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      regNumber: input.regNumber,
      department: input.department,
    });

    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: "student",
      fullName: user.fullName,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // 6. Emit event and dispatch branded notification email
    await emitUserRegistered({
      userId: user.id,
      email: user.email,
      role: "student",
      fullName: user.fullName,
    });

    mailer.sendMail({
      to: user.email,
      subject: `Welcome to ${config.app.name} — Student Account Created`,
      html: `
        <p>Hello <strong>${user.fullName}</strong>,</p>
        <p>Your student profile has been created successfully on <strong>${config.app.name}</strong>.</p>
        <p>UNN Registration Number: <strong>${input.regNumber}</strong><br/>Department: <strong>${input.department}</strong></p>
        <p>You can now browse verified lodges across Behind Flat, Hilltop, Odim Gate, and Green House, and submit free room reservations.</p>
      `,
    });

    return AuthMapper.toAuthResponse(user, accessToken, refreshToken);
  }

  async registerLandlord(input: LandlordRegisterInput) {
    const isBanned = await authRepo.checkBannedIdentifier(input.phone);
    if (isBanned) {
      throw new IdentifierBannedError();
    }

    const exists = await authRepo.checkEmailOrPhoneExists(input.email, input.phone);
    if (exists) {
      throw new UserAlreadyExistsError("A user with this email or phone number already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepo.createLandlordUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
    });

    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: "landlord",
      fullName: user.fullName,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    await emitUserRegistered({
      userId: user.id,
      email: user.email,
      role: "landlord",
      fullName: user.fullName,
    });

    mailer.sendMail({
      to: user.email,
      subject: `Welcome to ${config.app.name} — Landlord Account Created`,
      html: `
        <p>Hello <strong>${user.fullName}</strong>,</p>
        <p>Your landlord account is ready. To list your lodges on the public directory, please upload your ownership deed or authority documents in the verification console.</p>
      `,
    });

    return AuthMapper.toAuthResponse(user, accessToken, refreshToken);
  }

  async login(input: LoginInput) {
    const user = await authRepo.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (user.status === "suspended") {
      throw new AccountSuspendedError();
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new InvalidCredentialsError();
    }

    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as "student" | "landlord" | "admin",
      fullName: user.fullName,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return AuthMapper.toAuthResponse(user, accessToken, refreshToken);
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await authRepo.findById(payload.sub);

    if (!user || user.status === "suspended") {
      throw new AuthError("User session no longer valid or account is suspended");
    }

    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as "student" | "landlord" | "admin",
      fullName: user.fullName,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    return AuthMapper.toAuthResponse(user, newAccessToken, newRefreshToken);
  }

  async getMe(userId: string) {
    const user = await authRepo.findById(userId);
    if (!user) {
      throw new AuthError("User not found", "USER_NOT_FOUND", 404);
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
  }
}

export const authService = new AuthService();
