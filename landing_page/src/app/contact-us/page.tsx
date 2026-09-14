import React from "react";
import ContactSection from "@/components/common/ContactSection";
import { Metadata } from "next";
import { COMPANY_NAME } from "@/config/constants";

export const metadata: Metadata = {
  title: `Contact Us | ${COMPANY_NAME} Clinic India`,
  description:
    `Get in touch with ${COMPANY_NAME} Clinic branches in Patna (Main Branch) and Mumbai (Second Branch).`,
};

export default function Page() {
  return <ContactSection />;
}
