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

export function LandingView({ initialLodges = [] }: LandingViewProps) {
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedGate, setSelectedGate] = useState<string>("");
  const [maxRent, setMaxRent] = useState<number | "">("");

  const lodgesToDisplay = useMemo(() => {
    let result = initialLodges;

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
