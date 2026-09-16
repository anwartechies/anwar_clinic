"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Home,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Award,
} from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";
import { COMPANY_NAME, WHATSAPP_NUMBER } from "@/config/constants";

interface ComingSoonPageProps {
  title?: string;
  category?: string;
}

function ComingSoonContent({
  title: propTitle,
  category: propCategory,
}: ComingSoonPageProps) {
  const searchParams = useSearchParams();
  const pageParam = searchParams?.get("page") || searchParams?.get("feature") || propTitle;
  const { openConsultation } = useConsultation();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const displayTitle =
    pageParam ||
    propTitle ||
    "This Page";

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    setIsSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-nexgen-pageLightBg text-nexgen-veryDarkHeader flex flex-col justify-between pt-28 sm:pt-36 lg:pt-40 pb-16">
      <div className="qht-large-container">

        {/* Main Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-[36px] p-8 sm:p-12 lg:p-16 shadow-[0_12px_45px_rgba(3,42,58,0.06)] border border-nexgen-primaryGold/20 text-center relative overflow-hidden">

          {/* Subtle Decorative Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-nexgen-brightGold/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-nexgen-mainDarkBg/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nexgen-luxuryGold/15 border border-nexgen-luxuryGold/35 text-nexgen-veryDarkHeader text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-nexgen-primaryGold" />
            <span>Under Development • Launching Soon</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-bold text-nexgen-veryDarkHeader tracking-tight leading-[1.15] max-w-2xl mx-auto">
            We’re Crafting Something <span className="text-nexgen-primaryGold">Extraordinary</span>
          </h1>

          {/* Description */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mx-auto font-normal">
            The <strong className="text-nexgen-veryDarkHeader font-semibold">{displayTitle}</strong> section is currently being updated with verified clinical information, interactive tools, and transparent insights.
          </p>

          {/* Notify Me Form */}
          <div className="mt-8 sm:mt-10 max-w-md mx-auto">
            {isSubscribed ? (
              <div className="bg-nexgen-navBg border border-nexgen-primaryGold/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-sm text-nexgen-veryDarkHeader font-semibold animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Thank you! We’ll notify you the moment this goes live.</span>
              </div>
            ) : (
              <form
                onSubmit={handleNotifySubmit}
                className="flex flex-col sm:flex-row items-center gap-3 bg-nexgen-navBg p-2 rounded-2xl sm:rounded-full border border-nexgen-primaryGold/25 focus-within:border-nexgen-primaryGold transition-colors"
              >
                <input
                  type="text"
                  required
                  placeholder="Enter email or phone number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm text-nexgen-veryDarkHeader placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl sm:rounded-full transition-all active:scale-95 whitespace-nowrap shadow-sm cursor-pointer"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>

          {/* Quick Divider */}
          <div className="my-10 sm:my-12 border-t border-nexgen-primaryGold/20 relative">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              In The Meantime
            </span>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">

            {/* Action 1: Explore Live Results */}
            <Link
              href="/results"
              className="p-5 rounded-2xl bg-nexgen-navBg/70 hover:bg-nexgen-navBg border border-nexgen-primaryGold/20 hover:border-nexgen-primaryGold/50 transition-all hover:-translate-y-0.5 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-nexgen-primaryGold flex items-center justify-center mb-3 shadow-xs border border-nexgen-primaryGold/20">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold transition-colors flex items-center justify-between">
                <span>View Results</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                500+ verified patient before & after pictures.
              </p>
            </Link>

            {/* Action 2: Cost & Packages */}
            <Link
              href="/hair-transplant-cost-in-india"
              className="p-5 rounded-2xl bg-nexgen-navBg/70 hover:bg-nexgen-navBg border border-nexgen-primaryGold/20 hover:border-nexgen-primaryGold/50 transition-all hover:-translate-y-0.5 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-nexgen-primaryGold flex items-center justify-center mb-3 shadow-xs border border-nexgen-primaryGold/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold transition-colors flex items-center justify-between">
                <span>Calculate Cost</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Transparent per-graft rates & Norwood guide.
              </p>
            </Link>

            {/* Action 3: Visit Our Clinics */}
            <Link
              href="/our-clinic"
              className="p-5 rounded-2xl bg-nexgen-navBg/70 hover:bg-nexgen-navBg border border-nexgen-primaryGold/20 hover:border-nexgen-primaryGold/50 transition-all hover:-translate-y-0.5 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-nexgen-primaryGold flex items-center justify-center mb-3 shadow-xs border border-nexgen-primaryGold/20">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold transition-colors flex items-center justify-between">
                <span>Our Clinics</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Patna (Main Branch) & Mumbai (Second Branch).
              </p>
            </Link>

          </div>

          {/* Primary Consultation Callout */}
          <div className="mt-10 sm:mt-12 pt-8 border-t border-nexgen-primaryGold/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-nexgen-veryDarkHeader">
                Need immediate guidance or medical advice?
              </h4>
              <p className="text-xs text-gray-500">
                Our senior trichology specialists are available 7 days a week.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20${encodeURIComponent(COMPANY_NAME)}%20Clinic,%20I%20would%20like%20to%20know%20more%20about%20hair%20transplant.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-nexgen-primaryGold text-nexgen-veryDarkHeader hover:bg-nexgen-primaryGold hover:text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Us</span>
              </a>

              <button
                type="button"
                onClick={openConsultation}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Free Consultation</span>
              </button>
            </div>
          </div>

        </div>

        {/* Return to Home link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader/80 hover:text-nexgen-primaryGold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ComingSoonPage(props: ComingSoonPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nexgen-pageLightBg" />}>
      <ComingSoonContent {...props} />
    </Suspense>
  );
}

