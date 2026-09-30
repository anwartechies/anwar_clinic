"use client";

import { RequirePermission } from "@/components/UI/Guards";
import { AppointmentsPage } from "@/components/Appointments/AppointmentsPage";

export default function Page() {
  return (
    <RequirePermission permissions={["appointments:read"]}>
      <AppointmentsPage />
    </RequirePermission>
  );
}
