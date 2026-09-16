"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Stethoscope,
  HeartHandshake,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";
import { COMPANY_NAME, CLINIC_EMAIL, CLINIC_PHONE } from "@/config/constants";
import { PublicJob } from "./page";

interface CareerClientPageProps {
  initialJobs: PublicJob[];
}

const CULTURE_POINTS = [
  {
    icon: Stethoscope,
    title: "Surgeon-Led Excellence",
    desc: "Work under senior restoration surgeons adhering to international follicular viability protocols.",
  },
  {
    icon: Sparkles,
    title: "State-of-the-Art Suites",
    desc: "Operate with motorized sapphire blades, DHI implanter pens, and hypothermic preservation solutions.",
  },
  {
    icon: Award,
    title: "Fast-Track Career Growth",
    desc: "Continuous clinical skills mentorship, surgical masterclasses, and CME conference sponsorships.",
  },
  {
    icon: HeartHandshake,
    title: "Rewarding Compensation",
    desc: "Competitive fixed compensation, surgical procedure incentives, PF/ESI, and medical cover.",
  },
];

export default function CareerClientPage({ initialJobs }: CareerClientPageProps) {
  const [selectedDept, setSelectedDept] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const departments = ["All", ...Array.from(new Set(initialJobs.map((j) => j.department))).filter(Boolean)];

  const filteredJobs = initialJobs.filter((job) => {
    const matchesDept = selectedDept === "All" || job.department === selectedDept;
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="bg-nexgen-pageLightBg min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 bg-nexgen-mainDarkBg text-white overflow-hidden border-b border-nexgen-primaryGold/25">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-nexgen-primaryGold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="qht-container relative z-10 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-nexgen-brightGold/10 text-nexgen-brightGold text-xs font-semibold uppercase tracking-wider mb-6 border border-nexgen-primaryGold/30">
            <Sparkles className="w-3.5 h-3.5 text-nexgen-brightGold" />
            We Are Hiring
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-[500] tracking-tight leading-[1.15] text-white mb-6">
            Shape The Future of <br className="hidden sm:inline" />
            <span className="text-nexgen-brightGold">Hair Restoration</span>
          </h1>

          <p className="text-sm sm:text-lg text-gray-300 font-normal leading-relaxed max-w-2xl mx-auto mb-8">
            Join {COMPANY_NAME} Hair Transplant Clinic. Work alongside accomplished surgeons and clinicians in a high-growth environment dedicated to natural artistry and medical excellence.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-nexgen-primaryGold/20 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-nexgen-brightGold">
                {initialJobs.length}+
              </div>
              <div className="text-xs text-gray-300 font-medium mt-0.5">Open Positions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">4</div>
              <div className="text-xs text-gray-300 font-medium mt-0.5">Clinical Depts</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-gray-300 font-medium mt-0.5">Surgeon-Led</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">Patna</div>
              <div className="text-xs text-gray-300 font-medium mt-0.5">Central Clinic</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Culture & Why Join Us Pillars */}
      <section className="py-16 sm:py-20 bg-nexgen-pageLightBg border-b border-nexgen-primaryGold/20">
        <div className="qht-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-nexgen-primaryGold uppercase tracking-wider block mb-2">
              Our Culture & Values
            </span>
            <h2 className="text-2xl sm:text-4xl font-[500] text-nexgen-veryDarkHeader tracking-tight">
              Why Build Your Career At {COMPANY_NAME}?
            </h2>
            <p className="mt-2.5 text-xs sm:text-base text-gray-600">
              We offer a collaborative, physician-led environment where medical professionals flourish.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CULTURE_POINTS.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-nexgen-primaryGold/20 shadow-xs flex flex-col justify-between hover:border-nexgen-primaryGold/40 hover:shadow-lg transition duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-nexgen-pageLightBg text-nexgen-primaryGold flex items-center justify-center mb-5 shrink-0 border border-nexgen-primaryGold/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-nexgen-veryDarkHeader mb-2">{point.title}</h3>
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                      {point.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Open Positions Listing */}
      <section id="openings" className="py-16 sm:py-24">
        <div className="qht-container">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-semibold text-nexgen-primaryGold uppercase tracking-wider block mb-1">
                Explore Opportunities
              </span>
              <h2 className="text-2xl sm:text-4xl font-[500] text-nexgen-veryDarkHeader tracking-tight">
                Current Job Openings
              </h2>
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition duration-200 cursor-pointer ${
                    selectedDept === dept
                      ? "bg-nexgen-veryDarkHeader text-white border border-nexgen-primaryGold shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-nexgen-primaryGold/40 hover:bg-nexgen-pageLightBg"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs Cards Grid */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-nexgen-primaryGold/20 shadow-sm max-w-xl mx-auto">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No openings found</h3>
              <p className="text-xs text-gray-500 mb-6">
                There are currently no posted openings in this department, but we are always eager to meet skilled clinical professionals.
              </p>
              <button
                onClick={() => setSelectedDept("All")}
                className="px-5 py-2 text-xs font-semibold text-nexgen-veryDarkHeader bg-nexgen-brightGold hover:bg-yellow-400 rounded-full transition"
              >
                View All Departments
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-7 sm:p-8 border border-nexgen-primaryGold/20 shadow-xs hover:shadow-lg hover:border-nexgen-primaryGold/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Department & Type */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-nexgen-pageLightBg text-nexgen-veryDarkHeader border border-nexgen-primaryGold/20">
                        {job.department}
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                        {job.employmentType}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-xl sm:text-2xl font-[500] text-nexgen-veryDarkHeader leading-snug group-hover:text-nexgen-primaryGold transition duration-200 mb-3">
                      <Link href={`/career/${job.slug}`}>{job.title}</Link>
                    </h3>

                    {/* Metadata Items */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-nexgen-primaryGold" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-nexgen-primaryGold" />
                        {job.experience}
                      </span>
                      {job.openings > 1 && (
                        <span className="flex items-center gap-1.5 text-nexgen-primaryGold font-semibold">
                          <Users className="w-3.5 h-3.5" />
                          {job.openings} Openings
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed line-clamp-3 mb-5">
                      {job.description}
                    </p>

                    {/* Requirements Preview */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="space-y-1.5 mb-6">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Key Requirements:
                        </span>
                        {job.requirements.slice(0, 2).map((req, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-nexgen-primaryGold shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{req}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      {job.salaryRange && (
                        <span className="text-xs font-semibold text-gray-800 block">
                          {job.salaryRange}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/career/${job.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-nexgen-veryDarkHeader bg-nexgen-brightGold hover:bg-yellow-400 transition duration-200 shadow-sm group-hover:gap-3"
                    >
                      <span>View & Apply</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Spontaneous Application / Contact Banner */}
      <section className="py-16 bg-nexgen-veryDarkHeader text-white">
        <div className="qht-container">
          <div className="rounded-3xl bg-gradient-to-r from-nexgen-mainDarkBg via-nexgen-veryDarkHeader to-nexgen-mainDarkBg p-8 sm:p-12 border border-nexgen-primaryGold/30 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-xl">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-nexgen-brightGold/15 text-nexgen-brightGold border border-nexgen-primaryGold/30 text-xs font-semibold uppercase tracking-wider mb-3">
                Join Our Talent Network
              </span>
              <h3 className="text-2xl sm:text-3xl font-[500] text-white tracking-tight mb-2">
                Don&apos;t See The Exact Role For Your Specialty?
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                We are constantly expanding our surgical, trichology, and nursing teams. Send your CV directly to our HR recruitment desk.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href={`mailto:${CLINIC_EMAIL}?subject=${encodeURIComponent("General Career Application - " + COMPANY_NAME)}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-nexgen-veryDarkHeader bg-nexgen-brightGold hover:bg-yellow-400 transition shadow-sm"
              >
                <Mail className="w-4 h-4" />
                Email Your CV
              </a>
              <a
                href={`tel:${CLINIC_PHONE}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-nexgen-primaryGold/30 transition"
              >
                <Phone className="w-4 h-4" />
                Call HR Desk
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
