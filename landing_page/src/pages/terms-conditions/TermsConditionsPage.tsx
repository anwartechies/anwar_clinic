"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  RefreshCcw,
  AlertTriangle,
  Receipt,
  Globe2,
  FileCheck,
  Stethoscope,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Percent,
  Ban,
} from "lucide-react";
import { COMPANY_NAME, CLINIC_PHONE, CLINIC_EMAIL } from "@/config/constants";
import { useConsultation } from "@/context/ConsultationContext";

interface SectionLink {
  id: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: SectionLink[] = [
  { id: "booking-amount", title: "1. Booking & Reservation Fee", icon: CalendarCheck },
  { id: "payment-methods", title: "2. Payment Methods & EMI", icon: CreditCard },
  { id: "payment-timeline", title: "3. Payment Timeline", icon: Clock },
  { id: "refund-policy", title: "4. Refund Policy", icon: RefreshCcw },
  { id: "cancellation-policy", title: "5. Cancellation & Rescheduling", icon: Ban },
  { id: "gst-taxation", title: "6. GST & Tax Invoicing", icon: Receipt },
  { id: "foreign-exchange", title: "7. Foreign Exchange & Global Patients", icon: Globe2 },
  { id: "payment-confirmation", title: "8. Payment Confirmation", icon: FileCheck },
  { id: "medical-disclaimer", title: "9. Clinical & Outcome Disclaimer", icon: Stethoscope },
  { id: "price-validity", title: "10. Price Validity & Revisions", icon: Percent },
  { id: "grievance-contact", title: "11. Grievance & Contact Desk", icon: Mail },
];

export default function TermsConditionsPage() {
  const { openConsultation } = useConsultation();
  const [activeSection, setActiveSection] = useState<string>("booking-amount");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-800">
      {/* ========================================================
          1. HERO BANNER SECTION (Matching QHT Layout & Clinic Theme)
         ======================================================== */}
      <section
        className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 text-white overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(3, 42, 58, 0.92), rgba(3, 42, 58, 0.95)), url('https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/hp-bottom-banner-img-mtzluh7iln19oe.webp')",
        }}
      >
        {/* Ambient decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-nexgen-primaryGold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-5 sm:mb-6">
            <ol className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-300 font-medium bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15">
              <li>
                <Link
                  href="/"
                  className="hover:text-nexgen-brightGold transition-colors"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center text-gray-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="text-nexgen-brightGold font-semibold">
                Terms & Conditions
              </li>
            </ol>
          </nav>

          {/* Main Headline (Rephrased from QHT) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-5 text-white">
            Payment Terms &amp; Conditions <br className="hidden sm:inline" />
            of <span className="text-nexgen-brightGold underline decoration-nexgen-brightGold/40 underline-offset-8">{COMPANY_NAME} Clinic</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Your hair transformation journey at {COMPANY_NAME} Clinic does not end with your surgical procedure. We extend continuous care and support with our one-year follow-up program — framed by transparent pricing, fair booking protocols, and patient-first ethics.
          </p>

          {/* Governance Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-gray-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
              <Receipt className="w-4 h-4 text-nexgen-brightGold" />
              Transparent GST Invoicing
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-nexgen-brightGold" />
              Zero Hidden Charges
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
              <Clock className="w-4 h-4 text-nexgen-brightGold" />
              Effective Date: February 2026
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. QUICK JUMP PILLS (Horizontal Scroll on Mobile)
         ======================================================== */}
      <section className="bg-nexgen-pageLightBg border-y border-gray-200/80 sticky top-16 sm:top-20 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex-shrink-0 hidden md:inline-block mr-2">
              Sections:
            </span>
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isCurrent = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                    isCurrent
                      ? "bg-nexgen-mainDarkBg text-white shadow-sm border border-nexgen-primaryGold/40"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-nexgen-brightGold" : "text-gray-400"}`} />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          3. MAIN CONTENT: STICKY TOC SIDEBAR + POLICY SECTIONS
         ======================================================== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* ----------------------------------------------------
                LEFT COLUMN: STICKY TOC (Desktop)
               ---------------------------------------------------- */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-36 self-start space-y-6">
              <div className="bg-nexgen-pageLightBg rounded-3xl p-5 border border-gray-200 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <Receipt className="w-5 h-5 text-nexgen-primaryGold" />
                  <h3 className="font-bold text-nexgen-veryDarkHeader text-base">
                    Terms Navigation
                  </h3>
                </div>
                <nav className="flex flex-col space-y-1">
                  {SECTIONS.map((sec, idx) => {
                    const Icon = sec.icon;
                    const isCurrent = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-nexgen-mainDarkBg text-white shadow-sm font-semibold border-l-4 border-l-nexgen-brightGold"
                            : "text-gray-600 hover:bg-white hover:text-nexgen-veryDarkHeader"
                        }`}
                      >
                        <span className="text-[11px] opacity-60 w-4 font-mono">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isCurrent ? "text-nexgen-brightGold" : "text-gray-400"}`} />
                        <span className="truncate">{sec.title.replace(/^\d+\.\s*/, "")}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Consultation Assistance Box */}
              <div className="bg-gradient-to-br from-nexgen-mainDarkBg to-nexgen-veryDarkHeader text-white rounded-3xl p-5 border border-nexgen-primaryGold/30 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 text-nexgen-brightGold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">
                  Transparent Per-Graft Pricing
                </h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  We maintain zero hidden surgical, disposable, or post-operative consultation charges.
                </p>
                <button
                  onClick={openConsultation}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader font-bold text-xs transition-colors cursor-pointer text-center block"
                >
                  Request Detailed Cost Estimate
                </button>
              </div>
            </aside>

            {/* ----------------------------------------------------
                RIGHT COLUMN: DETAILED TERMS ARTICLES
               ---------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-12">

              {/* Introductory Lead Box */}
              <div className="bg-nexgen-pageLightBg rounded-2xl p-6 sm:p-7 border-l-4 border-nexgen-primaryGold shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-nexgen-primaryGold/15 flex items-center justify-center flex-shrink-0 text-nexgen-veryDarkHeader mt-0.5">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-nexgen-veryDarkHeader">
                      Fair Financial Terms &amp; Medical Protocol Commitment
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                      At <strong>{COMPANY_NAME} Clinic</strong>, we believe that world-class hair restoration must be built upon clinical excellence, complete financial clarity, and mutual trust. These Terms and Conditions govern booking deposits, procedure schedules, payment settlements, cancellation, and refund policies across all our branches and digital channels.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Booking Amount */}
              <article id="booking-amount" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Booking Amount &amp; Slot Reservation
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  To confirm your surgical theater date, sterilize specialized micro-surgical instruments, and reserve our senior surgical team, an advance booking token is required:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-nexgen-primaryGold/50 transition-colors shadow-2xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-nexgen-primaryGold block mb-1">
                      Indian Nationals
                    </span>
                    <div className="text-2xl font-bold text-nexgen-veryDarkHeader mb-1">
                      ₹ 3,000 <span className="text-xs text-gray-500 font-normal">+ 18% GST (₹ 540)</span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-700 mb-2">
                      Total: ₹ 3,540
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      This token reserves your operation theater slot and is <strong>fully adjusted</strong> against the total surgical procedure cost on the day of treatment.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-nexgen-primaryGold/50 transition-colors shadow-2xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-nexgen-primaryGold block mb-1">
                      Foreign &amp; International Nationals
                    </span>
                    <div className="text-2xl font-bold text-nexgen-veryDarkHeader mb-1">
                      $100 USD <span className="text-xs text-gray-500 font-normal">(Approx. ₹ 7,000 – ₹ 8,300)</span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-700 mb-2">
                      International Medical Traveler Deposit
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Secures international concierge support, airport pick-up coordination, theater slot reservation, and is 100% credited toward your surgical balance.
                    </p>
                  </div>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 2. Payment Method */}
              <article id="payment-methods" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Accepted Payment Methods &amp; Financing
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  We support multiple secure, verified payment channels for patient convenience:
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-gray-100 bg-nexgen-pageLightBg/60 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                        Domestic Payments (India)
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Payments can be made via UPI (Google Pay, PhonePe, Paytm), Credit &amp; Debit Cards (Visa, MasterCard, RuPay), Net Banking, NEFT/RTGS, or Cash (within limits prescribed by Income Tax regulations).
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-100 bg-nexgen-pageLightBg/60 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                        International Payments
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        For foreign nationals and NRI patients, payments can be made through international credit/debit cards, bank wire transfers (SWIFT), or authorized online gateway links in USD, EUR, or GBP.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-100 bg-nexgen-pageLightBg/60 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                        0% Interest EMI Options
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Flexible monthly installment plans are available through our verified medical financing partners, subject to document verification and credit eligibility.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 3. Payment Timeline */}
              <article id="payment-timeline" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Payment Timeline &amp; Milestone Schedule
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-nexgen-primaryGold font-bold text-xs uppercase mb-2">
                      <Clock className="w-4 h-4" />
                      <span>Step 1: Appointment Booking</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                      The slot booking amount (₹ 3,540 for Indian nationals or $100 USD for foreign nationals) must be paid at the time of confirming your appointment and surgical theater reservation.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Step 2: Day of Treatment</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                      The remaining balance payment for the hair transplant procedure must be completed on the morning of the treatment day, after final hairline design confirmation and before surgical theater admission.
                    </p>
                  </div>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 4. Refund Policy */}
              <article id="refund-policy" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Refund Policy
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  Refunds are governed strictly under the following transparent parameters:
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader mb-1">
                      Booking Amount Refunds
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Refund of the booking token is made strictly in accordance with our cancellation timeline. If the treatment is cancelled by {COMPANY_NAME} Clinic due to unforeseen clinical reasons or equipment recalibration, <strong>100% of the booking amount will be promptly refunded</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader mb-1">
                      Balance Payment Refunds
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Refund of the balance procedure payment is made only in the event of a cancellation or discontinuation of treatment initiated by {COMPANY_NAME} Clinic. Once surgical follicle harvesting has commenced, surgical costs are non-refundable.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader mb-1">
                      Medical Contraindication Exceptions
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      If pre-operative bloodwork reveals an unexpected medical contraindication (e.g., active scalp infection, acute uncontrolled hypertension, bleeding coagulopathies) that makes immediate surgery unsafe, the booking deposit is either held as a credit for future rescheduling or refunded minus administrative lab processing fees.
                    </p>
                  </div>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 5. Cancellation Policy */}
              <article id="cancellation-policy" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    05
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Cancellation &amp; Rescheduling Policy
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase mb-2">
                      <Ban className="w-4 h-4" />
                      <span>Patient Cancellation</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      If the patient cancels the procedure voluntarily without rescheduling at least 72 hours prior to the date, the booking amount is forfeited to cover reserved theater sterilization, disposables, and surgical team downtime.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Clinic Cancellation</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      If {COMPANY_NAME} Clinic must cancel or postpone the scheduled surgical session due to unavoidable clinical emergencies, the entire booking amount will be refunded within 5–7 business days, or rescheduled with priority VIP scheduling.
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Rescheduling Grace:</strong> Patients may reschedule their surgery date once free of charge by providing at least <strong>72 hours written notice</strong> before the scheduled date.
                  </p>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 6. GST */}
              <article id="gst-taxation" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    06
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Goods &amp; Services Tax (GST) &amp; Invoicing
                  </h2>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span>Goods and Services Tax (GST) will be charged in strict compliance with the prevailing Government of India statutory rates (currently 18% where applicable).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span>The exact GST component is clearly itemized separately on the pro-forma quote and the final tax invoice.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span>Corporate patients or GST registered individuals must furnish their valid GSTIN number during pre-procedure registration for input tax credit claims.</span>
                  </li>
                </ul>
              </article>

              <hr className="border-gray-200" />

              {/* 7. Foreign Exchange */}
              <article id="foreign-exchange" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    07
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Foreign Exchange &amp; International Patients
                  </h2>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span>For international patients, procedure costs and token payments can be remitted in USD, EUR, or GBP.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span>Foreign currency exchange conversions are calculated based on the prevailing bank conversion rate on the transaction date.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span>Any third-party international intermediary bank transfer fees or credit card foreign markup charges are the responsibility of the remitting patient.</span>
                  </li>
                </ul>
              </article>

              <hr className="border-gray-200" />

              {/* 8. Payment Confirmation */}
              <article id="payment-confirmation" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    08
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Payment Confirmation &amp; Receipting
                  </h2>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>
                    • Official payment confirmation with a unique <strong>Transaction Reference &amp; Patient Case ID</strong> will be dispatched to your registered email and mobile number immediately upon settlement.
                  </p>
                  <p>
                    • Patients must present their digital payment confirmation or receipt to the clinical reception team at the time of procedure check-in.
                  </p>
                  <p>
                    • Duplicate tax invoices may be requested at any time from our billing desk by quoting your registered Patient ID.
                  </p>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 9. Medical & Outcome Disclaimer */}
              <article id="medical-disclaimer" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    09
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Clinical &amp; Hair Growth Outcome Disclaimer
                  </h2>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>
                    • <strong>Biological Individuality:</strong> Hair restoration is a medical microsurgical procedure. While {COMPANY_NAME} Clinic implements advanced surgical protocols ensuring follicle survival rates exceeding 95%, individual hair growth speeds, density response, and hair caliber vary depending on personal genetics, physiology, scalp health, and lifestyle.
                  </p>
                  <p>
                    • <strong>Timeline to Final Results:</strong> Newly transplanted follicles undergo a natural shedding phase between weeks 3 and 8 before new permanent hair begins sprouting around month 3 to 4. Full cosmetic density and maturation typically peak between 9 to 12 months post-procedure.
                  </p>
                  <p>
                    • <strong>Post-Op Compliance:</strong> Patient adherence to prescribed medications, washing instructions, avoiding vigorous friction, and attending milestone follow-up evaluations is imperative for optimal graft survival.
                  </p>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 10. Price Validity & Revisions */}
              <article id="price-validity" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    10
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Price Validity &amp; Policy Revisions
                  </h2>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>
                    • Written cost estimates provided during consultation are valid for <strong>30 days</strong> from the evaluation date.
                  </p>
                  <p>
                    • Prices are subject to adjustment without prior notice based on evolving surgical instrumentation costs and clinical infrastructure standards.
                  </p>
                  <p>
                    • {COMPANY_NAME} Clinic reserves the right to modify these terms and conditions. Updated versions published on our website shall supersede prior revisions.
                  </p>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 11. Contact Us */}
              <article id="grievance-contact" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    11
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Billing Queries &amp; Grievance Redressal
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
                  If you have questions regarding payment terms, pro-forma invoices, or refund processing, our accounts desk is at your disposal:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                      Billing &amp; Invoicing Support
                    </span>
                    <a
                      href={`mailto:${CLINIC_EMAIL}`}
                      className="text-xs sm:text-sm font-bold text-nexgen-veryDarkHeader hover:text-nexgen-primaryGold flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-4 h-4 text-nexgen-primaryGold" />
                      <span>{CLINIC_EMAIL}</span>
                    </a>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                      Direct Helpline
                    </span>
                    <a
                      href={`tel:${CLINIC_PHONE}`}
                      className="text-xs sm:text-sm font-bold text-nexgen-veryDarkHeader hover:text-nexgen-primaryGold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-nexgen-primaryGold" />
                      <span>{CLINIC_PHONE}</span>
                    </a>
                  </div>
                </div>

                {/* Privacy Policy Cross Link */}
                <div className="p-5 rounded-2xl bg-nexgen-pageLightBg border border-nexgen-primaryGold/30 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <p>
                    Your clinical data and payment information are safeguarded in compliance with our data governance standards. Please review our{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-nexgen-veryDarkHeader font-bold underline hover:text-nexgen-primaryGold transition-colors"
                    >
                      Privacy Policy
                    </Link>{" "}
                    to understand how your personal and medical records are protected.
                  </p>
                </div>
              </article>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          4. BOTTOM BANNER SECTION (Matching QHT's "Explore More About QHT")
         ======================================================== */}
      <section
        className="py-16 sm:py-20 relative bg-cover bg-center text-white border-t border-nexgen-primaryGold/30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(3, 42, 58, 0.90), rgba(3, 42, 58, 0.94)), url('https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/clinic-with-doc-mtzjmlrtcqfokt.jpeg')",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-nexgen-brightGold text-xs font-bold uppercase tracking-wider mb-4 border border-white/15 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Transparent &amp; Surgeon-Led Care
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-white mb-4">
              Explore More About {COMPANY_NAME} Clinic.
            </h2>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed mb-8">
              Step inside our clinic gallery to discover ultra-sterile surgical theaters and modern recovery spaces designed for your comfort, privacy, and peace of mind.
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href="/about"
                className="px-6 py-3.5 rounded-full bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm transition-all shadow-md transform hover:scale-105"
              >
                About Us
              </Link>
              <Link
                href="/our-clinic"
                className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs sm:text-sm transition-all"
              >
                Our Clinic
              </Link>
              <button
                onClick={openConsultation}
                className="px-6 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-white border border-nexgen-primaryGold/50 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
