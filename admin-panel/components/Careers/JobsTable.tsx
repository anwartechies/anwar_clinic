"use client";

import { useState, useEffect } from "react";
import {
  TbPlus,
  TbSearch,
  TbEdit,
  TbTrash,
  TbUsers,
  TbMapPin,
  TbClock,
  TbBriefcase,
  TbRefresh,
  TbLoader2,
} from "react-icons/tb";
import { Job, JOB_STATUS_LABELS, JOB_STATUS_STYLES } from "./types";
import { JobModal } from "./JobModal";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";

interface JobsTableProps {
  onViewApplicationsForJob?: (jobId: string) => void;
}

export function JobsTable({ onViewApplicationsForJob }: JobsTableProps) {
  const { has } = usePermissions();
  const canWrite = has("careers:write");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Job[]>("/jobs");
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const handleDelete = async (job: Job) => {
    if (
      !confirm(
        `Are you sure you want to delete "${job.title}"? This will also remove any candidate applications associated with it.`
      )
    ) {
      return;
    }

    try {
      await apiFetch(`/jobs/${job.id}`, { method: "DELETE" });
      fetchJobs();
    } catch (err: any) {
      alert(err.message || "Failed to delete job");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());

    const matchesDept = department === "All" || job.department === department;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = Array.from(new Set(jobs.map((j) => j.department))).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          >
            <option value="All">All Departments</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <button
            onClick={fetchJobs}
            disabled={loading}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Refresh list"
          >
            <TbRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {canWrite && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition"
          >
            <TbPlus className="w-4 h-4" />
            Post New Job
          </button>
        )}
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading && jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <TbLoader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs">Loading job openings...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <TbBriefcase className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No job openings found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || department !== "All"
                ? "Try adjusting your filters"
                : "Post your first opening using the button above"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Position / Role</th>
                  <th className="py-3.5 px-4 font-medium">Department</th>
                  <th className="py-3.5 px-4 font-medium">Experience</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium">Applications</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJobs.map((job) => {
                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition group"
                    >
                      {/* Title & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <TbMapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <TbClock className="w-3 h-3 text-slate-400" />
                            {job.employmentType}
                          </span>
                          {job.openings > 1 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {job.openings} Openings
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {job.department}
                        </span>
                      </td>

                      {/* Experience & Salary */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <div className="font-medium">{job.experience}</div>
                        {job.salaryRange && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {job.salaryRange}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset ${
                            JOB_STATUS_STYLES[job.status]
                          }`}
                        >
                          {JOB_STATUS_LABELS[job.status]}
                        </span>
                      </td>

                      {/* Applications */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onViewApplicationsForJob?.(job.id)}
                          className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition"
                        >
                          <TbUsers className="w-4 h-4 text-slate-400" />
                          <span>{job.applicantCount || 0}</span>
                          {(job.newApplicantCount || 0) > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                              {job.newApplicantCount} new
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canWrite && (
                            <>
                              <button
                                onClick={() => handleEdit(job)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Edit Job"
                              >
                                <TbEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(job)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                                title="Delete Job"
                              >
                                <TbTrash className="w-4 h-4" />
                              </button>
                            </>
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

      {/* Create / Edit Modal */}
      <JobModal
        job={editingJob}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchJobs}
      />
    </div>
  );
}
