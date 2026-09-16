"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X, Gift } from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";
import { useOffer } from "@/context/OfferContext";
import { STATIC_OFFER, type OfferBannerConfig } from "@/config/offer";

// Re-exported so existing imports from this module keep working.
export { STATIC_OFFER };
export type { OfferBannerConfig };

interface TopOfferBannerProps {
  config?: OfferBannerConfig;
  onOpenConsultation?: () => void;
  onVisibilityChange?: (visible: boolean) => void;
}

export default function TopOfferBanner({
  config: propConfig,
  onOpenConsultation,
  onVisibilityChange,
}: TopOfferBannerProps) {
  const contextOffer = useOffer();
  const config = propConfig ?? contextOffer;
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { claimOffer } = useConsultation();

  // Appears after slight delay with animation
  useEffect(() => {
    if (!config.isEnabled) {
      setIsVisible(false);
      if (onVisibilityChange) onVisibilityChange(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      if (onVisibilityChange) onVisibilityChange(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [config.isEnabled, onVisibilityChange]);

  // Claiming the offer opens the modal in offer mode, which lands on /offer
  // after a successful submit. An explicit handler still overrides that.
  const handleAction = () => {
    if (onOpenConsultation) {
      onOpenConsultation();
    } else {
      claimOffer();
    }
  };

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVisible(false);
    if (onVisibilityChange) onVisibilityChange(false);
    setTimeout(() => {
      setIsDismissed(true);
    }, 400);
  };

  if (!config.isEnabled || isDismissed) {
    return null;
  }

  return (
    <div
      className={`relative z-50 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible
        ? "max-h-24 sm:max-h-20 opacity-100 translate-y-0"
        : "max-h-0 opacity-0 -translate-y-full pointer-events-none"
        }`}
    >
      <div className="bg-gradient-to-r from-nexgen-veryDarkHeader via-nexgen-mainDarkBg to-nexgen-veryDarkHeader text-white py-2 sm:py-2.5 px-3 sm:px-6 border-b border-nexgen-primaryGold/25 shadow-md relative overflow-hidden">

        {/* Animated Light Sweep Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full animate-[shimmer_4s_infinite] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 relative z-10">

          {/* Left / Center: Offer Announcement Content */}
          <div
            onClick={handleAction}
            className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer group"
          >
            {/* Badge with gentle glowing pulse */}
            {config.badge && (
              <span className="inline-flex items-center gap-1 bg-nexgen-veryDarkHeader text-nexgen-brightGold border border-nexgen-primaryGold/50 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-xs shrink-0">
                <Sparkles className="w-3 h-3 text-nexgen-brightGold" />
                <span className="whitespace-nowrap">{config.badge}</span>
              </span>
            )}

            {/* Mobile Title / Highlight (Compact single-line view) */}
            <div className="flex sm:hidden items-center gap-1 min-w-0 text-[11px] font-medium text-white/95 leading-tight truncate">
              {config.highlightText ? (
                <>
                  <span className="text-white/80 shrink-0">Get</span>
                  <span className="font-bold text-nexgen-brightGold truncate">{config.highlightText}</span>
                </>
              ) : (
                <span className="truncate">{config.title}</span>
              )}
            </div>

            {/* Desktop Title & Highlight (Full rich text) */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs lg:text-[13px] text-white/95 font-medium leading-normal truncate">
              <span className="truncate">{config.title}</span>
              {config.highlightText && (
                <span className="font-bold text-nexgen-brightGold underline decoration-nexgen-primaryGold/40 underline-offset-2 shrink-0">
                  {config.highlightText}
                </span>
              )}
            </div>

            {/* Optional Coupon Code Tag */}
            {config.couponCode && (
              <span className="hidden xl:inline-flex items-center gap-1 bg-black/40 border border-dashed border-nexgen-primaryGold/40 text-white/90 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold tracking-wider shrink-0">
                Code: <strong className="text-nexgen-brightGold">{config.couponCode}</strong>
              </span>
            )}
          </div>

          {/* Right: CTA & Dismiss Button (Always available on both mobile & desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center gap-1 bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader font-bold text-[10px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-xs hover:shadow-md transition-all duration-150 active:scale-95 hover:scale-[1.02] cursor-pointer"
            >
              <span>{config.ctaText ? config.ctaText.replace("Consultation", "Offer") : "Claim"}</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
