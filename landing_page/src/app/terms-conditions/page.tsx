import React from "react";
import TermsConditionsPage from "@/pages/terms-conditions/TermsConditionsPage";
import { Metadata } from "next";
import { COMPANY_NAME } from "@/config/constants";

export const metadata: Metadata = {
  title: `Payment Terms & Conditions | ${COMPANY_NAME} Clinic India`,
  description: `Official payment terms, slot reservations, cancellation, and refund policies for hair restoration procedures at ${COMPANY_NAME} Clinic.`,
};

export default function Page() {
  return <TermsConditionsPage />;
}
