"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { StocksPage } from "@/components/Inventory/StocksPage";

export default function InventoryStocksRoute() {
  return (
    <RequirePermission permissions={["inventory:read"]}>
      <StocksPage />
    </RequirePermission>
  );
}
