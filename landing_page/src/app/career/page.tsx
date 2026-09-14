import React from "react";
import { Metadata } from "next";
import { COMPANY_NAME, API_URL, CLINIC_EMAIL } from "@/config/constants";
import CareerClientPage from "./CareerClientPage";

export const metadata: Metadata = {
  title: `Careers & Opportunities | ${COMPANY_NAME} Hair Transplant Clinic`,
  description: `Join our world-class medical team at ${COMPANY_NAME} Clinic. Explore open positions for Hair Transplant Surgeons, OT Staff Nurses, Hair Technicians, and Patient Care Consultants.`,
};

export interface PublicJob {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  experience: string;
  salaryRange?: string | null;
  openings: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  createdAt: string;
}

async function fetchJobs(): Promise<PublicJob[]> {
  try {
    const res = await fetch(`${API_URL}/public/jobs`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch jobs on server:", err);
    return [];
  }
}

export default async function CareerPage() {
  const initialJobs = await fetchJobs();
  return <CareerClientPage initialJobs={initialJobs} />;
}
