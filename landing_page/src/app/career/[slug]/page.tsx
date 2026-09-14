import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPANY_NAME, API_URL } from "@/config/constants";
import JobDetailClient from "./JobDetailClient";
import { PublicJob } from "../page";

interface PageProps {
  params: { slug: string };
}

async function fetchJob(slug: string): Promise<PublicJob | null> {
  try {
    const res = await fetch(`${API_URL}/public/jobs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch job ${slug}:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = await fetchJob(params.slug);
  if (!job) {
    return {
      title: `Job Opening Not Found | ${COMPANY_NAME} Clinic`,
    };
  }

  return {
    title: `${job.title} | Careers at ${COMPANY_NAME} Hair Transplant Clinic`,
    description: `Apply now for ${job.title} in ${job.department} at ${COMPANY_NAME} Clinic, ${job.location}. ${job.experience} experience required.`,
  };
}

export default async function JobPage({ params }: PageProps) {
  const job = await fetchJob(params.slug);
  if (!job) {
    notFound();
  }

  return <JobDetailClient job={job} />;
}
