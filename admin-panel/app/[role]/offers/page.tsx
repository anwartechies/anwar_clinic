"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { OffersTable } from "@/components/Offers/OffersTable";

export default function OffersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotional Offer Banners"
        description="Configure dynamic website top offer banners, monitor active promotion campaigns, and track lifecycle timelines."
      />

      <OffersTable />
    </div>
  );
}
