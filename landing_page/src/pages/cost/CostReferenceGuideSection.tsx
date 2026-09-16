"use client";

import React from "react";
import { Stethoscope } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

export default function CostReferenceGuideSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-pageLightBg overflow-hidden border-t border-gray-200/50">
      <div className="qht-large-container">
        
        {/* Header */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold block mb-2 tracking-wide">
            Complete Reference Guide
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.14] mb-3">
            Everything You Need to Know About Hair <br />
            Transplant Cost in India
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-3xl">
            A comprehensive, medically accurate reference covering all aspects of hair transplant pricing, techniques, candidacy, and recovery — designed to help you make a fully informed decision.
          </p>
        </div>

        {/* 8 Knowledge / Editorial Blocks in a 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12 items-start text-xs sm:text-[13px] text-gray-600 leading-relaxed">
          
          {/* 1. What is a Hair Transplant? */}
          <div className="space-y-3 pb-8 border-b border-gray-200/80">
            <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
              What is a Hair Transplant?
            </h3>
            <p>
              A hair transplant is a minimally invasive to surgical procedure in which hair follicles — individually or in strip form — are harvested from a donor area (typically the back or sides of the scalp, which are genetically resistant to DHT-induced hair loss) and implanted into bald or thinning areas of the scalp.
            </p>
            <p>
              The procedure is considered the gold standard for permanent hair loss treatment in cases of androgenetic alopecia (male or female pattern baldness), traction alopecia, burn-related hair loss, and hairline reconstruction after trauma or surgery.
            </p>
            <p>
              Results are permanent because donor follicles retain their genetic resistance to dihydrotestosterone (DHT) even after transplantation — meaning the transplanted hair continues to grow naturally for life with proper care.
            </p>
          </div>

          {/* 2. QHT Clinic Cost per Graft */}
          <div className="space-y-3 pb-8 border-b border-gray-200/80">
            <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
              Per-Graft Cost Structure at {COMPANY_NAME}
            </h3>
            <p>
              In India, hair transplant cost is primarily calculated on a per-graft basis. A graft typically contains 1–4 hair follicles. The total cost is derived by multiplying the per-graft rate by the total number of grafts required for your specific case.
            </p>
            <div className="bg-white/80 rounded-xl p-3.5 border border-gray-200/60 space-y-1 my-2">
              <span className="font-bold text-nexgen-veryDarkHeader block">
                Formula: Total Cost = Number of Grafts × Per-Graft Rate
              </span>
              <ul className="space-y-0.5 text-xs text-gray-700">
                <li>• FUE Technique: ₹10/graft (scarless standard)</li>
                <li>• Bio FUE (DMEM Medium): ₹15/graft (enhanced follicle vitality)</li>
                <li>• DHI Technique: ₹15/graft (direct implanter pen)</li>
                <li>• Premium DHI (Sapphire + DMEM): ₹25/graft (top clinical grade)</li>
              </ul>
            </div>
            <p>
              The number of grafts required is determined by your Norwood baldness scale grade, assessed during a scalp analysis consultation with the surgeon.
            </p>
          </div>

          {/* 3. Who is a Good Candidate for Hair Transplant? */}
          <div className="space-y-3 pb-8 border-b border-gray-200/80">
            <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
              Who is a Good Candidate for Hair Transplant?
            </h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Men and women with stable androgenetic alopecia (pattern baldness)</li>
              <li>Individuals with sufficient donor hair density at the back/sides of the scalp</li>
              <li>Patients with Norwood Grade II through VII baldness</li>
              <li>Those with traction alopecia, scarring alopecia, or post-surgical hair loss</li>
              <li>Patients requiring hairline reconstruction, beard or eyebrow restoration</li>
              <li>Minimum age: 25 years (ideally), when hair loss pattern has stabilised</li>
              <li>Non-smokers or willing to quit 2 weeks before/after surgery</li>
            </ul>
            <p className="text-xs pt-1 italic">
              A thorough scalp analysis including trichoscopy, blood tests and donor density assessment is essential before treatment planning.
            </p>
          </div>

          {/* 4. Hair Transplant Recovery Timeline */}
          <div className="space-y-3 pb-8 border-b border-gray-200/80">
            <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
              Hair Transplant Recovery Timeline
            </h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><strong className="text-gray-900">Day 1–3 :</strong> Mild swelling and redness — normal healing response</li>
              <li><strong className="text-gray-900">Day 7–10 :</strong> Scabs form and shed naturally; gentle washing begins</li>
              <li><strong className="text-gray-900">Week 2–4 :</strong> Shock loss (temporary shedding of transplanted hair)</li>
              <li><strong className="text-gray-900">Month 3–4 :</strong> New hair follicles begin emerging</li>
              <li><strong className="text-gray-900">Month 6–9 :</strong> Significant hair growth visible; density improving</li>
              <li><strong className="text-gray-900">Month 12–18 :</strong> Final, full results — permanent, natural density</li>
            </ul>
            <p className="text-xs pt-1 italic">
              Most patients return to desk work within 3–5 days. Physical exertion should be avoided for 2–3 weeks post-procedure.
            </p>
          </div>

          {/* 5. Difference Between FUE, FUT and DHI */}
          <div className="space-y-3 pb-8 border-b border-gray-200/80">
            <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
              Difference Between FUE, FUT and DHI
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong className="text-gray-900">FUE:</strong> Individual follicle extraction using punch tool. No linear scar. Versatile — suitable for scalp, beard, eyebrow transplants.
              </li>
              <li>
                <strong className="text-gray-900">FUT:</strong> Strip of scalp removed and microscopically dissected. Higher graft yield in one session. Leaves linear scar concealable by hair.
              </li>
              <li>
                <strong className="text-gray-900">DHI (Direct Hair Implantation):</strong> A variation of FUE using a Choi implanter pen for direct placement without recipient site pre-creation. Higher cost, fewer grafts per session.
              </li>
              <li>
                <strong className="text-gray-900">{COMPANY_NAME} Advanced Technique:</strong> Direct micro-implantation protocol reducing follicle out-of-body holding time to protect root viability and yield maximum natural density.
              </li>
            </ul>
          </div>

          {/* 6. What is the Norwood Scale? */}
          <div className="space-y-3 pb-8 border-b border-gray-200/80">
            <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
              What is the Norwood Scale?
            </h3>
            <p>
              The Norwood-Hamilton Scale (Norwood Scale) is the primary classification system for male pattern baldness, used globally to determine hair transplant candidacy and plan graft requirements.
            </p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li><strong className="text-gray-900">Stage I:</strong> No visible hair loss</li>
              <li><strong className="text-gray-900">Stage II:</strong> Minor recession at temples</li>
              <li><strong className="text-gray-900">Stage III:</strong> Deeper temple recession</li>
              <li><strong className="text-gray-900">Stage IV:</strong> Significant frontal loss + crown thinning</li>
              <li><strong className="text-gray-900">Stage V:</strong> Large bald area, bridge between zones</li>
              <li><strong className="text-gray-900">Stage VI:</strong> Bridge disappears — front and crown unified</li>
              <li><strong className="text-gray-900">Stage VII:</strong> Only narrow horseshoe band remains</li>
            </ul>
            <p className="text-xs pt-1 italic">
              For women, the Ludwig Scale is used instead. {COMPANY_NAME} treats both male and female pattern hair thinning.
            </p>
          </div>

          {/* 7. QHT Clinic PRP Therapy */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
              PRP & Regenerative Therapies at {COMPANY_NAME}
            </h3>
            <p>
              Platelet-Rich Plasma (PRP) therapy is frequently combined with hair transplant procedures to accelerate healing, improve graft survival and stimulate native hair follicles. PRP involves concentrating growth factors from the patient's own blood and injecting them into the scalp.
            </p>
            <p>
              PRP sessions typically cost ₹3,000–₹8,000 per session in India. {COMPANY_NAME} offers bundled restoration + PRP therapy packages for comprehensive hair maintenance.
            </p>
          </div>

          {/* 8. QHT Clinic EMI Plan */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
              Flexible EMI & Financing Plans
            </h3>
            <p>
              {COMPANY_NAME} offers flexible financing solutions to ensure world-class hair restoration is accessible:
            </p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><strong className="text-gray-900">Zero-cost EMI:</strong> Split total procedure cost across 3–24 months with no interest</li>
              <li><strong className="text-gray-900">Seasonal discounts:</strong> Festive and limited-time promotional offers</li>
              <li><strong className="text-gray-900">Combo packages:</strong> FUE + PRP bundles at discounted rates</li>
              <li><strong className="text-gray-900">Transparent all-inclusive quotes:</strong> No hidden consultation, anaesthesia, or medication fees</li>
            </ul>
            <p className="text-xs pt-1 italic">
              EMI options are available via major NBFCs and banking partners. Options are discussed fully during your free consultation — no pressure, no obligations.
            </p>
          </div>

        </div>

        {/* Medical Disclaimer Box at Bottom */}
        <div className="mt-12 sm:mt-16 bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/80 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-nexgen-primaryGold/10 text-nexgen-primaryGold flex items-center justify-center flex-shrink-0 mt-0.5">
            <Stethoscope className="w-4 h-4" />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            <strong className="text-nexgen-veryDarkHeader font-semibold">Medical Disclaimer:</strong> All pricing information on this page is indicative and based on per-graft estimates. Final costs are determined only after a personalized scalp assessment by a qualified hair restoration surgeon at {COMPANY_NAME}. Individual results may vary based on hair caliber, donor reserves, and medical candidacy. Hair transplant is a surgical procedure — choose your clinic and surgeon carefully.
          </p>
        </div>

      </div>
    </section>
  );
}
