"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { COUNTRY_CODES } from "@/data/qhtData";
import { COMPANY_NAME } from "@/config/constants";
import { submitLead } from "@/lib/leads";
import { STATIC_OFFER, OFFER_PAGE_PATH } from "@/config/offer";
import { useOffer } from "@/context/OfferContext";
import type { ConsultationIntent } from "@/context/ConsultationContext";

interface ConsultationModalProps {
  isOpen: boolean;
  /** "offer" = opened from the banner's claim button; success goes to /offer. */
  intent?: ConsultationIntent;
  onClose: () => void;
}

export default function ConsultationModal({
  isOpen,
  intent = "consultation",
  onClose,
}: ConsultationModalProps) {
  const router = useRouter();
  const activeOffer = useOffer();
  const currentOffer = activeOffer.isEnabled ? activeOffer : STATIC_OFFER;
  const isOffer = intent === "offer";
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("Patna");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 7) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitLead({
        fullName: name,
        countryCode,
        phone,
        branch,
        source: "consultation_modal",
        // Lead sources are a DB enum, so the claim is flagged in the message
        // instead — it shows on the lead in the admin panel.
        ...(isOffer && {
          message: `Claimed website offer${currentOffer.couponCode ? ` (code ${currentOffer.couponCode})` : ""}: ${currentOffer.highlightText ?? currentOffer.title}`,
        }),
      });

      if (isOffer) {
        // The offer page is the confirmation, so skip the in-modal thank-you.
        setName("");
        setPhone("");
        onClose();
        router.push(`${OFFER_PAGE_PATH}?claimed=1`);
        return;
      }
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName("");
    setPhone("");
    setIsSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-[#1b392b] text-white p-6 sm:p-8 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 bg-[#b1fc85] text-[#162418] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> {isOffer ? currentOffer.badge ?? "Special Offer" : "Free Consultation"}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            {isOffer ? "Claim Your Offer" : "Book a Consultation Today"}
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            {isOffer
              ? `Share your details to reserve ${currentOffer.highlightText ?? "this offer"} with your ${COMPANY_NAME} consultation.`
              : `Get personalized hairline assessment and exact graft estimate from ${COMPANY_NAME} specialists.`}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-[#b1fc85]/20 text-[#1b392b] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#00d084]" />
              </div>
              <h4 className="text-xl font-bold text-[#1b392b]">
                Thank You, {name}!
              </h4>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Your consultation request has been submitted successfully. Our medical coordinator will contact you shortly on <strong>{countryCode} {phone}</strong>.
              </p>
              <button
                onClick={handleResetAndClose}
                className="qht-btn w-full mt-4"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1b392b] focus:ring-1 focus:ring-[#1b392b]"
                />
              </div>

              {/* Phone with Country Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-32 px-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:outline-none focus:border-[#1b392b]"
                  >
                    {COUNTRY_CODES.map((c, idx) => (
                      <option key={idx} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1b392b] focus:ring-1 focus:ring-[#1b392b]"
                  />
                </div>
              </div>

              {/* Nearest Clinic Branch */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Preferred Clinic Location
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:outline-none focus:border-[#1b392b]"
                >
                  <option value="Patna">Patna (Main Branch - Raja Bazar)</option>
                  <option value="Mumbai">Mumbai (Second Branch)</option>
                </select>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#1b392b] text-white rounded-full font-bold text-sm hover:bg-[#284c3b] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <span>{isOffer ? "Claim Offer" : "Book Free Consultation"}</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00d084]" />
                <span>100% Confidential · No Spam Guarantee</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
