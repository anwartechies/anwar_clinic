"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Gift,
  MessageCircle,
  Phone,
  Home,
  ArrowRight,
  PhoneCall,
  Tag,
  CalendarCheck,
} from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";
import { COMPANY_NAME, CLINIC_PHONE } from "@/config/constants";
import type { OfferBannerConfig } from "@/config/offer";

interface OfferPageClientProps {
  offer: OfferBannerConfig;
  /** True only after a successful claim from the modal. */
  claimed: boolean;
}

export default function OfferPageClient({ offer, claimed }: OfferPageClientProps) {
  const { claimOffer } = useConsultation();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const code = offer.couponCode;
  const perks = offer.perks?.length ? offer.perks : offer.highlightText ? [offer.highlightText] : [];

  // Built from the clinic's real phone rather than NEXT_PUBLIC_WHATSAPP_NUMBER,
  // which is still a placeholder.
  const phoneDigits = CLINIC_PHONE.replace(/\D/g, "");
  const whatsappText = `Hi ${COMPANY_NAME} Clinic, I'd like to redeem the website offer${code ? ` with code ${code}` : ""}${offer.highlightText ? `: ${offer.highlightText}` : ""}.`;
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(whatsappText)}`;

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 2000);
  };

  const steps = [
    claimed
      ? { icon: PhoneCall, title: "Expect our call", desc: "Our medical coordinator will contact you shortly to confirm your consultation." }
      : { icon: Gift, title: "Claim the offer", desc: "Share your name and number — it takes less than a minute." },
    ...(code
      ? [{ icon: Tag, title: "Share your code", desc: `Mention ${code} when you book so the offer is applied.` }]
      : []),
    { icon: CalendarCheck, title: "Book this month", desc: "The offer applies to hair transplants booked this month." },
  ];

  return (
    <div className="min-h-screen bg-[#eff5f1] text-[#1b221d] pt-28 sm:pt-36 lg:pt-40 pb-16">
      <div className="qht-large-container">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-12 lg:p-16 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#b1fc85]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#52664d]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative text-center">
            {claimed ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#15803d] text-xs font-bold uppercase tracking-wider mb-6">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Offer Reserved</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#52664d]/10 border border-[#52664d]/20 text-[#52664d] text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{offer.badge ?? "Special Offer"}</span>
              </div>
            )}

            {claimed ? (
              <>
                <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.15] max-w-2xl mx-auto">
                  Your offer is <span className="text-[#52664d]">reserved</span>
                </h1>
                <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5c685f] leading-relaxed max-w-xl mx-auto">
                  Thank you! Our medical coordinator will call you shortly to confirm your consultation. Keep your code handy — you&apos;ll need it when you book.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-5xl lg:text-[48px] font-bold tracking-tight leading-[1.15] max-w-3xl mx-auto">
                  {offer.title}{" "}
                  {offer.highlightText && <span className="text-[#52664d]">{offer.highlightText}</span>}
                </h1>
                <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5c685f] leading-relaxed max-w-xl mx-auto">
                  Claim it in under a minute and our team will reserve it for your {COMPANY_NAME} consultation.
                </p>
              </>
            )}
          </div>

          {/* Coupon */}
          {code && (
            <div className="relative mt-8 sm:mt-10 max-w-md mx-auto rounded-2xl bg-gradient-to-r from-[#142017] via-[#243527] to-[#142017] p-5 sm:p-6 text-center text-white shadow-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Your offer code</p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="rounded-lg border border-dashed border-white/35 bg-black/30 px-5 py-2 font-mono text-2xl sm:text-3xl font-bold tracking-[0.18em] text-[#bbf786]">
                  {code}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#bbf786] px-4 py-2 text-xs font-bold text-[#17241a] transition-all hover:bg-[#a6ea6e] active:scale-95 cursor-pointer"
                >
                  {copyState === "copied" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copyState === "copied" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="mt-3 text-xs text-white/70" aria-live="polite">
                {copyState === "failed"
                  ? `Couldn't copy automatically — your code is ${code}.`
                  : "Mention this code when you book your hair transplant."}
              </p>
            </div>
          )}

          {/* What's included */}
          {perks.length > 0 && (
            <div className="relative mt-10 sm:mt-12">
              <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">What&apos;s included</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {perks.map((perk) => (
                  <div key={perk} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#eff5f1]/60 p-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-[#52664d] shadow-xs">
                      <Gift className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-bold">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to redeem */}
          <div className="relative mt-10 sm:mt-12">
            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">How to redeem</h2>
            <ol className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps.map(({ icon: Icon, title, desc }, i) => (
                <li key={title} className="rounded-2xl border border-gray-100 bg-white p-5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#52664d] text-xs font-bold text-white">{i + 1}</span>
                    <Icon className="w-4 h-4 text-[#52664d]" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs text-[#5c685f]">{desc}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="relative mt-10 sm:mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold">
                {claimed ? "Want to talk sooner?" : "Ready to reserve it?"}
              </h3>
              <p className="text-xs text-[#5c685f]">
                {claimed ? "Message or call us and quote your code." : "Claim now, or reach our team directly."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#52664d] text-[#52664d] hover:bg-[#52664d] hover:text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Us</span>
              </a>
              <a
                href={`tel:+${phoneDigits}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#52664d] text-[#52664d] hover:bg-[#52664d] hover:text-white text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{CLINIC_PHONE}</span>
              </a>
              {!claimed && (
                <button
                  type="button"
                  onClick={claimOffer}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#52664d] hover:bg-[#43543e] text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>Claim this offer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-[#52664d]">
          <Link href="/" className="inline-flex items-center gap-2 hover:text-[#3f4f3b] transition-colors">
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link href="/hair-transplant-cost-in-india" className="inline-flex items-center gap-2 hover:text-[#3f4f3b] transition-colors">
            <span>See hair transplant cost</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
