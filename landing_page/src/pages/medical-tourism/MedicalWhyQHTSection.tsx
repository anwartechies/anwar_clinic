"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const PATIENT_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80",
];

export default function MedicalWhyQHTSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#303e2c] text-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Main Relative Canvas for Absolute Orbiting Elements on Desktop */}
        <div className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center">
          
          {/* ========================================================
              CENTER ORGANIC BLOB CARD
             ======================================================== */}
          <div className="relative z-10 w-full max-w-[580px] min-h-[460px] sm:min-h-[500px] bg-[#475743] rounded-[48%_52%_56%_44%_/_48%_44%_56%_52%] shadow-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center mx-auto border border-[#586b53]/50">
            
            {/* Brand Logo */}
            <div className="mb-5 flex items-center justify-center">
              <img
                src="/images/logo1.png"
                alt={`${COMPANY_NAME} Logo`}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
              />
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.18] max-w-md">
              Why is {COMPANY_NAME} India’s Best Hair Clinic?
            </h2>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-white/90 leading-relaxed max-w-sm sm:max-w-md font-normal">
              Due to quality, ethics, and innovation, {COMPANY_NAME} Clinic has gained a good reputation among foreign patients who want to undergo hair transplant in India due to its dedication to quality services.
            </p>
          </div>

          {/* ========================================================
              4 WHITE STAT CIRCLES (Desktop Absolute Positioning)
             ======================================================== */}

          {/* 1. Stat Circle: 95% Successful Transplants (Top Left) */}
          <div className="hidden lg:flex absolute left-[15%] top-[14%] z-20 w-40 h-40 xl:w-44 xl:h-44 rounded-full bg-white text-[#162418] shadow-2xl flex-col items-center justify-center text-center p-4 border border-white/80 transform hover:scale-105 transition-transform duration-300">
            <span className="text-3xl xl:text-4xl font-extrabold text-[#5c7a4f] tracking-tight">
              95%
            </span>
            <span className="text-xs xl:text-sm font-semibold text-gray-800 leading-tight mt-1 max-w-[100px]">
              Successful Transplants
            </span>
          </div>

          {/* 2. Stat Circle: 15K+ Doctor-Led Procedures (Bottom Left) */}
          <div className="hidden lg:flex absolute left-[3%] bottom-[12%] z-20 w-52 h-52 xl:w-56 xl:h-56 rounded-full bg-white text-[#162418] shadow-2xl flex-col items-center justify-center text-center p-5 border border-white/80 transform hover:scale-105 transition-transform duration-300">
            <span className="text-4xl xl:text-5xl font-extrabold text-[#5c7a4f] tracking-tight">
              15K+
            </span>
            <span className="text-xs xl:text-sm font-semibold text-gray-800 leading-tight mt-1 max-w-[120px]">
              Doctor-Led Procedures
            </span>
          </div>

          {/* 3. Stat Circle: 25+ Countries Clients (Top Right) */}
          <div className="hidden lg:flex absolute right-[6%] top-[10%] z-20 w-52 h-52 xl:w-56 xl:h-56 rounded-full bg-white text-[#162418] shadow-2xl flex-col items-center justify-center text-center p-5 border border-white/80 transform hover:scale-105 transition-transform duration-300">
            <span className="text-4xl xl:text-5xl font-extrabold text-[#5c7a4f] tracking-tight">
              25+
            </span>
            <span className="text-xs xl:text-sm font-semibold text-gray-800 leading-tight mt-1 max-w-[110px]">
              Countries Clients
            </span>
          </div>

          {/* 4. Stat Circle: 2 Clinic Branches in India (Bottom Right) */}
          <div className="hidden lg:flex absolute right-[13%] bottom-[8%] z-20 w-36 h-36 xl:w-40 xl:h-40 rounded-full bg-white text-[#162418] shadow-2xl flex-col items-center justify-center text-center p-4 border border-white/80 transform hover:scale-105 transition-transform duration-300">
            <span className="text-3xl xl:text-4xl font-extrabold text-[#5c7a4f] tracking-tight">
              2
            </span>
            <span className="text-[11px] xl:text-xs font-semibold text-gray-800 leading-tight mt-1 max-w-[95px]">
              Clinic Branches in India
            </span>
          </div>

          {/* ========================================================
              8 PATIENT PORTRAIT CIRCLES (Desktop Absolute Positioning)
             ======================================================== */}

          {/* Photo 1: Top Mid-Left (Thumbs Up) */}
          <div className="hidden lg:block absolute left-[32%] top-[12%] z-20 w-20 h-20 xl:w-22 xl:h-22 rounded-full overflow-hidden border-[3px] border-white shadow-xl transform hover:scale-110 transition-transform duration-300 bg-white">
            <img
              src={PATIENT_AVATARS[0]}
              alt="Satisfied Patient"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Photo 2: Left Upper-Mid (Checking Hairline) */}
          <div className="hidden lg:block absolute left-[8%] top-[30%] z-20 w-24 h-24 xl:w-26 xl:h-26 rounded-full overflow-hidden border-[3px] border-white shadow-xl transform hover:scale-110 transition-transform duration-300 bg-white">
            <img
              src={PATIENT_AVATARS[1]}
              alt="Patient Hairline Examination"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Photo 3: Left Mid-Lower (Small Avatar) */}
          <div className="hidden lg:block absolute left-[19%] top-[45%] z-20 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg transform hover:scale-110 transition-transform duration-300 bg-white">
            <img
              src={PATIENT_AVATARS[2]}
              alt="International Patient"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Photo 4: Bottom Left (Bearded Patient) */}
          <div className="hidden lg:block absolute left-[20%] bottom-[12%] z-20 w-22 h-22 xl:w-24 xl:h-24 rounded-full overflow-hidden border-[3px] border-white shadow-xl transform hover:scale-110 transition-transform duration-300 bg-white">
            <img
              src={PATIENT_AVATARS[3]}
              alt="Happy Patient Result"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Photo 5: Top Right (Holding Mirror) */}
          <div className="hidden lg:block absolute right-[28%] top-[10%] z-20 w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg transform hover:scale-110 transition-transform duration-300 bg-white">
            <img
              src={PATIENT_AVATARS[4]}
              alt="Patient Checking Results"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Photo 6: Right Mid (Smiling Buzz Cut) */}
          <div className="hidden lg:block absolute right-[18%] top-[51%] z-20 w-14 h-14 xl:w-16 xl:h-16 rounded-full overflow-hidden border-2 border-white shadow-lg transform hover:scale-110 transition-transform duration-300 bg-white">
            <img
              src={PATIENT_AVATARS[5]}
              alt="Restored Natural Hairline"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Photo 7: Far Right-Mid (Patient in Polo) */}
          <div className="hidden lg:block absolute right-[4%] top-[54%] z-20 w-24 h-24 xl:w-28 xl:h-28 rounded-full overflow-hidden border-[3px] border-white shadow-xl transform hover:scale-110 transition-transform duration-300 bg-white">
            <img
              src={PATIENT_AVATARS[6]}
              alt="Patient Success"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Photo 8: Bottom Center-Right (Patient Pointing to Hair) */}
          <div className="hidden lg:block absolute right-[32%] bottom-[16%] z-20 w-14 h-14 xl:w-16 xl:h-16 rounded-full overflow-hidden border-2 border-white shadow-lg transform hover:scale-110 transition-transform duration-300 bg-white">
            <img
              src={PATIENT_AVATARS[7]}
              alt="Density Restored"
              className="w-full h-full object-cover object-top"
            />
          </div>

        </div>

        {/* ========================================================
            MOBILE & TABLET ADAPTIVE STATS & AVATARS GRID (< lg)
           ======================================================== */}
        <div className="lg:hidden mt-10 space-y-8">
          
          {/* 4 Stat Cards for Mobile */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 text-center shadow-lg border border-white/80">
              <span className="text-3xl font-extrabold text-[#5c7a4f] block">95%</span>
              <span className="text-xs font-semibold text-gray-800 mt-1 block">Successful Transplants</span>
            </div>
            <div className="bg-white rounded-3xl p-5 text-center shadow-lg border border-white/80">
              <span className="text-3xl font-extrabold text-[#5c7a4f] block">25+</span>
              <span className="text-xs font-semibold text-gray-800 mt-1 block">Countries Clients</span>
            </div>
            <div className="bg-white rounded-3xl p-5 text-center shadow-lg border border-white/80">
              <span className="text-3xl font-extrabold text-[#5c7a4f] block">15K+</span>
              <span className="text-xs font-semibold text-gray-800 mt-1 block">Doctor-Led Procedures</span>
            </div>
            <div className="bg-white rounded-3xl p-5 text-center shadow-lg border border-white/80">
              <span className="text-3xl font-extrabold text-[#5c7a4f] block">2</span>
              <span className="text-xs font-semibold text-gray-800 mt-1 block">Clinic Branches in India</span>
            </div>
          </div>

          {/* Patient Avatars Row for Mobile */}
          <div className="bg-[#475743] rounded-2xl p-4 border border-[#586b53]/50">
            <p className="text-xs font-semibold text-center text-white/90 mb-3">
              Trusted by International Patients Worldwide
            </p>
            <div className="flex items-center justify-center flex-wrap gap-2.5">
              {PATIENT_AVATARS.slice(0, 6).map((avatarUrl, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-white"
                >
                  <img
                    src={avatarUrl}
                    alt="Patient"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
