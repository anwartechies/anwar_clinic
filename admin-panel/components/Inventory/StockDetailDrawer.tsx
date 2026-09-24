"use client";

import { useEffect, useState } from "react";
import {
  TbX,
  TbPackage,
  TbAlertTriangle,
  TbHeartBroken,
  TbFileAlert,
  TbMapPin,
  TbBuildingStore,
  TbPhone,
  TbNotes,
  TbCalendar,
  TbPencil,
  TbTrash,
  TbAdjustments,
  TbShieldCheck,
  TbUser,
  TbClock,
  TbRefresh,
} from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  InventoryItem,
  CATEGORY_LABELS,
  CATEGORY_BADGES,
  ACTION_LABELS,
} from "./types";

interface StockDetailDrawerProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  canWrite: boolean;
}

export function StockDetailDrawer({
  itemId,
  isOpen,
  onClose,
  onEdit,
  onAdjust,
  onDelete,
  canWrite,
}: StockDetailDrawerProps) {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItemDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<InventoryItem>(`/inventory/${id}`);
      setItem(data);
    } catch (err: any) {
      setError(err.message || "Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemDetails(itemId);
    } else {
      setItem(null);
    }
  }, [isOpen, itemId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const calculateDaysUntil = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = item ? calculateDaysUntil(item.expiryDate) : null;
  const isLowStock = item ? item.stockQuantity <= item.minStockLevel : false;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          className={cn(
            "w-screen max-w-xl border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {loading && !item ? (
            <div className="flex h-full items-center justify-center">
              <TbRefresh className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950/20 dark:text-red-400">
                <p className="font-semibold">Error</p>
                <p className="mt-1 text-sm">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 rounded-md bg-white px-3 py-1.5 text-xs font-semibold shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          ) : item ? (
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
                <div className="min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-semibold border",
                        CATEGORY_BADGES[item.category]
                      )}
                    >
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    {item.isSterile && (
                      <span className="flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-800">
                        <TbShieldCheck className="h-3.5 w-3.5" />
                        Sterile
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                    {item.name}
                  </h2>
                  <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                    SKU: {item.sku}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Close drawer"
                >
                  <TbX className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Stock & Loss Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Active Usable Stock */}
                  <div
                    className={cn(
                      "rounded-xl border p-3 text-center",
                      item.stockQuantity === 0
                        ? "border-rose-300 bg-rose-50/50 dark:border-rose-800/40 dark:bg-rose-950/20"
                        : isLowStock
                        ? "border-amber-300 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20"
                        : "border-teal-200 bg-teal-50/40 dark:border-teal-800/40 dark:bg-teal-950/20"
                    )}
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      In Stock
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-2xl font-bold",
                        item.stockQuantity === 0
                          ? "text-rose-600 dark:text-rose-400"
                          : isLowStock
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-teal-700 dark:text-teal-300"
                      )}
                    >
                      {item.stockQuantity}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {item.unit} (Min: {item.minStockLevel})
                    </p>
                  </div>

                  {/* Broken Count (int) */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-center dark:border-amber-800/40 dark:bg-amber-950/20">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      <TbHeartBroken className="h-3.5 w-3.5" />
                      Broken
                    </div>
                    <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
                      {item.broken}
                    </p>
                    <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                      {item.unit} damaged
                    </p>
                  </div>

                  {/* Stolen Count (int) */}
                  <div className="rounded-xl border border-red-200 bg-red-50/40 p-3 text-center dark:border-red-800/40 dark:bg-red-950/20">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wider text-red-700 dark:text-red-400">
                      <TbFileAlert className="h-3.5 w-3.5" />
                      Stolen
                    </div>
                    <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">
                      {item.stolen}
                    </p>
                    <p className="text-[10px] text-red-600/80 dark:text-red-400/80">
                      {item.unit} missing
                    </p>
                  </div>
                </div>

                {/* Storage & Expiration Section */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Storage &amp; Lot Control
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Location:</span>
                      <div className="mt-1 flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                        <TbMapPin className="h-4 w-4 text-teal-600" />
                        <span>{item.storageLocation || "Not assigned"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Batch / Lot #:</span>
                      <p className="mt-1 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {item.batchNumber || "N/A"}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Expiration Date:</span>
                      <div className="mt-1 flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <TbCalendar className="h-4 w-4 text-slate-400" />
                        <span>{item.expiryDate || "Non-perishable"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Safety Status:</span>
                      <div className="mt-1">
                        {daysLeft === null ? (
                          <span className="text-slate-400">No expiration set</span>
                        ) : daysLeft <= 0 ? (
                          <span className="font-semibold text-red-600">Expired</span>
                        ) : daysLeft <= 60 ? (
                          <span className="font-semibold text-amber-600">
                            Expires in {daysLeft} days
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Safe ({daysLeft} days)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financials & Supplier */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Pricing &amp; Procurement
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Unit Cost Price:</span>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        ₹{Number(item.costPrice).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Patient Billing Price:</span>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.sellingPrice !== null && item.sellingPrice !== undefined
                          ? `₹${Number(item.sellingPrice).toFixed(2)}`
                          : "Not chargeable"}
                      </p>
                    </div>


                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Supplier:</span>
                      <div className="mt-1 flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                        <TbBuildingStore className="h-4 w-4 text-slate-400" />
                        <span>{item.supplierName || "Direct / N/A"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Supplier Contact:</span>
                      <div className="mt-1 flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                        <TbPhone className="h-4 w-4 text-slate-400" />
                        <span>{item.supplierContact || "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Notes */}
                {item.notes && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <TbNotes className="h-4 w-4 text-teal-600" />
                      <span>Clinical &amp; Handling Notes</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.notes}
                    </p>
                  </div>
                )}

                {/* Item Movement History */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Item Activity History
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {item.logs?.length || 0} events
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {!item.logs || item.logs.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        No transactions recorded for this item yet.
                      </p>
                    ) : (
                      item.logs.map((log) => {
                        const actionMeta = ACTION_LABELS[log.action] || {
                          label: log.action,
                          badge: "bg-slate-100 text-slate-600",
                        };
                        return (
                          <div
                            key={log.id}
                            className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                  actionMeta.badge
                                )}
                              >
                                {actionMeta.label}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <TbClock className="h-3 w-3" />
                                {new Date(log.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <p className="mt-1.5 text-slate-700 dark:text-slate-300">
                              Qty:{" "}
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {log.quantity} {item.unit}
                              </span>{" "}
                              (Stock: {log.previousStock} &rarr; {log.newStock})
                            </p>

                            {log.reason && (
                              <p className="mt-1 italic text-[11px] text-slate-500 dark:text-slate-400">
                                &ldquo;{log.reason}&rdquo;
                              </p>
                            )}

                            {log.performedBy && (
                              <p className="mt-1 text-[10px] text-slate-400">
                                by {log.performedBy.fullName || log.performedBy.name || log.performedBy.email}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar Footer */}
              {canWrite && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => onDelete(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/20"
                    >
                      <TbTrash className="h-4 w-4" />
                      Delete
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <TbPencil className="h-4 w-4" />
                        Edit Details
                      </button>

                      <button
                        onClick={() => onAdjust(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-700"
                      >
                        <TbAdjustments className="h-4 w-4" />
                        Adjust / Log Loss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
