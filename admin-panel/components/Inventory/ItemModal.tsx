"use client";

import { useState, useEffect } from "react";
import {
  TbX,
  TbPackage,
  TbShieldCheck,
  TbAlertCircle,
  TbCheck,
} from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import {
  InventoryItem,
  InventoryCategory,
  CATEGORY_LABELS,
} from "./types";

interface ItemModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ItemModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: ItemModalProps) {
  const isEditing = Boolean(item);

  const [formData, setFormData] = useState<{
    sku: string;
    name: string;
    category: InventoryCategory;
    unit: string;
    stockQuantity: number;
    minStockLevel: number;
    broken: number;
    stolen: number;
    batchNumber: string;
    expiryDate: string;
    costPrice: number;
    sellingPrice: string;
    storageLocation: string;
    supplierName: string;
    supplierContact: string;
    isSterile: boolean;
    notes: string;
  }>({
    sku: "",
    name: "",
    category: "surgical_instruments",
    unit: "pcs",
    stockQuantity: 0,
    minStockLevel: 5,
    broken: 0,
    stolen: 0,
    batchNumber: "",
    expiryDate: "",
    costPrice: 0,
    sellingPrice: "",
    storageLocation: "",
    supplierName: "",
    supplierContact: "",
    isSterile: true,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku || "",
        name: item.name || "",
        category: item.category || "surgical_instruments",
        unit: item.unit || "pcs",
        stockQuantity: item.stockQuantity || 0,
        minStockLevel: item.minStockLevel || 5,
        broken: item.broken || 0,
        stolen: item.stolen || 0,
        batchNumber: item.batchNumber || "",
        expiryDate: item.expiryDate || "",
        costPrice: Number(item.costPrice) || 0,
        sellingPrice:
          item.sellingPrice !== null && item.sellingPrice !== undefined
            ? String(item.sellingPrice)
            : "",
        storageLocation: item.storageLocation || "",
        supplierName: item.supplierName || "",
        supplierContact: item.supplierContact || "",
        isSterile: Boolean(item.isSterile),
        notes: item.notes || "",
      });
    } else {
      setFormData({
        sku: "",
        name: "",
        category: "surgical_instruments",
        unit: "pcs",
        stockQuantity: 0,
        minStockLevel: 5,
        broken: 0,
        stolen: 0,
        batchNumber: "",
        expiryDate: "",
        costPrice: 0,
        sellingPrice: "",
        storageLocation: "",
        supplierName: "",
        supplierContact: "",
        isSterile: true,
        notes: "",
      });
    }
    setError(null);
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setError("Item name and SKU are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        stockQuantity: Number(formData.stockQuantity),
        minStockLevel: Number(formData.minStockLevel),
        broken: Number(formData.broken),
        stolen: Number(formData.stolen),
        costPrice: Number(formData.costPrice),
        sellingPrice: formData.sellingPrice.trim() ? Number(formData.sellingPrice) : null,
        batchNumber: formData.batchNumber.trim() || null,
        expiryDate: formData.expiryDate || null,
        storageLocation: formData.storageLocation.trim() || null,
        supplierName: formData.supplierName.trim() || null,
        supplierContact: formData.supplierContact.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (isEditing && item) {
        await apiFetch(`/inventory/${item.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/inventory", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save inventory item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? "Edit Stock Item" : "Add New Medical Stock"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Register hair transplant instruments, medicines, and supplies.
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
          {/* Row 1: Name & SKU */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sapphire Blade 1.0mm 45°"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SKU / Catalog Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BLD-SAPH-10"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Row 2: Category & Unit */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as InventoryCategory })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                  <option key={catKey} value={catKey}>
                    {catLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Unit of Measure
              </label>
              <input
                type="text"
                placeholder="e.g. pcs, vials, boxes, kits, bottles, ampoules"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Row 3: Stock Quantity, Min Stock, Broken, Stolen */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock Levels &amp; Loss Tracking
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Active Stock
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isEditing} // edits should use Adjust modal
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                {isEditing && (
                  <span className="text-[10px] text-slate-400">Use adjust button</span>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Reorder Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, minStockLevel: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Broken (int)
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isEditing}
                  value={formData.broken}
                  onChange={(e) =>
                    setFormData({ ...formData, broken: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-900 disabled:opacity-60 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-red-700 dark:text-red-400">
                  Stolen (int)
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isEditing}
                  value={formData.stolen}
                  onChange={(e) =>
                    setFormData({ ...formData, stolen: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-xs text-red-900 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Batch # & Expiry */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Lot / Batch Number
              </label>
              <input
                type="text"
                placeholder="e.g. SAPH-2026-08A"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Row 5: Cost & Selling Price */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Unit Cost Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Patient Selling Price (₹) (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Leave blank if internal use only"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>


          {/* Row 6: Location & Supplier */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Storage Shelf / OT
              </label>
              <input
                type="text"
                placeholder="e.g. OT-1 Sterile Tray"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Supplier / Vendor
              </label>
              <input
                type="text"
                placeholder="e.g. MicroSurg Ltd"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Supplier Contact
              </label>
              <input
                type="text"
                placeholder="Email or phone"
                value={formData.supplierContact}
                onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Sterile Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isSterile"
              checked={formData.isSterile}
              onChange={(e) => setFormData({ ...formData, isSterile: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="isSterile" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Sterile Medical Device / Consumable
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Clinical &amp; Handling Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Autoclave protocol, fragile sapphire tip handling..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Footer */}
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
              {loading ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
