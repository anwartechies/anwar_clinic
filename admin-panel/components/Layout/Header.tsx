"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { TbMenu2, TbLogout, TbEye } from "react-icons/tb";
import { usePermissions } from "@/context/PermissionsContext";
import { useLayout } from "@/context/LayoutContext";

export function Header() {
  const router = useRouter();
  const { fullName, roleSlug, effectiveRoleSlug, isPreviewing } = usePermissions();
  const { setMobileNavOpen } = useLayout();

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("permissions");
    router.replace("/auth/login");
  };

  // First letter of each word, ignoring punctuation — "Prabhat (Rhinon Tech)" → "PR".
  const initials = (fullName || "")
    .split(" ")
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, "")[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
        aria-label="Open navigation"
      >
        <TbMenu2 className="h-5 w-5" />
      </button>

      {/* Superadmin previewing another role's URL — make the altered gating obvious. */}
      {isPreviewing ? (
        <div className="flex min-w-0 items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <TbEye className="h-4 w-4 shrink-0" />
          <span className="truncate">
            Previewing as <span className="font-semibold">{effectiveRoleSlug}</span>
          </span>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {fullName || "—"}
          </p>
          <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{roleSlug || "—"}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
          {initials || "?"}
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
          aria-label="Sign out"
          title="Sign out"
        >
          <TbLogout className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
