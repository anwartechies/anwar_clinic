"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { ReportsPage } from "@/components/Reports/ReportsPage";

export default function Page() {
  return (
    <RequirePermission permissions={["reports:read"]}>
      <ReportsPage />
    </RequirePermission>
  );
}
