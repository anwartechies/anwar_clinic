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
        q: "What is a male hair transplant procedure?",
        a: "A male hair transplant is an advanced, minimally invasive surgical procedure designed to permanently restore receding hairlines, thin crowns, and bald areas. Healthy, genetically permanent follicles are meticulously extracted from the donor region (typically the back and sides of the scalp) and implanted into thinning zones, matching your natural growth angles and facial contours.",
      },
      {
        q: "Should I disclose pre-existing medical conditions before surgery?",
        a: "Yes, absolutely. A comprehensive medical history—including thyroid conditions, diabetes, hypertension, scalp dermatoses, or medications such as blood thinners—is essential during your initial evaluation. This enables our medical team to formulate tailored pre-operative instructions and post-care protocols that ensure complete patient safety and optimal graft survival.",
      },
      {
        q: "Who is an ideal candidate for male hair restoration?",
        a: "An ideal candidate has stabilized male pattern baldness (Norwood Stages 2 to 6), sufficient healthy donor hair density, realistic aesthetic goals, and good overall health. Our specialists conduct an in-depth digital trichoscopy scalp evaluation to assess donor reserves and predict long-term follicular stability before recommending surgery.",
      },
      {
        q: "Why is choosing an accredited, reputable clinic so critical?",
        a: `Hair restoration is both an exact microsurgery and an artistic craft. While discount clinics often cut corners with unqualified technicians, choosing an accredited clinic like ${COMPANY_NAME} guarantees surgeon-led extraction and implantation, state-of-the-art sterile operating theaters, zero visible scarring, and lifetime graft preservation without donor over-harvesting.`,
      },
      {
        q: "Is male hair transplant surgery painful?",
        a: "The procedure is virtually painless. We utilize precision local anesthesia and gentle numbing techniques to ensure you remain fully comfortable throughout the session. Most patients relax comfortably, watch a movie, or listen to music during treatment, with only mild tenderness easily managed by mild pain relievers for a few days afterward.",
      },
      {
        q: "Are the transplanted hair results truly permanent?",
        a: "Yes. Follicles harvested from the permanent donor zone are genetically resistant to dihydrotestosterone (DHT)—the primary hormone responsible for pattern baldness. Once successfully rooted, these follicles continue growing naturally for a lifetime.",
      },
    ],
  },
  {
    id: "nexGen-hair-transplant",
    name: `${COMPANY_NAME} Hair Transplant`,
    icon: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: `What sets the ${COMPANY_NAME} technique apart from traditional methods?`,
        a: `The ${COMPANY_NAME} technique represents a refined evolution of follicular microsurgery. By minimizing out-of-body holding time to under 30 minutes and utilizing custom sapphire-precision implanters, we achieve graft survival rates exceeding 95%, virtually imperceptible micro-extraction points, and accelerated recovery without linear scars.`,
      },
      {
        q: `Where can I undergo the ${COMPANY_NAME} hair restoration procedure?`,
        a: `Our flagship surgical centers in Patna and Mumbai are equipped with global-standard cleanroom operating suites and cutting-edge trichological diagnostic systems, delivering world-class hair restoration accessible to patients across India and international medical travelers.`,
      },
      {
        q: `Is the ${COMPANY_NAME} procedure cost-effective?`,
        a: `Yes. We combine premium surgical excellence with transparent per-graft pricing, free from hidden surgical or disposable fees. To make world-class hair restoration accessible to everyone, we also provide flexible 0% interest EMI installment plans.`,
      },
      {
        q: `What is the downtime and comfort level during recovery?`,
        a: "Because our technique causes minimal micro-trauma, post-procedure discomfort is minimal and short-lived. Most patients resume non-strenuous desk work within 48 to 72 hours, with donor points healing into undetectable micro-dots within 5 to 7 days.",
      },
      {
        q: "Will there be noticeable scarring at the donor area?",
        a: "No visible linear scars remain. We employ micro-punches (0.75mm–0.85mm) in a randomized dispersion pattern across the donor zone. Once healed, the micro-dots are invisible even with short fades or cropped hairstyles.",
      },
    ],
  },
  {
    id: "crown-hair-transplant",
    name: "Crown Hair Transplant",
    icon: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "How effective is hair transplantation in the crown (vertex) area?",
        a: `Crown transplantation is exceptionally effective when performed by skilled surgeons who master 3D spatial artistry. Because crown hair radiates outward in a distinct spiral whorl, our surgical team meticulously recreates the natural clockwise angle and multi-directional fan of each graft to achieve dense, natural-looking vertex coverage.`,
      },
      {
        q: "Which surgical technique delivers the best results for crown restoration?",
        a: `Our specialized micro-FUE technique is the gold standard for crown restoration. It allows surgeons to handcraft acute, flat insertion angles matching your original whorl while preserving maximum graft vitality for robust, full-volume regrowth.`,
      },
      {
        q: "What is the typical recovery timeline after a crown transplant?",
        a: "Initial epithelial healing completes within 5 to 7 days. Because the crown has slightly different vascular dynamics compared to the frontal hairline, full crown density and hair caliber maturation typically peak between 10 to 14 months post-procedure.",
      },
      {
        q: "Will transplanted crown hair last permanently?",
        a: "Yes. All implanted crown follicles are extracted from DHT-immune occipital donor zones and maintain their genetic permanence. We also advise complementary medical stabilization therapies to protect existing native hair surrounding the crown from progressive thinning.",
      },
      {
        q: "Does a crown transplant leave noticeable marks or scars?",
        a: "No. Our micro-extraction and needle-point implantation produce only microscopic healing points that blend seamlessly into the scalp, leaving zero visible scarring.",
      },
    ],
  },
  {
    id: "social-media-influencer-hair-transplant",
    name: "Social Media Influencer Hair Transplant",
    icon: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "Can hair transplant results withstand high-definition 4K cameras and lighting?",
        a: `Yes. Our bespoke VIP protocol is specifically designed for actors, creators, and public figures who demand perfection under studio spotlights and high-definition 4K zoom lenses. Hairline feathering and customized micro-density deliver an undetectable, lifelike appearance from any angle.`,
      },
      {
        q: "How is privacy and confidentiality handled for high-profile clients?",
        a: "We maintain strict non-disclosure agreements (NDAs), private entrance suites, and dedicated one-on-one surgical sessions to guarantee complete discretion and confidentiality throughout your treatment journey.",
      },
      {
        q: "When can I resume camera appearances and hair styling?",
        a: "Patients typically appear on video calls and casual content within 7 to 10 days once initial flaking clears. Regular styling, heat tools, and salon products can be freely resumed after 3 to 4 months as newly transplanted follicles begin their vigorous growth phase.",
      },
      {
        q: "Are there visible side effects immediately after surgery?",
        a: "Mild redness and faint swelling around the forehead may persist for 48 to 72 hours. Our specialized anti-swelling protocols and post-procedure cold compresses minimize visible downtime, allowing swift public re-emergence.",
      },
      {
        q: `Why do public figures and creators choose ${COMPANY_NAME}?`,
        a: `Creators trust ${COMPANY_NAME} for our artistic hairline design, zero telltale scars, rapid healing protocols, and photographic density that looks completely natural under intense lighting.`,
      },
    ],
  },
  {
    id: "hair-transplant-repair",
    name: "Hair Transplant Repair",
    icon: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "Is corrective hair transplant surgery painful?",
        a: "Not at all. Corrective and revision procedures are performed under advanced, painless local anesthesia. Our gentle approach minimizes scar tissue irritation, ensuring complete ease throughout your surgical session.",
      },
      {
        q: "Can a previously botched or unnatural hair transplant be fixed?",
        a: `Yes. We frequently correct unnatural 'doll-hair' plugs, incorrectly angled grafts, sunken hairlines, and donor over-harvesting caused by inexperienced clinics. Our surgeons carefully excise or reposition misangled grafts and rebuild a feathered, natural hairline with fresh donor reserves.`,
      },
      {
        q: "How long do the results of a corrective hair transplant last?",
        a: "Once corrected by our senior restorative team, the results are permanent. The reconstructed hairline and donor balance are engineered for a lifetime of natural growth.",
      },
      {
        q: `What makes ${COMPANY_NAME} the trusted choice for revision surgery?`,
        a: "Revision surgery requires far higher technical skill than primary transplants due to existing fibrotic scar tissue and depleted donor reserves. Our senior specialists leverage high-magnification optical loupes, regenerative therapies, and artistic micro-grafting to restore balance and confidence.",
      },
    ],
  },
  {
    id: "hairline-reconstruction",
    name: "Hairline Reconstruction",
    icon: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "How do you design an artistic, age-appropriate hairline?",
        a: "Our surgeons map your hairline according to facial symmetry, Golden Ratio proportions, age, and future hair loss patterns. We exclusively implant fine, single-hair follicular units along the transition zone in an irregular, micro-feathered pattern to replicate the natural softness of an untouched hairline.",
      },
      {
        q: "What is the expected graft survival rate in hairline reconstruction?",
        a: `At ${COMPANY_NAME}, our cold-chain storage and rapid implanter protocols consistently deliver graft survival rates exceeding 95%, ensuring dense, uniform framing for your face.`,
      },
      {
        q: "What are the common post-procedure sensations after hairline restoration?",
        a: "Mild scalp tightness and light tenderness are normal for the first 48 to 72 hours as tissues heal. These sensations are brief, easily managed with prescribed analgesics, and resolve completely within a few days.",
      },
      {
        q: "Is reconstructed hairline growth permanent?",
        a: "Yes. Because the hair is sourced from DHT-resistant donor areas, the newly designed hairline will continue growing naturally for life and can be cut, dyed, and styled normally.",
      },
      {
        q: "How long until my new hairline looks full and complete?",
        a: "New hair sprouts around month 3 to 4, with noticeable cosmetic density around month 6 to 8. Full, mature aesthetic density and texture develop fully between 9 and 12 months.",
      },
    ],
  },
  {
    id: "fue-hair-transplant",
    name: "FUE Hair Transplant",
    icon: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "How does modern FUE differ from older hair transplant techniques?",
        a: "Unlike older FUT strip surgery which left a permanent horizontal scar across the back of the head, modern FUE harvests individual follicular units one by one with micro-punches under 0.85mm. This results in minimal tissue disturbance, no stitches, and rapid, scar-free healing.",
      },
      {
        q: "Is FUE hair transplant safe and pain-free?",
        a: `Yes. FUE is a safe, outpatient procedure performed under precision local anesthesia. Patients remain awake, relaxed, and pain-free throughout the day.`,
      },
      {
        q: "What is the recovery and return-to-work timeline with FUE?",
        a: "Most patients return to light desk work and daily routines within 2 to 3 days. Superficial donor crusts typically shed completely within 7 to 10 days, leaving the scalp looking clean and healthy.",
      },
      {
        q: "Are FUE hair restoration results permanent?",
        a: "Yes. Harvested from the permanent 'safe donor zone' resistant to hereditary hair loss genes, FUE grafts retain their vitality and continue growing indefinitely.",
      },
    ],
  },
  {
    id: "temple-hair-transplant",
    name: "Temple Hair Transplant",
    icon: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    faqs: [
      {
        q: "Why is temple restoration so technically demanding?",
        a: `The temporal points require exceptional surgical finesse because temple hair grows virtually flat against the skin at extremely acute (10°–15°) angles. Our surgeons hand-place ultra-fine single follicles to seamlessly restore your temporal triangle without blunt or sticking-out hairs.`,
      },
      {
        q: "Can temple restoration restore youthfulness to my facial profile?",
        a: "Yes. Rebuilding recessed temporal peaks frames the eyes and forehead, restoring a balanced, youthful, and harmonious silhouette that dramatically enhances your facial profile.",
      },
      {
        q: `Can unnatural or misdirected temple transplants be repaired at ${COMPANY_NAME}?`,
        a: `Yes. If previous work left temple hairs growing outward at awkward angles, our revision specialists can extract the misplaced grafts, re-angle them flat against the skin, and recreate a soft, natural temporal curve.`,
      },
      {
        q: "Is temple hair transplant permanent?",
        a: "Yes. Transplanted temporal follicles are permanent, resilient to DHT, and will grow naturally alongside your facial hair and sideburns.",
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
