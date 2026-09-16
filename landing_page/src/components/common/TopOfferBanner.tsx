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

  const handleDismiss = () => {
    setIsVisible(false);
    if (onVisibilityChange) onVisibilityChange(false);
    setTimeout(() => {
      setIsDismissed(true);
    }, 500);
  };

  if (!config.isEnabled || isDismissed) {
    return null;
  }

  return (
    <div
      className={`relative z-50 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible
        ? "max-h-36 opacity-100 translate-y-0"
        : "max-h-0 opacity-0 -translate-y-full pointer-events-none"
        }`}
    >
      <div className="bg-gradient-to-r from-nexgen-veryDarkHeader via-nexgen-mainDarkBg to-nexgen-veryDarkHeader text-white py-3 sm:py-3.5 px-4 sm:px-8 border-b border-nexgen-primaryGold/25 shadow-md relative overflow-hidden">

        {/* Animated Light Sweep Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full animate-[shimmer_4s_infinite] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs sm:text-[13.5px] relative z-10">

          {/* Left / Center: Offer Announcement Content */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap sm:flex-nowrap mx-auto sm:mx-0">

            {/* Badge with gentle glowing pulse */}
            {config.badge && (
              <span className="inline-flex items-center gap-1.5 bg-nexgen-veryDarkHeader text-nexgen-brightGold border border-nexgen-primaryGold/60 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-nexgen-brightGold" />
                <span>{config.badge}</span>
              </span>
            )}

            {/* Main Text */}
            <div className="text-white/95 font-medium flex items-center gap-1.5 flex-wrap leading-relaxed">
              <span>{config.title}</span>
              {config.highlightText && (
                <span className="font-bold text-nexgen-brightGold underline decoration-nexgen-primaryGold/40 underline-offset-2">
                  {config.highlightText}
                </span>
              )}
            </div>

            {/* Optional Coupon Code Tag */}
            {config.couponCode && (
              <span className="hidden md:inline-flex items-center gap-1 bg-black/40 border border-dashed border-nexgen-primaryGold/40 text-white/90 px-2.5 py-1 rounded-md font-mono text-[11.5px] font-semibold tracking-wider">
                Code: <strong className="text-nexgen-brightGold">{config.couponCode}</strong>
              </span>
            )}

          </div>

          {/* Right: CTA & Dismiss Button */}
          <div className="hidden sm:flex items-center gap-3.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center gap-1.5 bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader font-bold text-xs sm:text-[13px] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 hover:scale-[1.03] cursor-pointer"
            >
              <span>{config.ctaText || "Claim Offer"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
