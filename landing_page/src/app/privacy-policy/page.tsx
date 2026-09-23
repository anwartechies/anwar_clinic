import React from "react";
import PrivacyPolicyPage from "@/pages/privacy-policy/PrivacyPolicyPage";
import { Metadata } from "next";
import { COMPANY_NAME } from "@/config/constants";

export const metadata: Metadata = {
  title: `Privacy Policy | ${COMPANY_NAME} Clinic India`,
  description: `Read the official privacy policy, data protection, and patient confidentiality standards for ${COMPANY_NAME} Clinic.`,
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
