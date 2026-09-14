"use client";

import { useState, useEffect } from "react";
import { TbX, TbLoader2 } from "react-icons/tb";
import { Job, EmploymentType, JobStatus } from "./types";
import { apiFetch } from "@/lib/api";

interface JobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function JobModal({ job, isOpen, onClose, onSaved }: JobModalProps) {
  const isEdit = Boolean(job);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Medical / Surgical");
  const [location, setLocation] = useState("Patna Clinic (Razabazar)");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("Full-time");
  const [experience, setExperience] = useState("2-4 Years");
  const [salaryRange, setSalaryRange] = useState("");
  const [openings, setOpenings] = useState(1);
  const [description, setDescription] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [status, setStatus] = useState<JobStatus>("published");
  const [sortOrder, setSortOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setDepartment(job.department || "Medical / Surgical");
      setLocation(job.location || "Patna Clinic (Razabazar)");
      setEmploymentType(job.employmentType || "Full-time");
      setExperience(job.experience || "1-3 Years");
      setSalaryRange(job.salaryRange || "");
      setOpenings(job.openings || 1);
      setDescription(job.description || "");
      setResponsibilitiesText((job.responsibilities || []).join("\n"));
      setRequirementsText((job.requirements || []).join("\n"));
      setBenefitsText((job.benefits || []).join("\n"));
      setStatus(job.status || "published");
      setSortOrder(job.sortOrder || 0);
    } else {
      setTitle("");
      setDepartment("Medical / Surgical");
      setLocation("Patna Clinic (Razabazar)");
      setEmploymentType("Full-time");
      setExperience("1-3 Years");
      setSalaryRange("");
      setOpenings(1);
      setDescription("");
      setResponsibilitiesText("");
      setRequirementsText("");
      setBenefitsText("");
      setStatus("published");
      setSortOrder(0);
    }
    setError(null);
  }, [job, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in the Job Title and Description.");
      return;
    }

    setLoading(true);
    setError(null);

    const responsibilities = responsibilitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const requirements = requirementsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const benefits = benefitsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      employmentType,
      experience: experience.trim(),
      salaryRange: salaryRange.trim() || null,
      openings: Number(openings) || 1,
      description: description.trim(),
      responsibilities,
      requirements,
      benefits,
      status,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      if (isEdit && job) {
        await apiFetch(`/jobs/${job.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/jobs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save job opening.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {isEdit ? "Edit Job Opening" : "Create New Job Opening"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit
                ? "Update vacancy requirements and job status"
                : "Post a new opening to recruit hair transplant specialists"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hair Transplant Surgeon (FUE / DHI)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                list="departments-list"
                placeholder="e.g. Medical / Surgical"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <datalist id="departments-list">
                <option value="Medical / Surgical" />
                <option value="Nursing & OT" />
                <option value="Clinical Technicians" />
                <option value="Counseling & Patient Care" />
                <option value="Clinic Administration" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Patna Clinic (Razabazar)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Type, Experience & Openings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Consultant">Consultant</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Experience
              </label>
              <input
                type="text"
                placeholder="e.g. 2-5 Years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vacancies / Openings
              </label>
              <input
                type="number"
                min={1}
                value={openings}
                onChange={(e) => setOpenings(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Salary Range & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Salary Range (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ₹6,00,000 – ₹12,00,000 / year"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="published">Published (Visible on Careers Page)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Job Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide a comprehensive role overview and what makes this position unique at our clinic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Responsibilities (One per line) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Key Responsibilities (One per line)
              </label>
              <span className="text-[11px] text-slate-400">Separate items with Enter</span>
            </div>
            <textarea
              rows={3}
              placeholder="Design natural hairlines&#10;Perform FUE micro-extraction&#10;Oversee OT sterility and patient vitals"
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono text-xs"
            />
          </div>

          {/* Requirements (One per line) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Requirements & Qualifications (One per line)
              </label>
              <span className="text-[11px] text-slate-400">Separate items with Enter</span>
            </div>
            <textarea
              rows={3}
              placeholder="MBBS / MS / MD in Dermatology or Plastic Surgery&#10;Minimum 2+ years of surgical hair restoration experience&#10;State Medical Council registration"
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono text-xs"
            />
          </div>

          {/* Benefits (One per line) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Perks & Benefits (One per line)
              </label>
              <span className="text-[11px] text-slate-400">Separate items with Enter</span>
            </div>
            <textarea
              rows={2}
              placeholder="Competitive performance incentives&#10;Comprehensive medical insurance cover&#10;High-volume surgical learning exposure"
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm shadow-emerald-600/20 transition"
            >
              {loading && <TbLoader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Update Job" : "Publish Job Opening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
