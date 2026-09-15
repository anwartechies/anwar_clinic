"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, CheckCircle2 } from "lucide-react";
import { COUNTRY_CODES } from "@/data/qhtData";
import { COMPANY_NAME } from "@/config/constants";
import { submitLead } from "@/lib/leads";

interface ServiceDetailHeroProps {
  slug?: string;
  title?: string;
  subtitle?: string;
  bannerImage?: string;
  tagline?: string;
  pointerLabel?: string;
  onOpenConsultation?: () => void;
}

export default function ServiceDetailHero({
  slug = "best-fue-hair-transplant-in-india",
  title = "FUE Hair Transplant",
  subtitle = `Advanced minimally invasive hair restoration solutions at ${COMPANY_NAME}.`,
  bannerImage = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80",
  pointerLabel = "Graft correction",
  onOpenConsultation,
}: ServiceDetailHeroProps) {
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    if (phone.length < 7) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitLead({
        fullName: fullName.trim(),
        countryCode,
        phone,
        email: email.trim() || undefined,
        // The service name travels with the lead so the admin panel shows
        // which page the callback was requested from.
        message: `Callback request — ${title}`,
        source: "contact_form",
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clears every field so the next request starts from a blank form.
  const handleSendAnother = () => {
    setFullName("");
    setCountryCode("+91");
    setPhone("");
    setEmail("");
    setError(null);
    setIsSubmitted(false);
  };

  const defaultSubtitle = `${title} procedures tailored by specialists at ${COMPANY_NAME} with clinical precision and natural results.`;

  const safeBannerImage =
    !bannerImage || bannerImage.includes("nexgenhairtransplant.com")
      ? "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80"
      : bannerImage;

  return (
    <div className="relative w-full">
      {/* 1. Main Hero Banner */}
      <section
        className="relative w-full bg-slate-900 bg-cover bg-center overflow-hidden min-h-[500px] sm:min-h-[580px] lg:min-h-[660px] flex items-center pt-28 sm:pt-36 lg:pt-20 pb-20 sm:pb-24"
        style={{
          backgroundImage: `url('${safeBannerImage}')`,
          backgroundPosition: "center 30%",
        }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 pointer-events-none" />

        <div className="qht-large-container relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Content: Breadcrumbs + Title + Description */}
            <div className="lg:col-span-7 space-y-4">
              {/* Breadcrumb Navigation */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                <Link href="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
                  {title}
                </span>
              </nav>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-[1.18]">
                {title.toLowerCase().includes("best") || title.toLowerCase().includes("clinic")
                  ? title
                  : `Best ${title} Clinic In India`}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-[17px] text-white/90 font-normal leading-relaxed max-w-xl">
                {subtitle || defaultSubtitle}
              </p>
            </div>

            {/* Right: Hairline Pointer Diagram */}
            <div className="hidden lg:flex lg:col-span-5 justify-end items-center pr-8">
              <div className="relative flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                {/* Pointer Line */}
                <div className="flex items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-black/80 border-2 border-white shadow-md"></div>
                  <div className="w-24 xl:w-36 h-[1.5px] bg-black/70"></div>
                </div>
                {/* Pointer Label */}
                <div className="text-2xl xl:text-3xl font-normal text-black/85 tracking-wide drop-shadow-sm font-serif">
                  {pointerLabel}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Floating "Request a callback" Green Bar */}
      <div className="relative z-20 -mt-10 sm:-mt-12 lg:-mt-14 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#596d53] text-white rounded-3xl p-5 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-white/10">
          {isSubmitted ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#b1fc85]" />
                <div>
                  <h4 className="text-base font-bold text-white">
                    Thank You, {fullName}! Callback Scheduled.
                  </h4>
                  <p className="text-xs text-white/80">
                    Our senior hair consultant will contact you at <strong>{countryCode} {phone}</strong> shortly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSendAnother}
                className="px-5 py-2 bg-white text-[#1b392b] rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleCallbackSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 lg:gap-8">
              {/* Title */}
              <div className="flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Request a callback
                </h3>
              </div>

              {/* Form Input Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 items-center">
                {/* Full Name */}
                <div className="relative border-b border-white/40 focus-within:border-white transition-colors pb-1">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-white/70 focus:outline-none py-1"
                  />
                </div>

                {/* Country Code + Mobile Number */}
                <div className="flex items-center gap-2 border-b border-white/40 focus-within:border-white transition-colors pb-1">
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-white/90 focus:outline-none appearance-none pr-4 cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c, idx) => (
                        <option key={idx} value={c.code} className="text-gray-900">
                          {c.code} {c.country === "India" ? "IN" : c.country.slice(0, 2).toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-white/70 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/70 focus:outline-none py-1 min-w-0"
                  />
                </div>

                {/* Email Address */}
                <div className="relative border-b border-white/40 focus-within:border-white transition-colors pb-1">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-white/70 focus:outline-none py-1"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex-shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-white text-[#2a382c] hover:bg-[#f0f4ef] font-bold text-sm sm:text-base py-2.5 px-8 rounded-full shadow-md transition-all active:scale-95 duration-150 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          )}

          {!isSubmitted && error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
