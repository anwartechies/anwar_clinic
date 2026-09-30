"use client";

import { NAV_ITEMS } from "@/constants/nav";
import { usePermissions } from "@/context/PermissionsContext";
import { RequirePermission } from "@/components/UI/Guards";
import { PageHeader } from "@/components/Layout/PageHeader";
import { ClinicalDashboardWidgets } from "@/components/Dashboard/ClinicalDashboardWidgets";
import Link from "next/link";
import { usePathname } from "next/navigation";

function DashboardBody() {
  const pathname = usePathname();
  const roleSlug = pathname.split("/")[1] || "";
  const { fullName, permissions, has, isPreviewing, effectiveRoleSlug } = usePermissions();

  // Same data-driven filter the sidebar uses — the modules a role can reach are
  // entirely a function of its grants.
  const modules = NAV_ITEMS.filter((item) => item.path !== "/dashboard" && has(...item.permissions));

  return (
    <>
      <PageHeader
        title={`Welcome${fullName ? `, ${fullName.split(" ")[0]}` : ""}`}
        description={
          isPreviewing
            ? `Previewing the "${effectiveRoleSlug}" role — the modules below are what that role can reach.`
            : "Here's what your role gives you access to."
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Your role" value={effectiveRoleSlug || "—"} />
        <StatCard
          label="Permissions granted"
          value={isPreviewing ? "—" : String(permissions.length)}
        />
        <StatCard label="Modules available" value={String(modules.length)} />
      </div>

      {/* Role-Specific Clinical & Front-Desk Widgets */}
      <ClinicalDashboardWidgets />

      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Your modules</h2>
      {modules.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No modules are enabled for this role yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((item) => (
            <Link
              key={item.path}
              href={`/${roleSlug}${item.path}`}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-700"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-teal-50 group-hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300">
                {item.icon}
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold capitalize text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequirePermission permissions={["dashboard:read"]}>
      <DashboardBody />
    </RequirePermission>
  );
}
