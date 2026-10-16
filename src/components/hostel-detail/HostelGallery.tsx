"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowsPointingOut, HiXMark, HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export interface GalleryImage {
  id: string;
  storageKey: string;
  thumbKey?: string;
  tag?: string;
  isPrimary?: boolean;
}

interface HostelGalleryProps {
  images: GalleryImage[];
  title: string;
}

export function HostelGallery({ images, title }: HostelGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayImages = images.length > 0 ? images : [
    { id: "default", storageKey: "/images/lodges/palm-exterior.webp", tag: "exterior" }
  ];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Hero Photo (16:10 ratio) */}
      <div
        onClick={() => setLightboxOpen(true)}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#E8E5DF] cursor-pointer group border border-[#E8E5DF]"
      >
        <Image
          src={currentImage.storageKey}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-102"
        />

        {/* View Full Gallery Trigger Badge */}
        <div className="absolute bottom-3 right-3 bg-[#121212]/80 backdrop-blur-md text-white text-[11px] font-mono tracking-wider uppercase px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <HiOutlineArrowsPointingOut className="w-3.5 h-3.5" />
          <span>Expand Gallery ({displayImages.length})</span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {displayImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? "border-[#C25E38] ring-1 ring-[#C25E38]/30 shadow-xs"
                  : "border-[#E8E5DF] opacity-75 hover:opacity-100 hover:border-[#121212]/40"
              }`}
            >
              <Image
                src={img.storageKey}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-[#121212]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors z-50 cursor-pointer"
            >
              <HiXMark className="w-6 h-6" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full h-[75vh] flex items-center justify-center"
            >
              <Image
                src={currentImage.storageKey}
                alt={`${title} full view`}
                fill
                sizes="100vw"
                className="object-contain"
              />

              {displayImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                  >
                    <HiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                  >
                    <HiChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 font-mono text-xs">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
