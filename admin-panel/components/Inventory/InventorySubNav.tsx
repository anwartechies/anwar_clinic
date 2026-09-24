"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbLayoutDashboard, TbPackages } from "react-icons/tb";
import { cn } from "@/lib/utils";

export function InventorySubNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const roleSlug = segments[0] || "admin";

  const isStocksPage = pathname.includes("/inventory/stocks");
  const isOverviewPage = !isStocksPage && pathname.includes("/inventory");

  const tabs = [
    {
      name: "Overview Dashboard",
      href: `/${roleSlug}/inventory`,
      active: isOverviewPage,
      icon: TbLayoutDashboard,
      description: "Metrics, audit logs & expiry tracking",
    },
    {
      name: "Stocks & Supplies",
      href: `/${roleSlug}/inventory/stocks`,
      active: isStocksPage,
      icon: TbPackages,
      description: "Item catalog, reorder levels & detail panel",
    },
  ];

  return (
    <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "group flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm font-medium transition-all duration-150",
                tab.active
                  ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  tab.active
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}
              />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
