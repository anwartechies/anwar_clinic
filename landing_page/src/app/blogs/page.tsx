import React from "react";
import { Metadata } from "next";
import { COMPANY_NAME } from "@/config/constants";
import { fetchBlogs } from "@/lib/blogs";
import BlogsPageClient from "@/components/Blogs/BlogsPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Hair Restoration Blogs & Clinical Articles | ${COMPANY_NAME} Clinic`,
  description:
    `Read the latest hair transplant guides, recovery tips, PRP therapy insights, and surgeon research from ${COMPANY_NAME} Hair Transplant Clinic.`,
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: `Hair Restoration Blogs & Patient Guides | ${COMPANY_NAME} Clinic`,
    description:
      `Read the latest hair transplant guides, recovery tips, PRP therapy insights, and surgeon research from ${COMPANY_NAME} Hair Transplant Clinic.`,
    type: "website",
  },
};

export default async function Page() {
  const blogs = await fetchBlogs();
  return <BlogsPageClient initialBlogs={blogs} />;
}
