import { Metadata } from "next";
import { VerificationUploadView } from "@/components/landlord/VerificationUploadView";

export const metadata: Metadata = {
  title: "Landlord Verification — Ụlọ | UNN Nsukka",
  description: "Submit identity and ownership audit documents to verify your lodge listings on Ụlọ.",
};

export default function VerificationPage() {
  return <VerificationUploadView />;
}
