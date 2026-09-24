"use client";

import { useState } from "react";
import {
  TbX,
  TbAdjustments,
  TbHeartBroken,
  TbFileAlert,
  TbPackage,
  TbActivity,
  TbAlertCircle,
  TbCheck,
} from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { InventoryItem, InventoryAction } from "./types";

interface QuickAdjustModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickAdjustModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: QuickAdjustModalProps) {
  const [action, setAction] = useState<InventoryAction>("broken");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      setError("Please specify a valid quantity greater than 0.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiFetch(`/inventory/${item.id}/adjust`, {
        method: "PATCH",
        body: JSON.stringify({
          action,
          quantity: Number(quantity),
          reason: reason.trim() || undefined,
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  };

  const actionOptions: {
    id: InventoryAction;
    title: string;
    desc: string;
    icon: any;
    color: string;
  }[] = [
    {
      id: "broken",
      title: "Report Broken / Damaged",
      desc: "Increments broken count & deducts from usable stock",
      icon: TbHeartBroken,
      color: "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300",
    },
    {
      id: "stolen",
      title: "Report Stolen / Missing",
      desc: "Increments stolen count & deducts from usable stock",
      icon: TbFileAlert,
      color: "border-red-300 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300",
    },
    {
      id: "restock",
      title: "Receive Stock / Restock",
      desc: "Add incoming supplies to available stock",
      icon: TbPackage,
      color: "border-teal-300 bg-teal-50 text-teal-800 dark:bg-teal-950/20 dark:text-teal-300",
    },
    {
      id: "used_procedure",
      title: "Consumed in Procedure",
      desc: "Used during hair transplant surgery / PRP session",
      icon: TbActivity,
      color: "border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300",
    },
    {
      id: "adjustment",
      title: "Audit Reconciliation",
      desc: "Directly override available stock count to match physical count",
      icon: TbAdjustments,
      color: "border-purple-300 bg-purple-50 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Stock Adjustment &amp; Loss Log
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Item: <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span> ({item.sku})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <TbX className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400">
            <TbAlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Current Stock Indicators */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
            <div>
              <span className="text-slate-500">Available:</span>{" "}
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {item.stockQuantity} {item.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Broken:</span>{" "}
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {item.broken}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Stolen:</span>{" "}
              <span className="font-bold text-red-600 dark:text-red-400">
                {item.stolen}
              </span>
            </div>
          </div>

          {/* Action selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Adjustment Type
            </label>
            <div className="mt-2 grid gap-2">
              {actionOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = action === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAction(opt.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-2.5 text-left transition",
                      isSelected
                        ? opt.color + " ring-2 ring-teal-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{opt.title}</p>
                      <p className="text-[11px] opacity-80">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {action === "adjustment" ? "Actual Physical Count" : "Quantity"} ({item.unit})
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Incident / Reason Note */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reason / Incident Details (Audit trail)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                action === "broken"
                  ? "e.g. Sapphire blade dropped on floor during graft incision..."
                  : action === "stolen"
                  ? "e.g. Missing from shelf during weekly physical inventory count..."
                  : "e.g. Received new shipment batch from distributor..."
              }
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50"
            >
              <TbCheck className="h-4 w-4" />
              {loading ? "Recording..." : "Save Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
