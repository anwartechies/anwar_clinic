"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbCode, TbExternalLink } from "react-icons/tb";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants/nav";
import { usePermissions } from "@/context/PermissionsContext";
import { useLayout } from "@/context/LayoutContext";

export function Sidebar() {
  const pathname = usePathname();
  const { has } = usePermissions();
  const { sidebarExpanded, setSidebarExpanded, mobileNavOpen, setMobileNavOpen } = useLayout();

  // Built from the URL, not the async PermissionsContext state, so the very
  // first client render (and hydration) matches the server-rendered HTML —
  // roleSlug there starts empty until /auth/me resolves, which would otherwise
  // render every href as "//dashboard" on first paint.
  const roleSlug = pathname.split("/")[1] || "";

  const navItems = NAV_ITEMS.filter((item) => has(...item.permissions));

  // The mobile drawer always shows labels; desktop honors the collapse toggle.
  const expanded = sidebarExpanded || mobileNavOpen;

  return (
    <>
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={cn(
          "flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900",
          "fixed inset-y-0 left-0 z-50 w-64 shadow-xl lg:static lg:z-auto lg:shadow-none",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          expanded ? "lg:w-60" : "lg:w-16"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-4 dark:border-slate-800">
          <Image src="/brand/nexgen-mark.png" alt="NexGen" width={32} height={32} priority className="h-8 w-8 shrink-0" />
          {expanded && (
            <div className="flex min-w-0 flex-1 items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  NexGen
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">Admin Panel</p>
              </div>
              <button
                onClick={() => setSidebarExpanded(false)}
                className="hidden rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:block dark:hover:bg-slate-800"
                aria-label="Collapse sidebar"
              >
                <TbLayoutSidebarLeftCollapse className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {!expanded && (
          <button
            onClick={() => setSidebarExpanded(true)}
            className="mx-auto mt-3 hidden rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:block dark:hover:bg-slate-800"
            aria-label="Expand sidebar"
          >
            <TbLayoutSidebarLeftExpand className="h-4 w-4" />
          </button>
        )}

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const href = `/${roleSlug}${item.path}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.path}
                href={href}
                title={!expanded ? item.title : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  !expanded && "lg:justify-center lg:px-0",
                  active
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                )}
              >
                {item.icon}
                {expanded && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-2 dark:border-slate-800">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}/api-docs`}
            target="_blank"
            rel="noopener noreferrer"
            title={!expanded ? "API Documentation (Swagger)" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              !expanded && "lg:justify-center lg:px-0",
              "text-slate-600 hover:bg-teal-50 hover:text-teal-700 dark:text-slate-400 dark:hover:bg-teal-500/10 dark:hover:text-teal-300"
            )}
          >
            <TbCode className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
            {expanded && (
              <span className="flex flex-1 items-center justify-between truncate">
                <span>API Docs</span>
                <TbExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </span>
            )}
          </a>
        </div>
      </aside>
    </>
  );
}
