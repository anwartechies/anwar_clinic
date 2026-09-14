"use client";

import { useState } from "react";
import { TbBriefcase, TbUsers } from "react-icons/tb";
import { PageHeader } from "@/components/Layout/PageHeader";
import { JobsTable } from "@/components/Careers/JobsTable";
import { ApplicationsTable } from "@/components/Careers/ApplicationsTable";

export default function CareersPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  const [filterJobId, setFilterJobId] = useState<string | null>(null);

  const handleViewApplicationsForJob = (jobId: string) => {
    setFilterJobId(jobId);
    setActiveTab("applications");
  };

  const handleClearJobFilter = () => {
    setFilterJobId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Careers & Recruitment"
        description="Manage hair restoration job openings, candidate requirements, and review job applications."
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "jobs"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <TbBriefcase className="w-4 h-4" />
          Job Openings
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "applications"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <TbUsers className="w-4 h-4" />
          Candidate Applications
          {filterJobId && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "jobs" ? (
        <JobsTable onViewApplicationsForJob={handleViewApplicationsForJob} />
      ) : (
        <ApplicationsTable
          filterJobId={filterJobId}
          onClearJobFilter={handleClearJobFilter}
        />
      )}
    </div>
  );
}
