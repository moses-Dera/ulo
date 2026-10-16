import { landlords, verificationDocuments } from "./db";
import { LandlordVerificationDto, VerificationDocumentDto } from "./landlords.dto";

type LandlordRow = typeof landlords.$inferSelect;
type DocRow = typeof verificationDocuments.$inferSelect;

export class LandlordsMapper {
  static toVerificationDto(landlord: LandlordRow, docs: DocRow[]): LandlordVerificationDto {
    return {
      status: landlord.verificationStatus as "unsubmitted" | "pending" | "verified" | "rejected",
      reason: landlord.verificationReason,
      verifiedAt: landlord.verifiedAt,
      documents: docs.map((d) => this.toDocDto(d)),
    };
  }

  static toDocDto(doc: DocRow): VerificationDocumentDto {
    return {
      id: doc.id,
      docType: doc.docType as "nin" | "drivers_license" | "deed" | "authority_letter",
      storageKey: doc.storageKey,
      createdAt: doc.createdAt,
    };
  }
}
