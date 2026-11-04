"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { OverviewDashboard } from "@/components/Inventory/OverviewDashboard";

export default function InventoryOverviewPage() {
  return (
    <RequirePermission permissions={["inventory:read"]}>
      <OverviewDashboard />
    </RequirePermission>
  );
}
