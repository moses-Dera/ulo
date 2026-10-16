"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  HiShieldCheck,
  HiOutlineBuildingOffice2,
  HiOutlineCheck,
  HiArrowRight,
  HiArrowLeft,
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineArrowUpTray,
  HiOutlineXMark,
} from "react-icons/hi2";
import { RiBuildingLine, RiKey2Line } from "react-icons/ri";

const UNN_GATES = [
  { id: "030eec86-fd40-4c34-85e3-b283da1db9f4", name: "Second Gate (Behind Flat)" },
  { id: "76683531-f7f5-4d47-afb4-020239f9fe6e", name: "Odim Gate (Veterinary & Pharmacy)" },
  { id: "e2238c8c-c3c7-4c65-b6d1-15f477d3e850", name: "Hilltop Gate (Charly's Gate)" },
  { id: "9972f5c6-8fec-4599-a861-587d6d3d7746", name: "Main Gate (Abuja Building)" },
];

const UNN_ZONES = [
  "Behind Flat",
  "Hilltop",
  "Odim Gate",
  "Green House",
  "Ofulonu",
  "Umunkaka",
] as const;

const WALK_BANDS = [
  { value: "under_5_min", label: "Under 5 minutes walk" },
  { value: "5_to_10_min", label: "5 — 10 minutes walk" },
  { value: "10_to_20_min", label: "10 — 20 minutes walk" },
  { value: "20_plus_min", label: "20+ minutes walk" },
];

const AMENITY_OPTIONS = [
  { id: "e99fa4a7-0948-420c-9ba4-94614c245794", name: "Borehole / Running Water" },
  { id: "3be068ea-85df-4813-b4b2-994762401967", name: "Standby Generator" },
  { id: "28310d5c-74d4-4038-a988-b9763f07b3f9", name: "Dedicated Transformer" },
  { id: "a43e57bc-6910-43e5-90b6-42c6a5b109ea", name: "Pre-paid Meter" },
  { id: "d9fd9286-70f3-4fa1-a2a2-6bb5786fd6db", name: "Fenced Compound & Gate" },
  { id: "6934358e-4c7b-43d7-83e6-948f1be0554b", name: "Uniformed Security Guard" },
  { id: "ec0493b9-65a7-4e77-abd7-090536d0194a", name: "Motorable Access Road" },
  { id: "11aef21d-12df-4110-8f3c-bfe845bc92e0", name: "POP Ceiling & Tiled Floor" },
  { id: "3e68e084-8bec-4ae5-a400-b26399249f8b", name: "Personal Kitchenette" },
  { id: "732a303d-9515-4feb-95da-7ed93ad253f9", name: "Waste Disposal Service" },
];

const PRESET_PHOTOGRAPHY = [
  { url: "/images/lodges/palm-exterior.webp", label: "Palm View Compound" },
  { url: "/images/lodges/hilltop-exterior.webp", label: "Hilltop Heights Paved" },
  { url: "/images/lodges/st-judes-exterior.webp", label: "St. Jude's Two-Storey" },
];

export function NewHostelForm() {
  const router = useRouter();

  // Basic Information
  const [title, setTitle] = useState("");
  const [zone, setZone] = useState<typeof UNN_ZONES[number]>("Behind Flat");
  const [streetText, setStreetText] = useState("");
  const [exactAddress, setExactAddress] = useState("");
  const [nearestGateId, setNearestGateId] = useState(UNN_GATES[0].id);
  const [walkTimeBand, setWalkTimeBand] = useState<string>("5_to_10_min");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState(
    "Compound gate locks at 10:00 PM prompt. Uniformed security on duty. Quiet hours start 10:00 PM."
  );

  // Room Spec & Pricing
  const [roomLabel, setRoomLabel] = useState("Self-Contain with Kitchenette");
  const [annualRent, setAnnualRent] = useState<number>(240000);
  const [totalUnits, setTotalUnits] = useState<number>(12);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "e99fa4a7-0948-420c-9ba4-94614c245794", // Borehole
    "28310d5c-74d4-4038-a988-b9763f07b3f9", // Dedicated Transformer
    "d9fd9286-70f3-4fa1-a2a2-6bb5786fd6db", // Fenced Compound
    "6934358e-4c7b-43d7-83e6-948f1be0554b", // Security Guard
  ]);

  // Image State (Presets + Custom Uploads)
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PHOTOGRAPHY[0].url);
  const [customPhotos, setCustomPhotos] = useState<File[]>([]);
  const [customPhotoPreviews, setCustomPhotoPreviews] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Form Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePhotosSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5);
      setCustomPhotos((prev) => [...prev, ...filesArray].slice(0, 5));
      const newPreviews = filesArray.map((f) => URL.createObjectURL(f));
      setCustomPhotoPreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
    }
  };

  const removeCustomPhoto = (index: number) => {
    setCustomPhotos((prev) => prev.filter((_, i) => i !== index));
    setCustomPhotoPreviews((prev) => {
      const targetUrl = prev[index];
      if (targetUrl) URL.revokeObjectURL(targetUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Submit Lodge Profile
      const payload = {
        title,
        description,
        rules,
        zone,
        streetText,
        exactAddress,
        nearestGateId,
        walkTimeBand,
        amenityIds: selectedAmenities,
      };

      const res = await fetch("/api/v1/landlord/hostels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // If landlord is unverified, explain clearly
        if (data.error?.code === "LANDLORD_NOT_VERIFIED") {
          throw new Error(
            "Your landlord account is pending identity audit. Please submit your NIN slip or property deed in the Verification Portal before publishing."
          );
        }
        throw new Error(data.error?.message || "Failed to create lodge listing.");
      }

      const hostelId = data.data?.id;

      // 2. Add Room Type to this hostel
      if (hostelId) {
        await fetch(`/api/v1/hostels/${hostelId}/room-types`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: roomLabel,
            annualRent: Number(annualRent),
            totalUnits: Number(totalUnits),
            description: `${roomLabel} at ${title}. Tiled flooring, borehole water, fenced compound.`,
          }),
        }).catch((err) => console.warn("Room type creation note:", err));

        // 3. Upload Custom Photos if provided
        if (customPhotos.length > 0) {
          for (let i = 0; i < customPhotos.length; i++) {
            const photo = customPhotos[i];
            const formData = new FormData();
            formData.append("file", photo);
            formData.append("isPrimary", i === 0 ? "true" : "false");
            formData.append("tag", i === 0 ? "exterior" : "room");
            formData.append("position", String(i + 1));

            await fetch(`/api/v1/landlord/hostels/${hostelId}/images`, {
              method: "POST",
              body: formData,
            }).catch((err) => console.warn("Image upload note:", err));
          }
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/landlord/dashboard");
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving the lodge listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full text-[#121212] pt-8 sm:pt-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link & Header */}
        <div className="mb-6">
          <Link
            href="/landlord/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[#5A5A58] hover:text-[#121212] transition-colors mb-3"
          >
            <HiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landlord Console</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#121212]">
            List a Student Lodge
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5A58] mt-1 font-sans">
            Register your compound details, campus proximity, verified amenities, and annual room rental rates.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
            <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-0.5">Listing Submission Note</p>
              <p>{errorMessage}</p>
              {errorMessage.includes("Verification") && (
                <Link
                  href="/landlord/verification"
                  className="mt-2 inline-block font-mono font-bold text-[11px] underline uppercase"
                >
                  Go to Landlord Verification Portal &rarr;
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-[#EBF3EE] border border-[#C6DEC3] text-[#1E513A] text-xs font-medium flex items-center gap-2">
            <HiOutlineCheckCircle className="w-5 h-5 text-[#1E513A]" />
            <span>Lodge registered successfully. Redirecting to your landlord dashboard...</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Compound Identification */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-5">
            <div className="border-b border-[#E8E5DF] pb-3">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#C25E38] font-semibold">
                Section 1 • Compound Identification
              </span>
              <h2 className="font-serif text-xl font-bold text-[#121212] mt-0.5">
                Lodge Location & Landmark
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Official Lodge Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Silver Crest Student Suites"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  UNN Campus Zone *
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                >
                  {UNN_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Nearest Campus Gate *
                </label>
                <select
                  value={nearestGateId}
                  onChange={(e) => setNearestGateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                >
                  {UNN_GATES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Walking Distance Band to Gate *
                </label>
                <select
                  value={walkTimeBand}
                  onChange={(e) => setWalkTimeBand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                >
                  {WALK_BANDS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Public Landmark Text * (Visible to all students)
                </label>
                <input
                  type="text"
                  required
                  value={streetText}
                  onChange={(e) => setStreetText(e.target.value)}
                  placeholder="e.g. Directly opposite Franco Annex Junction, Behind Flat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Exact Street Address * (Disclosed ONLY to approved students with confirmed 72h hold)
                </label>
                <input
                  type="text"
                  required
                  value={exactAddress}
                  onChange={(e) => setExactAddress(e.target.value)}
                  placeholder="e.g. Plot 18, Chidiebere Close, Behind Flat, UNN Nsukka"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Lodge Overview & Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the architectural layout, water pressure, ventilation, power stability, and compound security."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-sans text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Room Specification & Pricing */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-5">
            <div className="border-b border-[#E8E5DF] pb-3">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#C25E38] font-semibold">
                Section 2 • Room Specification & Pricing
              </span>
              <h2 className="font-serif text-xl font-bold text-[#121212] mt-0.5">
                Room Types & Vacancy Quotas
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Room Type Title *
                </label>
                <input
                  type="text"
                  required
                  value={roomLabel}
                  onChange={(e) => setRoomLabel(e.target.value)}
                  placeholder="e.g. Self-Contain with Kitchenette"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Annual Rent (₦) *
                </label>
                <input
                  type="number"
                  required
                  min={50000}
                  step={5000}
                  value={annualRent}
                  onChange={(e) => setAnnualRent(Number(e.target.value))}
                  placeholder="240000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-mono font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Total Units in Compound *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(Number(e.target.value))}
                  placeholder="12"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-mono font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                  Compound Security & Curfew Rules
                </label>
                <input
                  type="text"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="e.g. Gate locks at 10:00 PM; visitors must sign security register"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-sans text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Audited Utility Amenities */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-5">
            <div className="border-b border-[#E8E5DF] pb-3">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#C25E38] font-semibold">
                Section 3 • Verified Compound Utilities
              </span>
              <h2 className="font-serif text-xl font-bold text-[#121212] mt-0.5">
                Essential Amenities Checklist
              </h2>
              <p className="text-xs text-[#5A5A58] mt-1 font-sans">
                Only select amenities currently active and functional on the property premises.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    type="button"
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      isChecked
                        ? "bg-[#EBF3EE] border-[#1E513A] text-[#1E513A]"
                        : "bg-[#F8F7F4] border-[#E8E5DF] text-[#5A5A58] hover:border-[#DCD8D0]"
                    }`}
                  >
                    <span className="text-xs font-medium font-sans">{amenity.name}</span>
                    <div
                      className={`w-5 h-5 rounded-xs flex items-center justify-center transition-colors ${
                        isChecked ? "bg-[#1E513A] text-white" : "border border-[#DCD8D0] bg-white"
                      }`}
                    >
                      {isChecked && <HiOutlineCheck className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Visual Photography */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-5">
            <div className="border-b border-[#E8E5DF] pb-3">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#C25E38] font-semibold">
                Section 4 • Lodge Photography
              </span>
              <h2 className="font-serif text-xl font-bold text-[#121212] mt-0.5">
                Compound & Room Visuals
              </h2>
              <p className="text-xs text-[#5A5A58] mt-1 font-sans">
                Upload clear exterior and interior photos of your lodge. All photos are automatically optimized to WebP and stripped of GPS metadata before publishing.
              </p>
            </div>

            {/* Custom Photo Upload Area */}
            <div className="space-y-3">
              <input
                type="file"
                ref={photoInputRef}
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotosSelected}
                className="hidden"
              />

              <div className="p-6 rounded-xl border-2 border-dashed border-[#DCD8D0] bg-[#F9F8F6] text-center space-y-2">
                <HiOutlineArrowUpTray className="w-8 h-8 text-[#5A5A58] mx-auto" />
                <div className="text-xs font-medium text-[#121212]">
                  Upload Photos from Your Device
                </div>
                <p className="text-[11px] text-[#5A5A58]">
                  Select up to 5 photos (Exterior, Room Interior, Bathroom, Compound Gate). JPG, PNG, or WebP up to 5MB each.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="inline-block px-4 py-2 rounded-lg border border-[#DCD8D0] bg-white text-xs font-mono text-[#121212] cursor-pointer hover:bg-[#F3F0EB] transition-colors"
                  >
                    Select Lodge Photos ({customPhotos.length}/5)
                  </button>
                </div>
              </div>

              {/* Uploaded Photos Preview Grid */}
              {customPhotoPreviews.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#1E513A] font-semibold block">
                    Selected Photos ({customPhotoPreviews.length}) • First image will be primary listing cover
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {customPhotoPreviews.map((previewUrl, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-[#E8E5DF] group h-24 bg-[#121212]"
                      >
                        <img
                          src={previewUrl}
                          alt={`Uploaded preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-xs bg-[#1E513A] text-white text-[9px] font-mono uppercase font-bold">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeCustomPhoto(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                        >
                          <HiOutlineXMark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Presets Fallback */}
            {customPhotos.length === 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5A58] font-semibold block">
                  Or select a standard UNN compound architectural preset:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PRESET_PHOTOGRAPHY.map((photo) => {
                    const isSelected = selectedPhoto === photo.url;
                    return (
                      <button
                        type="button"
                        key={photo.url}
                        onClick={() => setSelectedPhoto(photo.url)}
                        className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all ${
                          isSelected
                            ? "border-[#1E513A] shadow-md ring-2 ring-[#1E513A]/20"
                            : "border-[#E8E5DF] opacity-80 hover:opacity-100"
                        }`}
                      >
                        <div className="relative h-28 w-full bg-[#121212]">
                          <Image
                            src={photo.url}
                            alt={photo.label}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="p-2.5 bg-white flex items-center justify-between">
                          <span className="text-[11px] font-mono font-medium text-[#121212]">
                            {photo.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-mono font-bold uppercase text-[#1E513A]">
                              Selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E8E5DF]">
            <Link
              href="/landlord/dashboard"
              className="text-xs font-mono uppercase tracking-wider text-[#5A5A58] hover:text-[#121212]"
            >
              Cancel and Return
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#C25E38] hover:bg-[#A84E2D] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>{submitting ? "Publishing Lodge..." : "Publish Lodge Listing"}</span>
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
