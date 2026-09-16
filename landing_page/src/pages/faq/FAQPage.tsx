"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Minus, HelpCircle } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";
import { useConsultation } from "@/context/ConsultationContext";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  faqs: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "hair-transplant-for-men",
    name: "Hair Transplant For Men",
    icon: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "WHAT IS A MALE HAIR TRANSPLANT?",
        a: "A male hair transplant is a procedure for men seeking to restore their hairline and cover the bald areas on the head. Hair transplant for men is a minimally invasive procedure, and the male hair transplant cost can be different from patient to patient depending upon the techniques and number of grafts used.",
      },
      {
        q: "SHOULD I DISCUSS MY HEALTH ISSUES WITH THE DOCTOR BEFORE THE HAIR RESTORATION PROCEDURE?",
        a: "Yes. Definitely. It’s highly recommended to discuss your health issues, like thyroid problems, diabetes, genetic issues, or any current medications like blood thinners, with your health professional, as it may help them to plan a customizable guideline for you to be followed both pre- and post-procedure.",
      },
      {
        q: "ARE YOU A SUITABLE CANDIDATE FOR A MALE HAIR TRANSPLANT?",
        a: "In order to be eligible for a male hair transplant, it’s advised to seek a doctor’s consultation. Male hair transplant requires scalp analysis and the extent of baldness. The procedure should be opted for if there’s a high-grade baldness observed.",
      },
      {
        q: "IS IT NECESSARY TO OPT FOR A GOOD CLINIC?",
        a: "Male hair transplant is an in-clinic procedure, and it is recommended to look for a reputable clinic. There are several clinics offering low-cost treatment for hair transplant surgery for men, but it’s strongly advised to opt for a reputable clinic offering natural results, as substandard options result in complications and might compromise safety.",
      },
      {
        q: "WILL I EXPERIENCE SEVERE PAIN THROUGHOUT THE PROCEDURE?",
        a: "No. The NexGen Hair Transplant technique is virtually painless under local anesthesia. Post-procedure, only minimal discomfort can be felt for a brief period.",
      },
      {
        q: "ARE THE RESULTS PERMANENT?",
        a: "Yes. The results are permanent and long-lasting, utilizing DHT-resistant follicles from your permanent donor zone.",
      },
    ],
  },
  {
    id: "nexGen-hair-transplant",
    name: "NexGen Hair Transplant",
    icon: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "WHAT IS A NEXGEN HAIR TRANSPLANT?",
        a: "NexGen Hair Transplant uses an advanced modification of the traditional FUE technique. It minimizes out-of-body graft holding time to under 30 minutes, ensuring 95%+ follicle viability, faster healing, and denser results.",
      },
      {
        q: "IS NEXGEN HAIR TRANSPLANT PRESENT IN INDIA?",
        a: "With our main branch in Patna and second branch in Mumbai, NexGen Hair Transplant offers this unique hair technique for achieving quicker transplantation without compromising precision and safety protocols.",
      },
      {
        q: "IS NEXGEN HAIR TRANSPLANT AFFORDABLE?",
        a: "Since it’s an enhanced version of the FUE technique, the cost may vary, but it’s highly affordable and offers durable, long-lasting results. 0% EMI financing is also available for financial flexibility.",
      },
      {
        q: "IS THE NEXGEN HAIR TRANSPLANT TECHNIQUE PAINFUL?",
        a: "No. It is not painful. However, minimal discomfort is experienced post-procedure. The medical team provides full support, ensuring total patient comfort and safety.",
      },
      {
        q: "WILL I HAVE A SCAR AT THE SITE OF EXTRACTION?",
        a: "No. It’s a minimal-scar to non-visible scar procedure. With specialised micro-tools used, there’s minimal chance of scar visibility.",
      },
    ],
  },
  {
    id: "crown-hair-transplant",
    name: "Crown Hair Transplant",
    icon: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "HOW EFFECTIVE IS A CROWN HAIR TRANSPLANT?",
        a: "At NexGen Hair Transplant we perform crown hair transplants for natural, lasting regrowth. We achieve exceptional density in the crown area, which requires high surgical artistry to replicate the natural swirl pattern.",
      },
      {
        q: "WHICH TECHNIQUE IS BETTER FOR CROWN HAIR TRANSPLANT?",
        a: "The NexGen Hair Transplant FUE technique is best for natural spiral design, higher density, and faster recovery in crown hair transplants. Our specialised implanters amplify the angles ensuring high accuracy to recreate the natural crown whorl.",
      },
      {
        q: "HOW MUCH TIME DOES RECOVERY TAKE AFTER CROWN SURGERY?",
        a: "NexGen Hair Transplant ensures natural crown coverage with rapid 5–7 days of initial healing.",
      },
      {
        q: "ARE THE CROWN HAIR TRANSPLANT RESULTS PERMANENT?",
        a: "Yes. Crown hair transplants are permanent with appropriate medical maintenance, with NexGen Hair Transplant ensuring lifelong natural results.",
      },
      {
        q: "DOES A CROWN HAIR TRANSPLANT LEAVE SCARS AFTER SURGERY?",
        a: "The NexGen Hair Transplant technique gives natural crown results with minimal to non-visible micro-scars.",
      },
    ],
  },
  {
    id: "social-media-influencer-hair-transplant",
    name: "Social Media Influencer Hair Transplant",
    icon: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "IS SOCIAL MEDIA INFLUENCER HAIR TRANSPLANT PERMANENT?",
        a: "Yes, with its advanced technique, NexGen Hair Transplant gives prolonged natural results with high-definition density suitable for 4K cameras and public appearances.",
      },
      {
        q: "WHAT IS THE COST OF INFLUENCER HAIR TRANSPLANT IN INDIA?",
        a: "The cost depends upon the grafts and method chosen. At NexGen Hair Transplant, affordable expert care and VIP privacy are always prioritized.",
      },
      {
        q: "CAN INFLUENCERS STYLE HAIR AFTER A TRANSPLANT?",
        a: "Not immediately during the initial healing weeks, but after 3–4 months when new growth emerges, hair can be washed, blow-dried, and styled freely.",
      },
      {
        q: "ARE THERE ANY SIDE EFFECTS AFTER INFLUENCER HAIR TRANSPLANT?",
        a: "Mild redness and slight swelling may be observed for 2–3 days, which is effectively managed through our post-operative aftercare protocol.",
      },
      {
        q: "WHY DO INFLUENCERS CHOOSE NEXGEN HAIR TRANSPLANT?",
        a: "Because NexGen Hair Transplant provides natural, high-density, and long-lasting outcomes with minimum downtime and zero visible linear scarring.",
      },
    ],
  },
  {
    id: "hair-transplant-repair",
    name: "Hair Transplant Repair",
    icon: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "IS HAIR TRANSPLANT REPAIR PAINFUL?",
        a: "Corrective Hair Transplants are completely painless as they are performed under advanced local anesthesia by experienced surgeons.",
      },
      {
        q: "HOW LONG DOES HAIR TRANSPLANT REPAIR LAST?",
        a: "The results are permanent when performed by expert restorative surgeons at NexGen Hair Transplant.",
      },
      {
        q: "CAN FAILED HAIR TRANSPLANTS BE CORRECTED COMPLETELY?",
        a: "Yes. Most failed procedures (unnatural hair angles, pluggy doll-like hairlines, or depleted donor areas) can be successfully corrected at NexGen Hair Transplant.",
      },
      {
        q: "HOW IS NEXGEN HAIR TRANSPLANT BETTER FOR CORRECTIVE SURGERY?",
        a: "NexGen Hair Transplant has seasoned senior surgeons, custom micro-instruments, and higher graft survival rates for delicate revision surgeries.",
      },
    ],
  },
  {
    id: "hairline-reconstruction",
    name: "Hairline Reconstruction",
    icon: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "WHAT ARE THE COMMON CAUSES OF HAIRLINE PAIN AFTER RECONSTRUCTION?",
        a: "Mild inflammation, scalp tension, or temporary nerve sensitivity can cause minor discomfort, which usually subsides within 2–3 days with standard medication.",
      },
      {
        q: "WHAT IS THE SUCCESS RATE OF HAIRLINE RECONSTRUCTION?",
        a: "When performed with advanced techniques like those at NexGen Hair Transplant, graft retention and success rates consistently exceed 95%.",
      },
      {
        q: "WHAT ARE THE SIDE EFFECTS OF HAIRLINE RECONSTRUCTION?",
        a: "Temporary swelling, slight redness, or small scabbing may occur, but these resolve smoothly within 7–10 days with proper wash care.",
      },
      {
        q: "IS HAIRLINE RECONSTRUCTION PERMANENT?",
        a: "Yes. Transplanted hair follicles continue to grow naturally for a lifetime.",
      },
      {
        q: "WILL THE RECONSTRUCTED HAIRLINE LOOK NATURAL?",
        a: "Absolutely. The hairline architecture is customized using single-hair micro-feathering to match your age, facial bone structure, and natural swirl pattern.",
      },
    ],
  },
  {
    id: "fue-hair-transplant",
    name: "FUE Hair transplant",
    icon: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "IS FUE HAIR TRANSPLANT PAINFUL?",
        a: "No. At NexGen Hair Transplant, local anesthesia ensures the entire extraction and placement process is virtually pain-free.",
      },
      {
        q: "ARE THE RESULTS OF FUE HAIR TRANSPLANT PERMANENT?",
        a: "Yes. Implanted follicular units are harvested from DHT-resistant donor areas and remain permanent.",
      },
      {
        q: "HOW MUCH TIME DOES IT TAKE TO HEAL AFTER FUE HAIR TRANSPLANT?",
        a: "Most patients return to desk work within 2–3 days, with complete superficial healing in 7–10 days.",
      },
    ],
  },
  {
    id: "temple-hair-transplant",
    name: "Temple Hair Transplant",
    icon: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "WHAT IS THE BEST METHOD FOR TEMPLE HAIRLINE TRANSPLANT?",
        a: "The advanced NexGen Hair Transplant technique ensures acute natural angles, higher density, and fast recovery for the delicate temporal points.",
      },
      {
        q: "IS TEMPLE HAIR TRANSPLANT PERMANENT?",
        a: "Yes. Temple restoration provides lifelong natural facial balance and framing.",
      },
      {
        q: "CAN FAILED TEMPLE TRANSPLANTS BE CORRECTED AT NEXGEN HAIR TRANSPLANT?",
        a: "Yes. NexGen Hair Transplant offers specialized Temple Hair Correction to soften harsh angles and restore natural symmetry.",
      },
    ],
  },
];

export default function FAQPage() {
  const [activeCategoryId, setActiveCategoryId] = useState("hair-transplant-for-men");
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({
    "hair-transplant-for-men-0": true,
  });
  const { openConsultation } = useConsultation();

  // Scrollspy to automatically highlight the current active category in sticky sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const category of FAQ_CATEGORIES) {
        const element = document.getElementById(category.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategoryId(category.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  const toggleFaq = (key: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-white min-h-screen">

      {/* ========================================================
          HERO BANNER SECTION (Matching Screenshot)
         ======================================================== */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-16 bg-white text-center px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center">

          {/* Breadcrumb: Home > FAQ's */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-500 font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-nexgen-primaryGold transition-colors underline-offset-2 hover:underline"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center text-gray-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="text-nexgen-veryDarkHeader font-semibold">
                FAQ's
              </li>
            </ol>
          </nav>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-nexgen-veryDarkHeader tracking-tight leading-[1.15] mb-4">
            Frequently asked <br />
            questions.
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-xl font-normal leading-relaxed">
            Find answers to common queries about our services, pricing, booking process, and more — helping you make informed decisions.
          </p>

        </div>
      </section>

      {/* ========================================================
          MAIN CONTENT: STICKY SIDEBAR + ALL SECTIONS SCROLLED TOGETHER
         ======================================================== */}
      <section className="py-8 sm:py-12 pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start relative">

            {/* ========================================================
                LEFT COLUMN: STICKY CATEGORY NAV (Scrolled With Content)
               ======================================================== */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 z-20 self-start">
              <div className="bg-nexgen-pageLightBg rounded-3xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col divide-y divide-gray-200/60">
                  {FAQ_CATEGORIES.map((category) => {
                    const isActive = category.id === activeCategoryId;
                    return (
                      <button
                        key={category.id}
                        onClick={() => scrollToCategory(category.id)}
                        className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl text-left transition-all duration-300 cursor-pointer ${isActive
                          ? "bg-nexgen-mainDarkBg text-white shadow-lg my-1 scale-[1.02] border border-nexgen-primaryGold/30"
                          : "bg-transparent text-nexgen-veryDarkHeader hover:bg-white/60"
                          }`}
                      >
                        {/* Icon Thumbnail */}
                        <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs border border-black/10 bg-white">
                          <img
                            src={category.icon}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Name */}
                        <span
                          className={`text-xs sm:text-[14px] font-semibold tracking-tight leading-snug transition-colors ${isActive ? "text-white" : "text-nexgen-veryDarkHeader"
                            }`}
                        >
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN: ALL SECTIONS DISPLAYED SEQUENTIALLY
               ======================================================== */}
            <div className="lg:col-span-8 space-y-16 sm:space-y-20 pt-2">

              {/* Main Top Header */}
              <div className="pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-nexgen-veryDarkHeader tracking-tight leading-tight">
                  Looking for an answer on hair transplant ?
                </h2>
              </div>

              {/* Loop Over ALL 8 FAQ Sections */}
              {FAQ_CATEGORIES.map((category, catIndex) => (
                <div
                  key={category.id}
                  id={category.id}
                  className="scroll-mt-32 transition-all duration-500"
                >
                  {/* Category Title with Icon */}
                  <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs border border-gray-200/80 flex-shrink-0">
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                      {category.name}
                    </h3>
                  </div>

                  {/* Accordion List with Numbers (01, 02, ...) and Plus/Minus Icons */}
                  <div className="divide-y divide-gray-200/80">
                    {category.faqs.map((faq, idx) => {
                      const faqKey = `${category.id}-${idx}`;
                      const isOpen = !!openFaqs[faqKey];
                      const itemNumber = idx + 1 < 10 ? `0 ${idx + 1}` : `${idx + 1}`;

                      return (
                        <div
                          key={faqKey}
                          className="py-5 sm:py-6 transition-colors group"
                        >
                          {/* Question Button */}
                          <button
                            onClick={() => toggleFaq(faqKey)}
                            className="w-full flex items-start justify-between gap-4 text-left cursor-pointer focus:outline-none"
                          >
                            <div className="flex items-start gap-4 sm:gap-6 flex-1">
                              {/* Number: 01, 02, etc. */}
                              <span className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5 tracking-wider select-none flex-shrink-0">
                                {itemNumber}
                              </span>

                              {/* Question Text */}
                              <span
                                className={`text-xs sm:text-sm md:text-[14.5px] font-bold tracking-tight leading-relaxed transition-colors duration-200 ${isOpen
                                  ? "text-nexgen-primaryGold"
                                  : "text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold"
                                  }`}
                              >
                                {faq.q}
                              </span>
                            </div>

                            {/* Plus / Minus Expand Icon with Smooth Rotation */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-0.5 ${isOpen
                                ? "bg-nexgen-mainDarkBg text-nexgen-brightGold border border-nexgen-primaryGold/30 rotate-180"
                                : "text-gray-400 group-hover:text-nexgen-primaryGold group-hover:bg-nexgen-pageLightBg"
                                }`}
                            >
                              {isOpen ? (
                                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                              ) : (
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              )}
                            </div>
                          </button>

                          {/* Smooth Collapsible Answer with Slide & Fade Animation */}
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
                              }`}
                          >
                            <div className="overflow-hidden">
                              <div className="pl-10 sm:pl-12 pr-4 pb-1 text-xs sm:text-[13.5px] text-gray-600 font-normal leading-relaxed">
                                <p>{faq.a}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          BOTTOM "KNOW MORE ABOUT COSTING" BANNER
         ======================================================== */}
      <section className="bg-gradient-to-r from-nexgen-mainDarkBg via-nexgen-veryDarkHeader to-nexgen-mainDarkBg text-white py-10 sm:py-12 border-t border-nexgen-primaryGold/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
              <HelpCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Get Know More About {COMPANY_NAME} Costing
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 mt-0.5">
                Explore transparent per-graft pricing and all-inclusive packages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hair-transplant-cost-in-india/"
              className="px-6 py-3 rounded-full bg-nexgen-brightGold text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm hover:bg-white transition-all transform hover:scale-105 shadow-md whitespace-nowrap"
            >
              View Cost Guide
            </Link>
            <button
              onClick={openConsultation}
              className="px-6 py-3 rounded-full bg-transparent text-white border border-nexgen-primaryGold/50 font-semibold text-xs sm:text-sm hover:bg-nexgen-brightGold/20 transition-all cursor-pointer whitespace-nowrap"
            >
              Book Consultation
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
