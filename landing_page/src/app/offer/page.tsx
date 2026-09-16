import React from "react";
import { Metadata } from "next";
import OfferPageClient from "@/components/Offer/OfferPageClient";
import { COMPANY_NAME } from "@/config/constants";
import { STATIC_OFFER } from "@/config/offer";
import { fetchActiveOffer } from "@/lib/offers";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const offer = await fetchActiveOffer();
  const currentOffer = offer.isEnabled ? offer : STATIC_OFFER;

  return {
    title: `${currentOffer.badge || "Special Offer"} | ${COMPANY_NAME} Hair Transplant`,
    description: `${currentOffer.title} ${currentOffer.highlightText ?? ""}`.trim(),
    robots: { index: false, follow: true },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const offer = await fetchActiveOffer();
  const currentOffer = offer.isEnabled ? offer : STATIC_OFFER;
  const claimed = searchParams?.claimed === "1";

  return <OfferPageClient offer={currentOffer} claimed={claimed} />;
}
