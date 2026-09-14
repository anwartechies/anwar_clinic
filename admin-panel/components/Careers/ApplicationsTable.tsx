"use client";

import { useState, useEffect } from "react";
import {
  TbSearch,
  TbTrash,
  TbEye,
  TbFileDownload,
  TbMail,
  TbPhone,
  TbRefresh,
  TbLoader2,
  TbUsers,
  TbBrandWhatsapp,
} from "react-icons/tb";
import {
  JobApplication,
  ApplicationStatus,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
} from "./types";
import { ApplicationDetailModal } from "./ApplicationDetailModal";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";

interface ApplicationsTableProps {
  filterJobId?: string | null;
  onClearJobFilter?: () => void;
}

export function ApplicationsTable({ filterJobId, onClearJobFilter }: ApplicationsTableProps) {
  const { has } = usePermissions();
  const canWrite = has("careers:write");

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let path = "/jobs/admin/applications";
      const params = new URLSearchParams();
      if (filterJobId) params.append("jobId", filterJobId);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());
      if (params.toString()) path += `?${params.toString()}`;

      const data = await apiFetch<JobApplication[]>(path);
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterJobId, statusFilter]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await apiFetch(`/jobs/admin/applications/${appId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (app: JobApplication) => {
    if (!confirm(`Are you sure you want to delete application from ${app.fullName}?`)) return;

    try {
      await apiFetch(`/jobs/admin/applications/${app.id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete application");
    }
  };

  const openDetail = (app: JobApplication) => {
    setSelectedApplication(app);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchApplications()}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          >
            <option value="All">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>

          {filterJobId && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span>Filtered by Job</span>
              <button
                onClick={onClearJobFilter}
                className="font-bold hover:text-emerald-900 dark:hover:text-emerald-200 ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Refresh list"
          >
            <TbRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Total Candidates: <span className="font-semibold text-slate-700 dark:text-slate-200">{applications.length}</span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading && applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <TbLoader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs">Loading candidate applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <TbUsers className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No applications received yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Applications submitted by candidates on the website will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Candidate</th>
                  <th className="py-3.5 px-4 font-medium">Position Applied</th>
                  <th className="py-3.5 px-4 font-medium">Experience & Org</th>
                  <th className="py-3.5 px-4 font-medium">Resume</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium">Date</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => {
                  const cleanPhone = app.phone.replace(/[^\d+]/g, "");
                  const whatsappUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
                    `Hello ${app.fullName}, regarding your application for the ${app.job?.title || "job opening"} at NexGen Hair Transplant...`
                  )}`;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition group"
                    >
                      {/* Candidate Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => openDetail(app)}
                          className="font-semibold text-slate-900 dark:text-slate-100 text-sm cursor-pointer hover:text-emerald-600 transition"
                        >
                          {app.fullName}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <a
                            href={`mailto:${app.email}`}
                            className="flex items-center gap-1 hover:text-emerald-600 transition truncate max-w-[140px]"
                          >
                            <TbMail className="w-3 h-3 text-slate-400 shrink-0" />
                            {app.email}
                          </a>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${app.phone}`}
                              className="hover:text-emerald-600 transition"
                            >
                              {app.phone}
                            </a>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <TbBrandWhatsapp className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Position Applied */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {app.job?.title || "Unknown Position"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {app.job?.department || "General"}
                        </div>
                      </td>

                      {/* Experience & Company */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <div className="font-medium">{app.experienceYears || "Not specified"}</div>
                        {app.currentCompany && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {app.currentCompany}
                          </div>
                        )}
                      </td>

                      {/* Resume Download */}
                      <td className="py-3.5 px-4">
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800 transition shadow-sm"
                        >
                          <TbFileDownload className="w-3.5 h-3.5" />
                          Resume
                        </a>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={app.status}
                          disabled={!canWrite}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value as ApplicationStatus)
                          }
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 ring-1 ring-inset focus:ring-2 focus:ring-emerald-500 transition cursor-pointer ${
                            APPLICATION_STATUS_STYLES[app.status]
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="offered">Offered</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(app)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="View Details"
                          >
                            <TbEye className="w-4 h-4" />
                          </button>
                          {canWrite && (
                            <button
                              onClick={() => handleDelete(app)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                              title="Delete Application"
                            >
                              <TbTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdated={fetchApplications}
      />
    </div>
  );
}
