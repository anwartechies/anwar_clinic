export type JobStatus = "published" | "draft" | "closed";
export type EmploymentType = "Full-time" | "Part-time" | "Consultant" | "Contract";

export interface Job {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experience: string;
  salaryRange?: string | null;
  openings: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: JobStatus;
  sortOrder: number;
  applicantCount?: number;
  newApplicantCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "interviewed"
  | "offered"
  | "rejected";

export interface JobApplication {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  experienceYears: string;
  currentCompany?: string | null;
  noticePeriod?: string | null;
  resumeUrl: string;
  resumeFileName: string;
  coverNote?: string | null;
  status: ApplicationStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    slug: string;
    department: string;
    location: string;
  };
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  published: "Published",
  draft: "Draft",
  closed: "Closed",
};

export const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400",
  draft: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400",
  closed: "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-400",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  interviewed: "Interviewed",
  offered: "Offered",
  rejected: "Rejected",
};

export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400",
  reviewing: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400",
  shortlisted: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-400",
  interviewed: "bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-950/40 dark:text-cyan-400",
  offered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400",
};
