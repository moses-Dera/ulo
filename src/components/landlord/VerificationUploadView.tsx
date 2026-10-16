"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  HiShieldCheck,
  HiOutlineDocumentText,
  HiOutlineIdentification,
  HiOutlineBuildingLibrary,
  HiArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowUpTray,
  HiOutlineXMark,
} from "react-icons/hi2";

export function VerificationUploadView() {
  const [docType, setDocType] = useState<"nin" | "deed" | "authority_letter" | "drivers_license">("nin");
  const [ninNumber, setNinNumber] = useState("");
  const [documentRef, setDocumentRef] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("pending");

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/v1/landlord/verification");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.verificationStatus) {
            setCurrentStatus(json.data.verificationStatus);
          }
        }
      } catch (err) {
        // Fallback
      }
    }
    checkStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("Document file exceeds maximum allowed size (10 MB).");
        return;
      }
      setSelectedFile(file);
      setError(null);
      if (!documentRef) {
        setDocumentRef(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let finalStorageKey = documentRef || `doc_${Date.now()}`;

      // If a real file was picked, upload via storage upload API
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("docType", docType);

        const uploadRes = await fetch("/api/v1/landlord/verification/upload", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.success) {
          throw new Error(uploadJson.error?.message || "Failed to upload document file.");
        }
        finalStorageKey = uploadJson.data.storageKey;
      }

      const res = await fetch("/api/v1/landlord/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: [
            {
              docType,
              storageKey: finalStorageKey,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Verification submission failed.");
      }

      setSuccess(true);
      setCurrentStatus("submitted");
    } catch (err: any) {
      setError(err.message || "Failed to submit document for audit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full text-[#121212] pt-8 sm:pt-10 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/landlord/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[#5A5A58] hover:text-[#121212] transition-colors mb-3"
          >
            <HiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landlord Console</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#121212]">
            Landlord Verification Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5A58] mt-1 font-sans">
            Submit your National Identity Number (NIN) and property deed of conveyance to unlock verified lodge listings on Ụlọ.
          </p>
        </div>

        {/* Current Verification Status Banner */}
        <div className="mb-6 p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] text-[#1E513A] flex items-center justify-center shrink-0">
              <HiShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#5A5A58]">
                Audit Status
              </span>
              <h3 className="font-serif text-base font-bold text-[#121212] capitalize">
                {currentStatus === "verified"
                  ? "Identity & Property Ownership Verified"
                  : currentStatus === "submitted"
                  ? "Documents Under Review by Ụlọ Admin"
                  : "Verification Documents Required"}
              </h3>
            </div>
          </div>
          <span
            className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-xs font-semibold ${
              currentStatus === "verified"
                ? "bg-[#EBF3EE] text-[#1E513A]"
                : "bg-[#F4F3F0] text-[#C25E38]"
            }`}
          >
            {currentStatus === "verified" ? "VERIFIED LODGE OWNER" : "PENDING AUDIT"}
          </span>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-[#EBF3EE] border border-[#C6DEC3] text-[#1E513A] text-xs font-medium flex items-center gap-2">
            <HiOutlineCheckCircle className="w-5 h-5 text-[#1E513A] shrink-0" />
            <span>
              Your verification document has been securely submitted for administrative audit. Approvals typically take 2 to 4 business hours.
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-6">
          <div className="border-b border-[#E8E5DF] pb-4">
            <h2 className="font-serif text-xl font-bold text-[#121212]">
              Submit Supporting Documentation
            </h2>
            <p className="text-xs text-[#5A5A58] mt-1">
              To safeguard students at the University of Nigeria, Nsukka from rent diversion schemes, every landlord must present verifiable ownership documentation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                Document Classification *
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
              >
                <option value="nin">National Identity Slip (NIN)</option>
                <option value="deed">Deed of Conveyance / Land Agreement</option>
                <option value="authority_letter">Letter of Caretaker Authority (Signed by Landlord)</option>
                <option value="drivers_license">Federal Driver&apos;s License / Voter&apos;s Card</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                National Identity Number (NIN)
              </label>
              <input
                type="text"
                maxLength={11}
                value={ninNumber}
                onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="11-digit NIN"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-mono font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                Document Identifier / Reference *
              </label>
              <input
                type="text"
                required
                value={documentRef}
                onChange={(e) => setDocumentRef(e.target.value)}
                placeholder="e.g. DEED/EN/2019/PLOT-48 or NIN slip serial number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
              />
            </div>

            {/* Document Upload Area */}
            <div className="p-6 rounded-xl border-2 border-dashed border-[#DCD8D0] bg-[#F9F8F6] text-center space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="hidden"
              />

              <HiOutlineArrowUpTray className="w-8 h-8 text-[#5A5A58] mx-auto" />
              <div className="text-xs font-medium text-[#121212]">
                Upload Scanned Copy / Clear Photograph
              </div>
              <p className="text-[11px] text-[#5A5A58]">
                Supports PDF, JPG, PNG up to 10MB. Document must clearly show property address in Behind Flat, Hilltop, or Odim Gate.
              </p>

              {selectedFile ? (
                <div className="pt-2 flex items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#C6DEC3] bg-[#EBF3EE] text-[#1E513A] text-xs font-mono">
                    <HiOutlineCheckCircle className="w-4 h-4 text-[#1E513A]" />
                    <span className="font-semibold">{selectedFile.name}</span>
                    <span className="text-[10px] text-[#5A5A58]">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1 rounded-md text-[#5A5A58] hover:text-red-600 hover:bg-red-50"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-block px-3 py-1.5 rounded-lg border border-[#DCD8D0] bg-white text-[11px] font-mono text-[#121212] cursor-pointer hover:bg-[#F3F0EB] transition-colors"
                  >
                    Choose Document File
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link
                href="/landlord/dashboard"
                className="text-xs font-mono uppercase tracking-wider text-[#5A5A58] hover:text-[#121212]"
              >
                Return to Dashboard
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                {submitting ? "Submitting for Audit..." : "Submit for Verification"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
