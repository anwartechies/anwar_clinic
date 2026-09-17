"use client";

import { TbLock } from "react-icons/tb";
import { RequirePermission } from "@/components/UI/Guards";
import { DeployManager } from "@/components/Settings/DeployManager";
import { usePermissions } from "@/context/PermissionsContext";

function PlatformOnly({ children }: { children: React.ReactNode }) {
  const { isPlatformAdmin, ready } = usePermissions();
  if (!ready) return null;
  if (!isPlatformAdmin) {
    // The API refuses these routes for non-platform accounts anyway; this just
    // explains why instead of showing a page full of errors.
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10">
            <TbLock className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Not available for this account</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Deploys are managed by Rhinon Tech.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function SettingsDeployPage() {
  return (
    <RequirePermission permissions={["deploy:read"]}>
      <PlatformOnly>
        <DeployManager />
      </PlatformOnly>
    </RequirePermission>
  );
}
