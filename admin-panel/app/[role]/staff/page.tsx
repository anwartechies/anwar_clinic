"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { StaffManager } from "@/components/Staff/StaffManager";

export default function Page() {
  return (
    <RequirePermission permissions={["staff:read"]}>
      <StaffManager />
    </RequirePermission>
  );
}
