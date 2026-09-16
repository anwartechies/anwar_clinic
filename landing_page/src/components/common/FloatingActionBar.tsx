"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";

interface FloatingActionBarProps {
  onOpenConsultation?: () => void;
}

export default function FloatingActionBar({
  onOpenConsultation,
}: FloatingActionBarProps) {
  const { openConsultation } = useConsultation();
  const handleOpenConsultation = onOpenConsultation || openConsultation;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const footerThreshold = 550; // Distance before footer where button disappears

      const reachedFooter = windowHeight + scrollY >= fullHeight - footerThreshold;
      setIsVisible(scrollY > 300 && !reachedFooter);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-40 flex items-center justify-center transition-all duration-300 ease-in-out ${
        isVisible
          ? "animate-bounce-drop-in pointer-events-auto"
          : "opacity-0 translate-y-10 scale-90 pointer-events-none -translate-x-1/2"
      }`}
    >
      {/* Clean Book Appointment CTA Button */}
      <button
        type="button"
        onClick={handleOpenConsultation}
        className="flex items-center gap-2 bg-nexgen-mainDarkBg text-white px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-xl hover:bg-nexgen-servicesSection hover:scale-105 active:scale-95 transition-all duration-300 border border-nexgen-primaryGold/40 cursor-pointer"
      >
        <Calendar className="w-4 h-4 text-nexgen-brightGold" />
        <span>Book Appointment</span>
      </button>
    </div>
  );
}
