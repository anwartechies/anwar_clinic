"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { PrescriptionsPage } from "@/components/Prescriptions/PrescriptionsPage";

export default function Page() {
  return (
    <RequirePermission permissions={["prescriptions:read"]}>
      <PrescriptionsPage />
    </RequirePermission>
  );
}
