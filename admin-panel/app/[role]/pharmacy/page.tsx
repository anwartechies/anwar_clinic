"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { PharmacyPage } from "@/components/Pharmacy/PharmacyPage";

export default function Page() {
  return (
    <RequirePermission permissions={["prescriptions:read", "inventory:read", "billing:read"]}>
      <PharmacyPage />
    </RequirePermission>
  );
}
