"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Database,
  ExternalLink,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { COMPANY_NAME, CLINIC_PHONE, CLINIC_EMAIL } from "@/config/constants";
import { useConsultation } from "@/context/ConsultationContext";

interface SectionLink {
  id: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: SectionLink[] = [
  { id: "information-collection", title: "Information Collection", icon: Database },
  { id: "use-of-information", title: "Use of Information", icon: FileText },
  { id: "security-measures", title: "Security Measures", icon: Lock },
  { id: "data-sharing", title: "Data Sharing", icon: UserCheck },
  { id: "data-retention", title: "Data Retention", icon: Clock },
  { id: "patient-rights", title: "Patient Rights", icon: ShieldCheck },
  { id: "cookies-policy", title: "Cookies & Tracking", icon: RefreshCw },
  { id: "policy-changes", title: "Policy Changes", icon: AlertCircle },
  { id: "contact-us", title: "Contact Us & Redressal", icon: Mail },
];

export default function PrivacyPolicyPage() {
  const { openConsultation } = useConsultation();
  const [activeSection, setActiveSection] = useState<string>("information-collection");

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
                Privacy Policy
              </li>
            </ol>
          </nav>

          {/* Main Headline (Rephrased from QHT) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-5 text-white">
            We don’t <span className="text-nexgen-brightGold underline decoration-nexgen-brightGold/40 underline-offset-8">just do transplants</span>,
            <br className="hidden sm:inline" /> we stay with you after.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Your hair transformation journey at {COMPANY_NAME} Clinic does not end with your surgical procedure. We extend continuous care and support through our structured one-year follow-up program — anchored in rigorous data protection and patient confidentiality.
          </p>

          {/* Governance Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-gray-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-nexgen-brightGold" />
              256-Bit SSL/TLS Encrypted
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
              <Lock className="w-4 h-4 text-nexgen-brightGold" />
              PCI-DSS Compliant Payments
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
              <Clock className="w-4 h-4 text-nexgen-brightGold" />
              Last Revised: February 2026
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
              Quick Jump:
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
                  <ShieldCheck className="w-5 h-5 text-nexgen-primaryGold" />
                  <h3 className="font-bold text-nexgen-veryDarkHeader text-base">
                    Policy Directory
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
                          0{idx + 1}
                        </span>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isCurrent ? "text-nexgen-brightGold" : "text-gray-400"}`} />
                        <span className="truncate">{sec.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Consultation Assistance Box */}
              <div className="bg-gradient-to-br from-nexgen-mainDarkBg to-nexgen-veryDarkHeader text-white rounded-3xl p-5 border border-nexgen-primaryGold/30 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 text-nexgen-brightGold">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">
                  Strict Confidentiality
                </h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Your hair assessment photos and medical information are never made public or published without express written consent.
                </p>
                <button
                  onClick={openConsultation}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader font-bold text-xs transition-colors cursor-pointer text-center block"
                >
                  Book Confidential Consultation
                </button>
              </div>
            </aside>

            {/* ----------------------------------------------------
                RIGHT COLUMN: DETAILED LEGAL & CLINICAL ARTICLES
               ---------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Executive Commitment Statement */}
              <div className="bg-nexgen-pageLightBg rounded-2xl p-6 sm:p-7 border-l-4 border-nexgen-primaryGold shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-nexgen-primaryGold/15 flex items-center justify-center flex-shrink-0 text-nexgen-veryDarkHeader mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-nexgen-veryDarkHeader">
                      Our Privacy & Patient Trust Commitment
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                      At <strong>{COMPANY_NAME} Clinic</strong>, we are committed to protecting the privacy and security of our patients’ personal, clinical, and financial information. This privacy policy outlines how we handle, protect, and process your personal and payment details when you browse our website, schedule consultations, make payments, and undergo hair restoration procedures.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Information Collection */}
              <article id="information-collection" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Information Collection
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  To provide accurate trichological consultations, safe surgical procedures, and seamless payment processing, we collect the following personal and payment information from our patients:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Item 1 */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-nexgen-primaryGold/50 transition-colors shadow-2xs">
                    <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm text-nexgen-veryDarkHeader mb-2">
                      <CreditCard className="w-4 h-4 text-nexgen-primaryGold" />
                      <span>Payment & Billing Details</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Payment method details (credit/debit card, UPI, net banking)</li>
                      <li>Transaction reference IDs and digital receipts</li>
                      <li>Billing address and GST invoicing information</li>
                      <li>Bank account details (account number, IFSC code) for verified refunds</li>
                    </ul>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-nexgen-primaryGold/50 transition-colors shadow-2xs">
                    <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm text-nexgen-veryDarkHeader mb-2">
                      <UserCheck className="w-4 h-4 text-nexgen-primaryGold" />
                      <span>Contact & Identity Data</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Full legal name, age, and gender</li>
                      <li>Verified phone number and WhatsApp contact</li>
                      <li>Email address for consultation and post-op care reports</li>
                      <li>City, state, and country of residence</li>
                    </ul>
                  </div>

                  {/* Item 3 */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-nexgen-primaryGold/50 transition-colors shadow-2xs">
                    <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm text-nexgen-veryDarkHeader mb-2">
                      <FileText className="w-4 h-4 text-nexgen-primaryGold" />
                      <span>Clinical Assessment Data</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>Scalp photos submitted for Norwood baldness analysis</li>
                      <li>Past hair restoration history and medical evaluations</li>
                      <li>Allergy disclosures and health conditions for surgical clearance</li>
                      <li>Estimated graft count and personalized surgical blueprint</li>
                    </ul>
                  </div>

                  {/* Item 4 */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-nexgen-primaryGold/50 transition-colors shadow-2xs">
                    <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm text-nexgen-veryDarkHeader mb-2">
                      <Database className="w-4 h-4 text-nexgen-primaryGold" />
                      <span>Technical & Device Data</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                      <li>IP address, browser type, and operating system</li>
                      <li>Referral URLs and digital interaction telemetry</li>
                      <li>Website preference cookies and session identifiers</li>
                      <li>Inquiry channel timestamps (WhatsApp, forms, phone calls)</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>PCI-DSS Payment Guarantee:</strong> We partner strictly with RBI-authorized payment aggregators (such as Razorpay). Sensitive card verification values (CVV) and banking passwords are never stored on {COMPANY_NAME} Clinic servers.
                  </p>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 2. Use of Information */}
              <article id="use-of-information" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Use of Information
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  We use the personal and payment information collected from our patients exclusively for legitimate clinical and operational purposes:
                </p>

                <div className="space-y-3">
                  {[
                    {
                      title: "Process payments for treatments and surgical services",
                      desc: "Verifying advance surgery reservations, stage-wise procedure billing, and issuing official GST invoices.",
                    },
                    {
                      title: "Send payment confirmations, receipts, and clinical schedules",
                      desc: "Instant digital receipts dispatched to your registered email and mobile number for transparent accounting.",
                    },
                    {
                      title: "Deliver surgeon-led consultation and treatment planning",
                      desc: "Evaluating hair loss grade, calculating viable donor graft density, and creating customized hair restoration plans.",
                    },
                    {
                      title: "Coordinate the 1-Year Comprehensive Follow-Up Program",
                      desc: "Scheduled post-operative milestone check-ins (14 days, 3 months, 6 months, 9 months, and 12 months) to ensure optimal graft growth.",
                    },
                    {
                      title: "Contact patients for treatment-related updates & queries",
                      desc: "Pre-procedure guidelines, medication reminders, and swift answers to post-transplant recovery questions.",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-xl border border-gray-100 bg-nexgen-pageLightBg/60 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 3. Security Measures */}
              <article id="security-measures" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Security Measures
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  We employ rigorous technical, administrative, and physical safeguards to protect our patients’ medical and payment records from unauthorized access, alteration, or disclosure:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-nexgen-primaryGold/15 text-nexgen-veryDarkHeader flex items-center justify-center mb-2.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-nexgen-veryDarkHeader">
                      End-to-End Encryption
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      We use industry-standard 256-bit SSL/TLS encryption across all online interactions, ensuring all transmitted patient and financial data remains unreadable in transit.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-nexgen-primaryGold/15 text-nexgen-veryDarkHeader flex items-center justify-center mb-2.5">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-nexgen-veryDarkHeader">
                      Secure Payment Gateway
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      All online card and banking transactions are processed through certified, PCI-DSS Level 1 compliant payment gateways backed by two-factor authentication (2FA).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-nexgen-primaryGold/15 text-nexgen-veryDarkHeader flex items-center justify-center mb-2.5">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-nexgen-veryDarkHeader">
                      Strict Access Control
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Access to patient case sheets, scalp photos, and billing details is strictly restricted to authorized medical and administrative personnel bound by Non-Disclosure Agreements.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-nexgen-primaryGold/15 text-nexgen-veryDarkHeader flex items-center justify-center mb-2.5">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-nexgen-veryDarkHeader">
                      Regular Security Audits
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      We conduct continuous vulnerability assessments, server penetration tests, and database backup audits to verify the ongoing resilience of our clinical IT systems.
                    </p>
                  </div>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 4. Data Sharing */}
              <article id="data-sharing" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Data Sharing & Third Parties
                  </h2>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm mb-4">
                  <strong>Zero-Commercial-Sale Guarantee:</strong> We do not sell, rent, monetize, or trade our patients’ personal, clinical, or payment information with any third-party marketing brokers or advertising networks.
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                  We disclose patient and transaction information only under the following limited circumstances:
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span><strong>Payment Gateway Providers:</strong> To process authorized payment transactions, verify fraud-prevention signals, and disburse refunds.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span><strong>Banking Partners:</strong> To reconcile transaction settlements, confirm account details, and settle banking dispute inquiries.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span><strong>Accredited Diagnostic Laboratories:</strong> When pre-surgical blood investigations (e.g., CBC, viral markers, coagulation profiles) are processed for your medical safety.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexgen-primaryGold mt-2 flex-shrink-0" />
                    <span><strong>Regulatory & Legal Authorities:</strong> If strictly required by judicial court orders, public health mandates, or governing medical council regulations under applicable Indian law.</span>
                  </li>
                </ul>
              </article>

              <hr className="border-gray-200" />

              {/* 5. Data Retention */}
              <article id="data-retention" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    05
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Data Retention Policy
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                  We retain patient records only for as long as necessary to fulfill the purposes for which they were gathered:
                </p>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white">
                    <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                      Payment & Transaction Verification
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      We retain our patients’ payment verification details for a period of <strong>6 months</strong> from the date of payment for financial reconciliation and billing verification. After this period, temporary payment identifiers are safely deleted from our active operational systems.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white">
                    <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                      Clinical Treatment Records
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Surgical operative notes, graft placement maps, and one-year recovery progression logs are archived in compliance with medical council guidelines to support your long-term trichological health.
                    </p>
                  </div>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 6. Patient Rights */}
              <article id="patient-rights" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    06
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Patient Rights & Privacy Choices
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  Under applicable data protection laws and clinical privacy principles, our patients have full autonomy over their information:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-nexgen-pageLightBg/50 flex items-start gap-3">
                    <Eye className="w-4 h-4 text-nexgen-primaryGold flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                        Right to Access
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Request a verified digital copy of your personal, medical, and payment records.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-nexgen-pageLightBg/50 flex items-start gap-3">
                    <RefreshCw className="w-4 h-4 text-nexgen-primaryGold flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                        Right to Correction
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Request prompt correction or updating of incomplete or outdated personal information.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-nexgen-pageLightBg/50 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-nexgen-primaryGold flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                        Right to Deletion
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Request deletion or anonymization of non-statutory records and marketing contact data.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-nexgen-pageLightBg/50 flex items-start gap-3">
                    <Lock className="w-4 h-4 text-nexgen-primaryGold flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                        Right to Object
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Object to the processing of your contact data for marketing or opt-out of promotional updates at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 7. Cookies & Tracking Technologies */}
              <article id="cookies-policy" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    07
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Cookies & Tracking Technologies
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                  Our website uses cookies and similar technologies to enhance browsing performance, remember user preferences, and analyze anonymized site traffic:
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>
                    <strong>• Essential Cookies:</strong> Necessary for core website functions, appointment scheduling, and secure consultation modal operations.
                  </p>
                  <p>
                    <strong>• Performance & Analytics Cookies:</strong> Helps us understand how visitors navigate our site, which hair restoration guides are most useful, and where page performance can be improved.
                  </p>
                  <p>
                    <strong>• Cookie Management:</strong> You can manage or disable cookies via your browser settings (Chrome, Safari, Firefox, or Edge). Note that disabling certain cookies may affect interactive features like consultation booking.
                  </p>
                </div>
              </article>

              <hr className="border-gray-200" />

              {/* 8. Changes to Privacy Policy */}
              <article id="policy-changes" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    08
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Changes to Privacy Policy
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We reserve the right to modify our privacy policy at any time to reflect advancements in clinical technology, legal requirements, or clinic practices. We will notify our patients of any material modifications by updating the revision timestamp and publishing the updated version directly on our website.
                </p>
              </article>

              <hr className="border-gray-200" />

              {/* 9. Contact Us */}
              <article id="contact-us" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-nexgen-veryDarkHeader text-nexgen-brightGold flex items-center justify-center font-bold text-sm">
                    09
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                    Contact Us & Privacy Grievance
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data handling, our patient care team and Grievance Officer are readily available:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                      Direct Email Support
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
                      Helpline & WhatsApp
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

                {/* Consent & Terms clause */}
                <div className="p-5 rounded-2xl bg-nexgen-pageLightBg border border-nexgen-primaryGold/30 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <p>
                    By using our website, submitting medical inquiry forms, or making payments for consultations and treatments, you consent to our Privacy Policy and agree to our{" "}
                    <Link
                      href="/terms-conditions"
                      className="text-nexgen-veryDarkHeader font-bold underline hover:text-nexgen-primaryGold transition-colors"
                    >
                      Terms and Conditions
                    </Link>
                    .
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
              World-Class Surgical Facilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-white mb-4">
              Explore More About {COMPANY_NAME} Clinic.
            </h2>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed mb-8">
              Step inside our surgical centers to discover ultra-sterile operation theaters, state-of-the-art trichology diagnostics, and modern suites designed for your comfort and absolute privacy.
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
