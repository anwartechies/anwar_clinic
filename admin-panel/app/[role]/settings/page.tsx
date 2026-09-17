"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbShield, TbBuildingHospital, TbRocket } from "react-icons/tb";
import { usePermissions } from "@/context/PermissionsContext";
import { RequirePermission } from "@/components/UI/Guards";
import { PageHeader } from "@/components/Layout/PageHeader";

function SettingsBody() {
  const pathname = usePathname();
  const roleSlug = pathname.split("/")[1] || "";
  const { has, isPlatformAdmin } = usePermissions();

  return (
    <>
      <PageHeader title="Settings" description="Configure the clinic and who can do what." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${roleSlug}/settings/roles`}
          className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-teal-50 group-hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300">
            <TbShield className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Roles & Permissions</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create roles and grant each one exactly what it needs.
          </p>
        </Link>

        {isPlatformAdmin && has("deploy:read") && (
          <Link
            href={`/${roleSlug}/settings/deploy`}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-teal-50 group-hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300">
              <TbRocket className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Deploy</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pull, build and restart the backend on the server. Rhinon Tech only.
            </p>
          </Link>
        )}

        <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
            <TbBuildingHospital className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Clinic profile</p>
          <p className="mt-1 text-xs text-slate-400">Coming soon.</p>
        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <RequirePermission permissions={["settings:read"]}>
      <SettingsBody />
    </RequirePermission>
  );
}
