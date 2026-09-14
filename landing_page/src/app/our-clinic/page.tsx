import React from "react";
import ClinicPage from "@/pages/clinic/ClinicPage";
import { Metadata } from "next";
import { COMPANY_NAME } from "@/config/constants";

export const metadata: Metadata = {
  title: `Our Clinics — ${COMPANY_NAME} Hair Restoration Centers India`,
  description:
    `Explore ${COMPANY_NAME}'s state-of-the-art hair restoration facilities in Patna (Main Branch) and Mumbai (Second Branch). Ultra-sterile surgical suites and board-certified surgeon care.`,
};

export default function Page() {
  return <ClinicPage />;
}
