import { LandlordNotVerifiedError } from "./landlords.errors";
import { landlordsRepo } from "./landlords.repo";

export class LandlordsPolicy {
  static async assertVerified(landlordId: string) {
    const landlord = await landlordsRepo.findByUserId(landlordId);
    if (!landlord || landlord.verificationStatus !== "verified") {
      throw new LandlordNotVerifiedError();
    }
  }
}
