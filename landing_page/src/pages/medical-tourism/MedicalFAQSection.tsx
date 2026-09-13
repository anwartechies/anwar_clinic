"use client";

import React, { useState } from "react";
import { ChevronDown, Phone, Mail, CheckCircle2, Shield, Send } from "lucide-react";
import { COMPANY_NAME, CLINIC_PHONE, CLINIC_EMAIL } from "@/config/constants";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Is having a hair transplant in India safe for international patients?",
    answer:
      `Yes, absolutely. India is a leading global medical tourism destination. At ${COMPANY_NAME}, all procedures are conducted by board-certified doctors in ultra-sterile, HEPA-filtered operating theaters adhering strictly to international sterility and safety protocols.`,
  },
  {
    question: "How many days do I need to stay in India for the entire procedure?",
    answer:
      "An average international patient stay is 5 to 7 days. Day 1: Arrival & in-person consultation; Day 2: Procedure; Day 3-4: Rest & local clinic wash; Day 5: Final doctor assessment and clearance for comfortable return flight.",
  },
  {
    question: "Will my results look natural and match my ethnic hair type?",
    answer:
      `Yes. ${COMPANY_NAME} specializes in customized hairline architecture tailored to all ethnicities — including Caucasian, Asian, Afro, and Middle Eastern hair types. We replicate natural hair exit angles, swirls, and feathering for an undetectable look.`,
  },
  {
    question: "How much does a hair transplant cost for foreigners and NRIs?",
    answer:
      "The average all-inclusive package ranges from $800 to $3,500 depending on graft requirement (typically 2,000 to 5,500+ grafts). This represents an immediate 70% to 80% cost savings compared to the US, UK, Canada, or Australia.",
  },
  {
    question: `How does ${COMPANY_NAME} assist with Medical Visas and Airport Logistics?`,
    answer:
      "Our international desk provides official Hospital Visa Invitation letters for rapid e-Medical Visa processing. Upon arrival at Delhi International Airport (DEL), our private chauffeur greets you and transfers you directly to your accommodation.",
  },
  {
    question: "What post-operative care is provided after I return home?",
    answer:
      "You will receive a complete medical aftercare kit, specialized shampoo, and direct access to your surgical team for 12 months. We conduct milestone video reviews at 1, 3, 6, 9, and 12 months to monitor your full growth progress.",
  },
];

const COUNTRY_CODES = [
  { code: "+91", label: "+91 🇮🇳 India" },
  { code: "+1", label: "+1 🇺🇸 USA / 🇨🇦 Canada" },
  { code: "+44", label: "+44 🇬🇧 United Kingdom" },
  { code: "+971", label: "+971 🇦🇪 UAE" },
  { code: "+61", label: "+61 🇦🇺 Australia" },
  { code: "+49", label: "+49 🇩🇪 Germany" },
  { code: "+33", label: "+33 🇫🇷 France" },
  { code: "+65", label: "+65 🇸🇬 Singapore" },
  { code: "+966", label: "+966 🇸🇦 Saudi Arabia" },
  { code: "+27", label: "+27 🇿🇦 South Africa" },
  { code: "+64", label: "+64 🇳🇿 New Zealand" },
];

export default function MedicalFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+1",
    phone: "",
    email: "",
    city: "",
    whatsappOptIn: true,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <section className="py-20 lg:py-24 bg-white overflow-hidden">
      <div className="qht-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: FAQ Accordion */}
          <div className="lg:col-span-7">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#1b392b]/10 text-[#1b392b] text-xs font-bold tracking-wider uppercase mb-3">
              Help Center
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[600] text-[#162418] tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Have questions regarding travel, safety, or package details? Reach us at:</span>
              <a href={`mailto:${CLINIC_EMAIL}`} className="text-[#1b392b] font-semibold underline inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{CLINIC_EMAIL}</span>
              </a>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <a href={`tel:${CLINIC_PHONE}`} className="text-[#1b392b] font-semibold underline inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{CLINIC_PHONE}</span>
              </a>
            </p>

            {/* Accordions */}
            <div className="mt-8 space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 bg-[#f8faf8]"
                  >
                    <button
                      onClick={() => toggleFAQ(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#162418] hover:text-[#1b392b] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#1b392b]/10 text-[#1b392b] text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <span>{faq.question}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? "rotate-180 text-[#1b392b]" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: International Lead Form */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-[#1b392b] to-[#12241b] rounded-3xl p-7 sm:p-9 text-white shadow-2xl border border-[#284c3b] relative">
              <div className="flex items-center gap-2 text-[#b1fc85] text-xs font-bold uppercase tracking-wider mb-2">
                <Shield className="w-4 h-4" />
                <span>100% Confidential Assessment</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Book a Consultation Today
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 mb-6">
                Receive an initial graft estimate, travel itinerary, and medical visa guide.
              </p>

              {isSubmitted ? (
                <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
                  <CheckCircle2 className="w-12 h-12 text-[#b1fc85] mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white">Consultation Request Sent!</h4>
                  <p className="text-xs text-gray-200 mt-2">
                    Our Senior International Patient Coordinator will contact you via WhatsApp / Email within 2 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-5 text-xs text-[#b1fc85] underline font-semibold"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-200 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Miller"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#b1fc85] transition-colors"
                    />
                  </div>

                  {/* Phone with Country Code */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-200 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        className="bg-white/15 border border-white/20 rounded-xl px-3 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#b1fc85] transition-colors max-w-[130px]"
                      >
                        {COUNTRY_CODES.map((c, i) => (
                          <option key={i} value={c.code} className="text-black">
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="Mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#b1fc85] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-200 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#b1fc85] transition-colors"
                    />
                  </div>

                  {/* City & Country */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-200 mb-1">
                      City & Country *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. London, United Kingdom"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#b1fc85] transition-colors"
                    />
                  </div>

                  {/* WhatsApp Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.whatsappOptIn}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsappOptIn: e.target.checked })
                        }
                        className="rounded accent-[#b1fc85]"
                      />
                      <span>Opt-in for immediate WhatsApp quote updates</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 py-3.5 rounded-full bg-[#b1fc85] text-[#162418] font-bold text-sm hover:bg-white transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <span>Schedule Free Consultation</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-400 text-center pt-2">
                    Protected by {COMPANY_NAME} Privacy Policy. No spam guaranteed.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
