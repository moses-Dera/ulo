import { Metadata } from "next";
import { NewHostelForm } from "@/components/landlord/NewHostelForm";

export const metadata: Metadata = {
  title: "List a Student Lodge — Ụlọ | UNN Nsukka",
  description: "Register a verified student hostel in Behind Flat, Hilltop, or Odim Gate on Ụlọ.",
};

export default function NewHostelPage() {
  return <NewHostelForm />;
}
