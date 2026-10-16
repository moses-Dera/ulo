"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { DiscoveryGrid } from "./DiscoveryGrid";
import { GateShowcase } from "./GateShowcase";
import { TheStandard } from "./TheStandard";
import { LandlordBanner } from "./LandlordBanner";
import { Footer } from "./Footer";
import { LodgeItem } from "./LodgeCard";

interface LandingViewProps {
  initialLodges?: LodgeItem[];
}

const DEFAULT_LODGES: LodgeItem[] = [
  {
    id: "st-judes-luxury-lodge",
    name: "St. Jude's Luxury Lodge",
    zone: "Behind Flat",
    gateProximity: "Second Gate",
    walkingMinutes: 3,
    minRent: 240000,
    roomType: "Self-Contain",
    availableUnits: 2,
    totalUnits: 8,
    imageUrl: "/images/lodge_st_judes.jpg",
    isVerifiedLandlord: true,
    amenities: ["Borehole Water", "Dedicated Gen", "Security Fence"],
  },
  {
    id: "hilltop-heights",
    name: "Hilltop Heights Student Suites",
    zone: "Hilltop",
    gateProximity: "Hilltop Gate",
    walkingMinutes: 5,
    minRent: 320000,
    roomType: "Executive Studio",
    availableUnits: 3,
    totalUnits: 12,
    imageUrl: "/images/lodge_interior.jpg",
    isVerifiedLandlord: true,
    amenities: ["Running Water", "Solar Inverter", "Fenced Gate"],
  },
  {
    id: "the-nest-student-residence",
    name: "The Nest Student Residence",
    zone: "Odim Gate",
    gateProximity: "Odim Gate",
    walkingMinutes: 4,
    minRent: 180000,
    roomType: "Single Room",
    availableUnits: 4,
    totalUnits: 10,
    imageUrl: "/images/lodge_nest.jpg",
    isVerifiedLandlord: true,
    amenities: ["Borehole", "Standby Gen", "Compound Security"],
  },
  {
    id: "green-house-modern-lodge",
    name: "Green House Modern Court",
    zone: "Green House",
    gateProximity: "Odim Gate",
    walkingMinutes: 6,
    minRent: 220000,
    roomType: "Self-Contain",
    availableUnits: 1,
    totalUnits: 6,
    imageUrl: "/images/lodge_st_judes.jpg",
    isVerifiedLandlord: true,
    amenities: ["Running Water", "Dedicated Transformer", "Gated Compound"],
  },
  {
    id: "ofulonu-palms-residency",
    name: "Ofulonu Palms Court",
    zone: "Ofulonu",
    gateProximity: "Hilltop Gate",
    walkingMinutes: 7,
    minRent: 260000,
    roomType: "Self-Contain",
    availableUnits: 3,
    totalUnits: 14,
    imageUrl: "/images/lodge_nest.jpg",
    isVerifiedLandlord: true,
    amenities: ["24/7 Borehole", "Security Post", "Paved Compound"],
  },
  {
    id: "cedar-crest-suites",
    name: "Cedar Crest Student Suites",
    zone: "Behind Flat",
    gateProximity: "Second Gate",
    walkingMinutes: 4,
    minRent: 290000,
    roomType: "Deluxe Self-Contain",
    availableUnits: 2,
    totalUnits: 8,
    imageUrl: "/images/lodge_interior.jpg",
    isVerifiedLandlord: true,
    amenities: ["Borehole Water", "Quiet Study Hall", "Uniformed Security"],
  },
];

export function LandingView({ initialLodges = DEFAULT_LODGES }: LandingViewProps) {
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedGate, setSelectedGate] = useState<string>("");
  const [maxRent, setMaxRent] = useState<number | "">("");

  const lodgesToDisplay = useMemo(() => {
    let result = initialLodges.length > 0 ? initialLodges : DEFAULT_LODGES;

    if (selectedZone) {
      result = result.filter((l) =>
        l.zone.toLowerCase().includes(selectedZone.toLowerCase())
      );
    }

    if (selectedGate) {
      result = result.filter((l) =>
        l.gateProximity.toLowerCase().includes(selectedGate.toLowerCase())
      );
    }

    if (maxRent !== "") {
      result = result.filter((l) => l.minRent <= maxRent);
    }

    return result;
  }, [initialLodges, selectedZone, selectedGate, maxRent]);

  const handleSearchSubmit = () => {
    const el = document.getElementById("explore");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#121212]">
      <Navbar />

      <main className="flex-1">
        <HeroSection
          selectedZone={selectedZone}
          onZoneSelect={setSelectedZone}
          selectedGate={selectedGate}
          onGateSelect={setSelectedGate}
          maxRent={maxRent}
          onMaxRentChange={setMaxRent}
          onSearchSubmit={handleSearchSubmit}
        />

        <DiscoveryGrid
          initialLodges={lodgesToDisplay}
          selectedZone={selectedZone}
          onZoneSelect={setSelectedZone}
        />

        <GateShowcase />

        <TheStandard />

        <LandlordBanner />
      </main>

      <Footer />
    </div>
  );
}
