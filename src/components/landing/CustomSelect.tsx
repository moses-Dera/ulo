"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown, HiCheck } from "react-icons/hi2";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: any) => void;
  placeholder?: string;
  variant?: "default" | "inline" | "cell";
  align?: "left" | "right";
}

export function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  variant = "cell",
  align = "left",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left transition-all focus:outline-none flex items-center justify-between cursor-pointer ${
          variant === "inline"
            ? "py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl hover:bg-[#F7F6F3] focus:ring-2 focus:ring-[#121212]/20"
            : variant === "cell"
            ? `h-[46px] sm:h-[48px] px-3.5 py-1.5 rounded-xl border transition-all ${
                isOpen
                  ? "bg-white border-[#121212] ring-2 ring-[#121212]/10 shadow-xs"
                  : "bg-[#F8F7F4] border-[#DCD8D0] hover:border-[#121212]/50 hover:bg-white"
              }`
            : "py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] hover:border-[#121212]/60 focus:ring-2 focus:ring-[#121212]/20"
        }`}
      >
        <div className="flex flex-col min-w-0 pr-1 justify-center">
          <span className="block text-[9px] sm:text-[9.5px] font-mono uppercase tracking-[0.14em] text-[#121212]/70 font-bold leading-tight mb-0.5">
            {label}
          </span>
          <span className="block text-xs sm:text-[13px] font-semibold text-[#121212] truncate">
            {displayText}
          </span>
        </div>
        <HiChevronDown
          className={`w-3.5 h-3.5 text-[#121212]/60 shrink-0 ml-1 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#C25E38]" : ""
          }`}
        />
      </button>

      {/* Floating Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={`absolute top-full ${
              align === "right" ? "right-0" : "left-0"
            } min-w-[200px] max-w-[calc(100vw-32px)] sm:max-w-[280px] mt-1.5 z-50 bg-white rounded-xl border border-[#E8E5DF] shadow-xl p-1 max-h-60 overflow-y-auto scrollbar-thin`}
          >
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#FAF2EE] text-[#C25E38] font-semibold"
                      : "text-[#121212] hover:bg-[#F9F8F6] hover:text-[#C25E38]"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <HiCheck className="w-4 h-4 text-[#C25E38] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
