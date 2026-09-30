"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { BillingPage } from "@/components/Billing/BillingPage";

export default function Page() {
  return (
    <RequirePermission permissions={["billing:read"]}>
      <BillingPage />
    </RequirePermission>
  );
}
