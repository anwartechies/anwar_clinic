"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { PatientsPage } from "@/components/Patients/PatientsPage";

export default function Page() {
  return (
    <RequirePermission permissions={["patients:read"]}>
      <PatientsPage />
    </RequirePermission>
  );
}
