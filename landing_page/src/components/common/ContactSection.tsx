"use client";

import React, { useState } from "react";
import { Mail, MapPin, CheckCircle2, ChevronDown } from "lucide-react";
import { COUNTRY_CODES } from "@/data/qhtData";
import { COMPANY_NAME } from "@/config/constants";
import { submitLead } from "@/lib/leads";

interface ClinicLocation {
  city: string;
  address: string;
  mapLink?: string;
}

const DEFAULT_CLINIC_LOCATIONS: ClinicLocation[] = [
  {
    city: "Patna (Main Branch)",
    address: `${COMPANY_NAME}, Vishal Residency Wing-1, Pillar No-56, Raja Bazar, Patna, Bihar 800014`,
    mapLink: "https://www.google.com/maps/place/NEXGEN+HAIR+TRANSPLANT/@25.6044229,85.0827564,17z",
  },
  {
    city: "Mumbai (Second Branch)",
    address: `${COMPANY_NAME}, Mumbai, Maharashtra`,
    mapLink: "https://maps.google.com/?q=Mumbai+Maharashtra",
  },
];

interface ContactSectionProps {
  className?: string;
  showLocations?: boolean;
  locations?: ClinicLocation[];
}

export default function ContactSection({
  className = "",
  showLocations = true,
  locations = DEFAULT_CLINIC_LOCATIONS,
}: ContactSectionProps) {
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || phone.length < 7) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitLead({
        fullName,
        countryCode,
        phone,
        email,
        city,
        whatsappOptIn,
        source: "contact_form",
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setCity("");
    setIsSubmitted(false);
    setError(null);
  };

  return (
    <section className={`py-16 sm:py-20 lg:py-24 mt-32 bg-nexgen-pageLightBg overflow-hidden ${className}`}>
      <div className="qht-large-container">

        {/* Top Half: Contact Info (Left) + Lead Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Heading, Info, Email */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader leading-[1.18] tracking-tight">
              Connect with Our Specialists
              <br />
              or Visit Our Centers.
            </h2>

            <p className="text-sm sm:text-base text-nexgen-serviceInnerCard leading-relaxed max-w-md font-normal">
              Reach out directly for a comprehensive graft assessment, surgeon consultation, and tailored treatment roadmap.
            </p>

            {/* Email link */}
            <div className="pt-2">
              <a
                href={`mailto:care@${COMPANY_NAME.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}
                className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader hover:text-nexgen-primaryGold transition-colors"
              >
                care@{COMPANY_NAME.toLowerCase().replace(/[^a-z0-9]/g, "")}.com
              </a>
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div className="lg:col-span-6">
            <div className="w-full">
              <h3 className="text-2xl sm:text-[28px] font-[500] text-nexgen-primaryGold mb-6">
                Schedule a Consultation
              </h3>

              {isSubmitted ? (
                <div className="bg-white rounded-3xl p-8 text-center space-y-4 shadow-sm border border-gray-100">
                  <div className="w-14 h-14 bg-nexgen-primaryGold/10 text-nexgen-primaryGold rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-nexgen-veryDarkHeader">
                    Thank You, {fullName}!
                  </h4>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">
                    Your request has been received. Our senior hair transplant specialist will connect with you on <strong>{countryCode} {phone}</strong> shortly.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2.5 bg-nexgen-primaryGold text-nexgen-veryDarkHeader rounded-xl text-xs font-bold hover:bg-nexgen-brightGold transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-white rounded-lg border border-transparent focus:border-nexgen-primaryGold text-sm text-gray-800 placeholder-gray-400 focus:outline-none shadow-xs transition-all"
                    />
                  </div>

                  {/* Phone with Country Code */}
                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-full appearance-none pl-3 pr-7 py-3 bg-white rounded-lg border border-transparent focus:border-nexgen-primaryGold text-xs sm:text-sm font-medium text-gray-700 focus:outline-none shadow-xs cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c, idx) => (
                          <option key={idx} value={c.code}>
                            {c.code} {c.country === "India" ? "IN" : c.country.slice(0, 2).toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <input
                      type="tel"
                      required
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 px-4 py-3 bg-white rounded-lg border border-transparent focus:border-nexgen-primaryGold text-sm text-gray-800 placeholder-gray-400 focus:outline-none shadow-xs transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white rounded-lg border border-transparent focus:border-nexgen-primaryGold text-sm text-gray-800 placeholder-gray-400 focus:outline-none shadow-xs transition-all"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <input
                      type="text"
                      placeholder="Enter City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 bg-white rounded-lg border border-transparent focus:border-nexgen-primaryGold text-sm text-gray-800 placeholder-gray-400 focus:outline-none shadow-xs transition-all"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="pt-1.5 space-y-2 text-xs text-nexgen-serviceInnerCard">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={whatsappOptIn}
                        onChange={(e) => setWhatsappOptIn(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-nexgen-primaryGold focus:ring-nexgen-primaryGold accent-nexgen-primaryGold cursor-pointer"
                      />
                      <span>Opt-in for WhatsApp updates</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-nexgen-primaryGold focus:ring-nexgen-primaryGold accent-nexgen-primaryGold cursor-pointer"
                      />
                      <span>You authorise {COMPANY_NAME} as per Privacy Policy</span>
                    </label>
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                      {error}
                    </p>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-nexgen-primaryGold hover:bg-nexgen-brightGold text-nexgen-veryDarkHeader rounded-xl font-bold text-sm sm:text-base shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                    >
                      {isSubmitting ? "Scheduling..." : "Schedule a Consultation"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Half: Clinic Location Cards */}
        {showLocations && (
          <div className={`mt-14 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 ${locations.length <= 2 ? "lg:grid-cols-2 max-w-4xl mx-auto" : "lg:grid-cols-4"} gap-6 items-stretch`}>
            {locations.map((loc, idx) => (
              <a
                key={idx}
                href={loc.mapLink || "#"}
                target="_blank"
                rel="noreferrer"
                className="bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-start shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                {/* Location Icon */}
                <div className="w-8 h-8 flex items-center justify-center text-nexgen-primaryGold flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 stroke-[2.2] fill-nexgen-primaryGold/15" />
                </div>

                {/* City Name */}
                <h4 className="text-lg sm:text-xl font-[500] text-nexgen-veryDarkHeader mt-4 tracking-tight leading-snug">
                  {loc.city}
                </h4>

                {/* Address */}
                <p className="text-xs sm:text-[13px] text-nexgen-serviceInnerCard mt-2.5 leading-relaxed font-normal">
                  {loc.address}
                </p>
              </a>
            ))}
          </div>
        )}

        {/* Interactive Google Map Embed */}
        <div className="mt-12 sm:mt-14 bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 px-1">
            <div>
              <span className="text-xs font-bold text-nexgen-primaryGold uppercase tracking-wider block mb-1">
                Find Us on the Map
              </span>
              <h4 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                {COMPANY_NAME} Location
              </h4>
              <p className="text-xs sm:text-sm text-nexgen-serviceInnerCard mt-1">
                Vishal Residency Wing-1, Pillar No-56, Raja Bazar, Patna, Bihar 800014
              </p>
            </div>
            <a
              href="https://www.google.com/maps/place/NEXGEN+HAIR+TRANSPLANT/@25.6044229,85.0827564,17z"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-nexgen-primaryGold hover:bg-nexgen-brightGold text-nexgen-veryDarkHeader text-xs sm:text-sm font-bold rounded-full shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Get Directions</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-gray-200/70 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2806.264183401463!2d85.0827563740967!3d25.604422915088595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed57924bf8c993%3A0xc9a79dda2a64c183!2sNEXGEN%20HAIR%20TRANSPLANT!5e1!3m2!1sen!2sin!4v1789286019174!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title={`${COMPANY_NAME} Location`}
              className="w-full h-full"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
