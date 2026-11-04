"use client";

import { useState, useEffect } from "react";
import {
  TbX,
  TbShoppingCart,
  TbAlertCircle,
  TbCheck,
  TbCurrencyRupee,
  TbUser,
  TbReceipt,
  TbFileText,
  TbPackage,
  TbSparkles,
  TbInfoCircle,
} from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { InventoryItem } from "./types";

interface SellStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: InventoryItem | null;
  allItems?: InventoryItem[];
}

export function SellStockModal({
  isOpen,
  onClose,
  onSuccess,
  item: propItem,
  allItems = [],
}: SellStockModalProps) {
  const { fullName, roleSlug } = usePermissions();

  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number | string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active item is either propItem or picked from allItems
  const currentItem = propItem || allItems.find((i) => i.id === selectedItemId) || null;

  useEffect(() => {
    if (propItem) {
      setSelectedItemId(propItem.id);
      setUnitPrice(propItem.sellingPrice !== null && propItem.sellingPrice !== undefined ? propItem.sellingPrice : "");
    } else if (allItems.length > 0 && !selectedItemId) {
      const firstInStock = allItems.find((i) => i.stockQuantity > 0) || allItems[0];
      setSelectedItemId(firstInStock.id);
      setUnitPrice(firstInStock.sellingPrice !== null && firstInStock.sellingPrice !== undefined ? firstInStock.sellingPrice : "");
    }
    setQuantity(1);
    setCustomerName("");
    setInvoiceNumber("");
    setNotes("");
    setError(null);
  }, [propItem, allItems, isOpen]);

  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
    const found = allItems.find((i) => i.id === itemId);
    if (found) {
      setUnitPrice(found.sellingPrice !== null && found.sellingPrice !== undefined ? found.sellingPrice : "");
    }
  };

  if (!isOpen) return null;

  const maxStock = currentItem?.stockQuantity || 0;
  const numUnitPrice = typeof unitPrice === "number" ? unitPrice : parseFloat(unitPrice) || 0;
  const totalAmount = (quantity || 0) * numUnitPrice;
  const costPrice = currentItem ? Number(currentItem.costPrice) || 0 : 0;
  const estimatedProfit = numUnitPrice > 0 && costPrice > 0 ? (numUnitPrice - costPrice) * quantity : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) {
      setError("Please select an item to sell.");
      return;
    }

    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity of at least 1.");
      return;
    }

    if (quantity > maxStock) {
      setError(`Cannot sell ${quantity} ${currentItem.unit}. Only ${maxStock} ${currentItem.unit} available in stock.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiFetch(`/inventory/${currentItem.id}/sell`, {
        method: "POST",
        body: JSON.stringify({
          quantity: Number(quantity),
          unitPrice: numUnitPrice > 0 ? numUnitPrice : undefined,
          customerName: customerName.trim() || undefined,
          invoiceNumber: invoiceNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to register stock sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TbShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Register Stock Sale / Dispense
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deduct sold inventory units and log audit activity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <TbX className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            <TbAlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Item Selection (if not pre-locked) */}
          {!propItem && allItems.length > 0 ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Stock Item <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {allItems.map((i) => (
                  <option key={i.id} value={i.id} disabled={i.stockQuantity <= 0}>
                    {i.name} ({i.sku}) — Available: {i.stockQuantity} {i.unit} {i.stockQuantity <= 0 ? "(OUT OF STOCK)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            currentItem && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TbPackage className="h-4 w-4 text-teal-600" />
                    {currentItem.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    SKU: {currentItem.sku} • Cost: ₹{Number(currentItem.costPrice).toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                    {currentItem.stockQuantity} {currentItem.unit}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">In Stock</div>
                </div>
              </div>
            )
          )}

          {/* Quantity & Unit Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quantity Sold <span className="text-rose-500">*</span>
                </label>
                {maxStock > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuantity(maxStock)}
                    className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Max ({maxStock})
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={maxStock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {currentItem?.unit || "units"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selling Price (₹ per {currentItem?.unit || "unit"})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          {maxStock > 1 && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-slate-400 mr-1">Quick Qty:</span>
              {[1, 2, 5, 10]
                .filter((q) => q <= maxStock)
                .map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                      quantity === q
                        ? "bg-teal-600 text-white font-semibold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {q}
                  </button>
                ))}
            </div>
          )}

          {/* Total Revenue & Margin Preview Banner */}
          {numUnitPrice > 0 && quantity > 0 && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  Total Sale Revenue
                </div>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              {estimatedProfit !== null && (
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Est. Gross Margin</div>
                  <div
                    className={`text-sm font-semibold ${
                      estimatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                    }`}
                  >
                    {estimatedProfit >= 0 ? "+" : ""}₹{estimatedProfit.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer & Invoice details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Patient / Customer Name
              </label>
              <div className="relative">
                <TbUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Invoice / Bill Number
              </label>
              <div className="relative">
                <TbReceipt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2025-108"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sale Notes / Dispense Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dispensed with Post-Op Hair Kit; paid via Card..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Performer Activity Audit Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-400">
            <TbInfoCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Staff Audit Trail:
              </span>{" "}
              This transaction will be logged with your staff account (
              <span className="font-medium text-teal-600 dark:text-teal-400">
                {fullName || roleSlug || "Current Staff"}
              </span>
              ) and viewable in movement logs.
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || maxStock <= 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
            >
              <TbShoppingCart className="h-4 w-4" />
              {loading ? "Registering Sale..." : "Confirm & Register Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
