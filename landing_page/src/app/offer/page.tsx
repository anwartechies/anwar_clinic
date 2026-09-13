import React from "react";
import { Metadata } from "next";
import OfferPageClient from "@/components/Offer/OfferPageClient";
import { COMPANY_NAME } from "@/config/constants";
import { STATIC_OFFER } from "@/config/offer";

export const metadata: Metadata = {
  title: `Special Offer | ${COMPANY_NAME} Hair Transplant`,
  description: `${STATIC_OFFER.title} ${STATIC_OFFER.highlightText ?? ""}`.trim(),
  // A time-limited campaign page — keep it out of search results so a stale
  // offer never outlives the promotion in Google.
  robots: { index: false, follow: true },
};

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Only a successful claim from the modal sets this; a direct visit shows the
  // offer with a claim button instead of a "reserved" confirmation.
  const claimed = searchParams?.claimed === "1";
  return <OfferPageClient offer={STATIC_OFFER} claimed={claimed} />;
}
