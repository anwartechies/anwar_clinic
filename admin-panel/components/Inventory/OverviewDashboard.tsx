"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TbPackage,
  TbAlertTriangle,
  TbClockExclamation,
  TbHeartBroken,
  TbShieldExclamation,
  TbArrowUpRight,
  TbTrendingUp,
  TbPlus,
  TbRefresh,
  TbMapPin,
  TbBuildingStore,
  TbUser,
  TbFileAlert,
  TbCheck,
} from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/Layout/PageHeader";
import { InventorySubNav } from "./InventorySubNav";
import {
  InventoryOverviewData,
  CATEGORY_LABELS,
  CATEGORY_BADGES,
  ACTION_LABELS,
  InventoryCategory,
} from "./types";

export function OverviewDashboard() {
  const pathname = usePathname();
  const roleSlug = pathname.split("/").filter(Boolean)[0] || "admin";

  const [data, setData] = useState<InventoryOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<InventoryOverviewData>("/inventory/overview");
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const calculateDaysUntil = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Inventory Overview"
        description="Hair transplant surgical micro-tools, anesthetics, PRP consumables, and loss tracking."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOverview}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Refresh overview metrics"
            >
              <TbRefresh className={cn("h-4 w-4", loading && "animate-spin text-teal-600")} />
              Refresh
            </button>
            <Link
              href={`/${roleSlug}/inventory/stocks`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              <TbPackage className="h-4 w-4" />
              Manage Stocks
            </Link>
          </div>
        }
      />

      <InventorySubNav />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
          <p className="font-semibold">Unable to load inventory data</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {loading && !data && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <TbRefresh className="h-7 w-7 animate-spin text-teal-600" />
            <p className="text-sm">Calculating clinical inventory metrics...</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Top KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Valuation */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Valuation
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                  <TbTrendingUp className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ₹{data.kpis.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {data.kpis.totalStockUnits.toLocaleString()} units
                  </span>
                  across {data.kpis.totalItems} distinct catalog items
                </p>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Stock Alerts
                </span>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    data.kpis.lowStockCount > 0
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  )}
                >
                  <TbAlertTriangle className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {data.kpis.lowStockCount}
                  </span>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Needs reorder
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {data.kpis.outOfStockCount > 0 ? (
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {data.kpis.outOfStockCount} items completely out of stock!
                    </span>
                  ) : (
                    "Zero items completely depleted"
                  )}
                </p>
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Expiry Watchlist (&le;60d)
                </span>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    data.kpis.expiringSoonCount > 0
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  <TbClockExclamation className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {data.kpis.expiringSoonCount}
                  </span>
                  <span className="text-xs text-rose-600 dark:text-rose-400">
                    Expiring soon
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {data.kpis.expiredCount > 0 ? (
                    <span className="font-semibold text-rose-600">
                      {data.kpis.expiredCount} batches past expiration date
                    </span>
                  ) : (
                    "All lots within safety period"
                  )}
                </p>
              </div>
            </div>

            {/* Broken & Stolen Losses Tracker */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Damage &amp; Theft Loss
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <TbShieldExclamation className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    ₹{data.kpis.totalLossValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    est. loss
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                    <TbHeartBroken className="h-3.5 w-3.5" />
                    {data.kpis.totalBroken} broken
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400">
                    <TbFileAlert className="h-3.5 w-3.5" />
                    {data.kpis.totalStolen} stolen
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hair Transplant Category Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(data.categoryBreakdown).map(([catKey, catVal]) => {
              const label = CATEGORY_LABELS[catKey as InventoryCategory] || catKey;
              return (
                <div
                  key={catKey}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {catVal.stock}
                    </span>
                    <span className="text-xs text-slate-400">
                      {catVal.count} items
                    </span>
                  </div>
                  {(catVal.broken > 0 || catVal.stolen > 0) && (
                    <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800">
                      {catVal.broken > 0 && (
                        <span className="text-amber-600 dark:text-amber-400">
                          {catVal.broken} broken
                        </span>
                      )}
                      {catVal.stolen > 0 && (
                        <span className="text-rose-600 dark:text-rose-400">
                          {catVal.stolen} stolen
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Main 2-Column Section */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Expiring Soon Watchlist + Recently Added Stocks (7 Cols) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Expiring Soon Watchlist */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TbClockExclamation className="h-5 w-5 text-rose-500" />
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Critical Expiration Watchlist
                    </h2>
                  </div>
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                    {data.expiringSoonItems.length} items
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Batches of anesthetics, PRP tubes, and sterile consumables expiring within 60 days.
                </p>

                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {data.expiringSoonItems.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      <TbCheck className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                      No urgent expirations in the next 60 days.
                    </div>
                  ) : (
                    data.expiringSoonItems.map((item) => {
                      const daysLeft = calculateDaysUntil(item.expiryDate);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                {item.name}
                              </p>
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-medium border",
                                  CATEGORY_BADGES[item.category]
                                )}
                              >
                                {item.category.replace("_", " ")}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span>SKU: {item.sku}</span>
                              {item.batchNumber && <span>Lot: {item.batchNumber}</span>}
                              {item.storageLocation && (
                                <span className="flex items-center gap-1">
                                  <TbMapPin className="h-3 w-3 text-slate-400" />
                                  {item.storageLocation}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={cn(
                                "inline-block rounded-md px-2 py-1 text-xs font-semibold",
                                daysLeft !== null && daysLeft <= 30
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              )}
                            >
                              {daysLeft !== null && daysLeft > 0
                                ? `${daysLeft} days left`
                                : "Expired!"}
                            </span>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              {item.stockQuantity} {item.unit} remaining
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recently Added Supplies */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TbPackage className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Recently Received Stocks
                    </h2>
                  </div>
                  <Link
                    href={`/${roleSlug}/inventory/stocks`}
                    className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
                  >
                    View catalog <TbArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {data.recentStocks.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{item.sku}</span>
                          <span>•</span>
                          {item.supplierName && (
                            <span className="flex items-center gap-1">
                              <TbBuildingStore className="h-3 w-3" />
                              {item.supplierName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {item.stockQuantity} {item.unit}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          @ ₹{item.costPrice.toFixed(2)}/unit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Movement & Loss Audit Log (5 Cols) */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TbFileAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Audit &amp; Movement Logs
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">Recent 15 events</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Chronological trail of restocks, surgical consumption, damages &amp; losses.
                </p>

                <div className="mt-4 space-y-3">
                  {data.recentLogs.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">
                      No stock movements recorded yet.
                    </p>
                  ) : (
                    data.recentLogs.map((log) => {
                      const actionMeta = ACTION_LABELS[log.action] || {
                        label: log.action,
                        badge: "bg-slate-100 text-slate-600",
                      };
                      return (
                        <div
                          key={log.id}
                          className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={cn(
                                "rounded px-2 py-0.5 text-[11px] font-semibold",
                                actionMeta.badge
                              )}
                            >
                              {actionMeta.label}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(log.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="mt-2">
                            <p className="text-xs font-medium text-slate-900 dark:text-slate-200">
                              {log.item?.name || "Inventory Item"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              Qty:{" "}
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {log.quantity} {log.item?.unit || "units"}
                              </span>{" "}
                              (Stock: {log.previousStock} &rarr; {log.newStock})
                            </p>
                            {log.reason && (
                              <p className="mt-1 text-[11px] italic text-slate-600 dark:text-slate-400">
                                &ldquo;{log.reason}&rdquo;
                              </p>
                            )}
                          </div>

                          {log.performedBy && (
                            <div className="mt-2 flex items-center gap-1.5 border-t border-slate-200/50 pt-1.5 text-[10px] text-slate-400 dark:border-slate-700/50">
                              <TbUser className="h-3 w-3" />
                              <span>{log.performedBy.fullName || log.performedBy.name || log.performedBy.email}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
