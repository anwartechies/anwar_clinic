"use client";

import { useState } from "react";
import { openResume } from "./openResume";
import {
  TbX,
  TbMail,
  TbPhone,
  TbFileDownload,
  TbBrandWhatsapp,
  TbBriefcase,
  TbBuilding,
  TbCalendar,
  TbClock,
  TbLoader2,
  TbCheck,
} from "react-icons/tb";
import { JobApplication, ApplicationStatus, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_STYLES } from "./types";
import { apiFetch } from "@/lib/api";

interface ApplicationDetailModalProps {
  application: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
  onUpdated,
}: ApplicationDetailModalProps) {
  if (!isOpen || !application) return null;

  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [adminNotes, setAdminNotes] = useState(application.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const cleanPhone = application.phone.replace(/[^\d+]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
    `Hello ${application.fullName}, regarding your application for the ${application.job?.title || "job opening"} at NexGen Hair Transplant...`
  )}`;

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await apiFetch(`/jobs/admin/applications/${application.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      onUpdated();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {application.fullName}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset ${
                  APPLICATION_STATUS_STYLES[status]
                }`}
              >
                {APPLICATION_STATUS_LABELS[status]}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <TbBriefcase className="w-3.5 h-3.5" />
              Applied for: <span className="font-medium text-slate-700 dark:text-slate-300">{application.job?.title || "Job Position"}</span>
              {application.job?.department && (
                <span className="text-slate-400">({application.job.department})</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Contact Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <TbMail className="w-4 h-4 text-slate-400 shrink-0" />
              <a
                href={`mailto:${application.email}`}
                className="hover:text-emerald-600 truncate font-medium underline-offset-2 hover:underline"
              >
                {application.email}
              </a>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <TbPhone className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`tel:${application.phone}`}
                  className="hover:text-emerald-600 font-medium underline-offset-2 hover:underline"
                >
                  {application.phone}
                </a>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 hover:bg-emerald-200/60 transition"
              >
                <TbBrandWhatsapp className="w-3.5 h-3.5" />
                Chat
              </a>
            </div>
          </div>

          {/* Profile Overview Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Total Experience</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {application.experienceYears || "Not specified"}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Current / Last Org</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {application.currentCompany || "N/A"}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Notice Period</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {application.noticePeriod || "Immediate"}
              </p>
            </div>
          </div>

          {/* Resume Box */}
          <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <TbFileDownload className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {application.resumeFileName || "Candidate_Resume.pdf"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Uploaded on {new Date(application.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openResume(application.id, application.resumeFileName)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer"
            >
              <TbFileDownload className="w-4 h-4" />
              Download / View
            </button>
          </div>

          {/* Cover Letter / Note */}
          {application.coverNote && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Candidate Note / Cover Message
              </label>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {application.coverNote}
              </div>
            </div>
          )}

          {/* Recruitment Status & Internal Notes */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Recruitment Workflow
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Change Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
                >
                  <option value="new">New Candidate</option>
                  <option value="reviewing">Under Review</option>
                  <option value="shortlisted">Shortlisted for Interview</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Job Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-end justify-end h-full pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {saving ? (
                    <TbLoader2 className="w-4 h-4 animate-spin" />
                  ) : savedSuccess ? (
                    <TbCheck className="w-4 h-4 text-emerald-500" />
                  ) : null}
                  {savedSuccess ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Internal HR / Clinical Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Cleared 1st round interview with Dr. Rajesh. Practical OT hair alignment evaluation scheduled for Friday."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
