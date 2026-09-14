"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  CheckCircle2,
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  ShieldCheck,
  Building,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { PublicJob } from "../page";
import { COMPANY_NAME, API_URL } from "@/config/constants";

interface JobDetailClientProps {
  job: PublicJob;
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("Immediate");
  const [coverNote, setCoverNote] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("Resume file size must be less than 10MB.");
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("Resume file size must be less than 10MB.");
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your full name, email, and phone number.");
      return;
    }

    if (!resumeFile) {
      setError("Please upload your resume (PDF or Word document).");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("experienceYears", experienceYears.trim() || "0");
      formData.append("currentCompany", currentCompany.trim());
      formData.append("noticePeriod", noticePeriod);
      formData.append("coverNote", coverNote.trim());
      formData.append("resume", resumeFile);

      const res = await fetch(`${API_URL}/public/jobs/${job.slug}/apply`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Submission failed" }));
        throw new Error(data.message || "Failed to submit application.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fcfdfc] min-h-screen pt-24 sm:pt-32 pb-24">
      {/* 1. Breadcrumbs & Job Header */}
      <section className="border-b border-gray-100 bg-white py-8 sm:py-12">
        <div className="qht-container">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-[#52664d] transition">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/career" className="hover:text-[#52664d] transition">
              Careers
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-medium truncate max-w-xs sm:max-w-md">
              {job.title}
            </span>
          </nav>

          {/* Job Title & Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#52664d]/10 text-[#52664d]">
                  {job.department}
                </span>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {job.employmentType}
                </span>
                {job.openings > 1 && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                    {job.openings} Vacancies
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-[500] text-[#162418] tracking-tight mb-4">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#5c685f]">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#52664d]" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Briefcase className="w-4 h-4 text-[#52664d]" />
                  {job.experience} Exp.
                </span>
                {job.salaryRange && (
                  <span className="flex items-center gap-1.5 font-semibold text-[#162418]">
                    {job.salaryRange}
                  </span>
                )}
              </div>
            </div>

            <a
              href="#apply-form"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full text-xs font-semibold text-white bg-[#52664d] hover:bg-[#3d4d39] shadow-sm transition shrink-0"
            >
              Apply for this Job
            </a>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Application Layout */}
      <div className="qht-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Job Details */}
          <div className="lg:col-span-7 space-y-10">
            {/* Description */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
              <h2 className="text-lg sm:text-xl font-semibold text-[#162418] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#52664d]" />
                About The Position
              </h2>
              <p className="text-sm text-[#5c685f] leading-relaxed whitespace-pre-line font-normal">
                {job.description}
              </p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                <h2 className="text-lg sm:text-xl font-semibold text-[#162418] mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#52664d]" />
                  Key Responsibilities
                </h2>
                <ul className="space-y-3.5">
                  {job.responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-[13px] text-gray-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#52664d] mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements & Qualifications */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                <h2 className="text-lg sm:text-xl font-semibold text-[#162418] mb-5 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#52664d]" />
                  Qualifications & Requirements
                </h2>
                <ul className="space-y-3.5">
                  {job.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-[13px] text-gray-700 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#52664d] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Perks & Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                <h2 className="text-lg sm:text-xl font-semibold text-[#162418] mb-5 flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#52664d]" />
                  What We Offer / Perks
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {job.benefits.map((item, idx) => (
                    <li key={idx} className="p-3.5 rounded-2xl bg-[#f8faf8] border border-gray-100 text-xs text-gray-700 font-medium flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#52664d] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Application Form */}
          <div id="apply-form" className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-[0_6px_35px_rgba(0,0,0,0.04)]">
              {submitted ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Application Submitted!</h3>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                    Thank you, <span className="font-semibold text-gray-900">{fullName}</span>. Our recruitment team at {COMPANY_NAME} will review your application for the <span className="font-semibold">{job.title}</span> position and reach out via phone or email shortly.
                  </p>
                  <div className="pt-4">
                    <Link
                      href="/career"
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-[#52664d] bg-[#52664d]/10 hover:bg-[#52664d]/20 rounded-full transition"
                    >
                      Browse Other Openings
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-gray-100 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-[#162418]">Apply for this Position</h3>
                    <p className="text-xs text-[#5c685f] mt-1">
                      Complete the details below and upload your CV.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. / Mr. / Ms. Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#52664d]/20 focus:border-[#52664d] transition"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#52664d]/20 focus:border-[#52664d] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#52664d]/20 focus:border-[#52664d] transition"
                      />
                    </div>
                  </div>

                  {/* Experience & Current Org */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Total Experience *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 3 Years"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#52664d]/20 focus:border-[#52664d] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Current Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apollo / Medanta"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#52664d]/20 focus:border-[#52664d] transition"
                      />
                    </div>
                  </div>

                  {/* Notice Period */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notice Period
                    </label>
                    <select
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#52664d]/20 focus:border-[#52664d] transition"
                    >
                      <option value="Immediate">Immediate / Available Now</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">1 Month (30 Days)</option>
                      <option value="60 Days">2 Months (60 Days)</option>
                    </select>
                  </div>

                  {/* Resume Upload Box */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Upload Resume / CV * (PDF, DOC, DOCX up to 10MB)
                    </label>

                    {resumeFile ? (
                      <div className="p-3.5 rounded-2xl border border-[#52664d]/30 bg-[#52664d]/5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-5 h-5 text-[#52664d] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {resumeFile.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="p-5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#52664d] bg-gray-50/50 hover:bg-[#52664d]/5 text-center cursor-pointer transition"
                      >
                        <Upload className="w-6 h-6 text-[#52664d] mx-auto mb-1.5" />
                        <p className="text-xs font-medium text-gray-800">
                          Click to browse or drag & drop resume
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          PDF, DOC, or DOCX (Max 10MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Cover Note */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cover Note / Message (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Briefly highlight your relevant clinical background, surgical skills, or reasons for applying..."
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#52664d]/20 focus:border-[#52664d] transition"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-5 rounded-full text-xs font-semibold text-white bg-[#52664d] hover:bg-[#3d4d39] disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-400 text-center pt-1">
                    Your personal and professional information is held with strict clinical confidentiality.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
