"use client";

import { useEffect, useState, useMemo } from "react";
import {
  TbSearch,
  TbPlus,
  TbFilter,
  TbRefresh,
  TbHeartBroken,
  TbFileAlert,
  TbAlertTriangle,
  TbShieldCheck,
  TbAdjustments,
  TbChevronRight,
  TbPackage,
  TbClockExclamation,
  TbShoppingCart,
} from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/Layout/PageHeader";
import { InventorySubNav } from "./InventorySubNav";
import { StockDetailDrawer } from "./StockDetailDrawer";
import { ItemModal } from "./ItemModal";
import { QuickAdjustModal } from "./QuickAdjustModal";
import { SellStockModal } from "./SellStockModal";
import {
  InventoryItem,
  InventoryCategory,
  CATEGORY_LABELS,
  CATEGORY_BADGES,
} from "./types";

export function StocksPage() {
  const { has } = usePermissions();
  const canWrite = has("inventory:write");

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals & Drawer State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await apiFetch<InventoryItem[]>(`/inventory?${params.toString()}`);
      setItems(res);
    } catch (err: any) {
      setError(err.message || "Failed to load stocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleRowClick = (item: InventoryItem) => {
    setSelectedItemId(item.id);
    setIsDrawerOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleOpenAdjustModal = (item: InventoryItem) => {
    setAdjustingItem(item);
    setIsAdjustModalOpen(true);
  };

  const handleOpenSellModal = (item?: InventoryItem) => {
    setSellingItem(item || null);
    setIsSellModalOpen(true);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This will also remove its movement audit logs.`)) {
      return;
    }
    try {
      await apiFetch(`/inventory/${item.id}`, { method: "DELETE" });
      setIsDrawerOpen(false);
      setSelectedItemId(null);
      fetchItems();
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  const calculateDaysUntil = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stocks &amp; Supplies"
        description="Hair transplant surgical instruments, anesthetics, and medical consumables catalog."
        action={
          canWrite && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenSellModal()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
              >
                <TbShoppingCart className="h-4 w-4" />
                Register Sale
              </button>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-700"
              >
                <TbPlus className="h-4 w-4" />
                Add Stock Item
              </button>
            </div>
          )
        }
      />

      <InventorySubNav />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <TbSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item name, SKU, lot #, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock (Normal)</option>
              <option value="low_stock">Low Stock Alerts</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="expiring_soon">Expiring Soon (&le;60d)</option>
              <option value="has_losses">Has Broken or Stolen</option>
            </select>

            <button
              onClick={fetchItems}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <TbRefresh className={cn("h-3.5 w-3.5", loading && "animate-spin text-teal-600")} />
              Refresh
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400 mr-1">Category:</span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              selectedCategory === "all"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  isSelected
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                {catLabel}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stocks Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Item &amp; SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Shelf Location</th>
                <th className="px-4 py-3 text-center">Available Stock</th>
                <th className="px-4 py-3 text-center">Broken</th>
                <th className="px-4 py-3 text-center">Stolen</th>
                <th className="px-4 py-3">Cost / Billing</th>
                <th className="px-4 py-3">Expiration</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <TbRefresh className="mx-auto mb-2 h-6 w-6 animate-spin text-teal-600" />
                    Loading clinical stock items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <TbPackage className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-700" />
                    No inventory items matched your filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const daysLeft = calculateDaysUntil(item.expiryDate);
                  const isLow = item.stockQuantity <= item.minStockLevel;
                  const isOut = item.stockQuantity === 0;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      {/* Name & SKU */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-slate-900 hover:text-teal-600 dark:text-slate-100 dark:hover:text-teal-400">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="font-mono">{item.sku}</span>
                              {item.isSterile && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-600 dark:text-teal-400">
                                  <TbShieldCheck className="h-3 w-3" />
                                  Sterile
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-block rounded border px-2 py-0.5 text-[10px] font-medium",
                            CATEGORY_BADGES[item.category]
                          )}
                        >
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {item.storageLocation || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                            isOut
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                              : isLow
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                          )}
                        >
                          {item.stockQuantity} {item.unit}
                          {isLow && !isOut && (
                            <TbAlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          )}
                        </span>
                      </td>

                      {/* Broken (int) */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-block rounded px-2 py-0.5 text-xs font-semibold",
                            item.broken > 0
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 font-bold"
                              : "text-slate-400"
                          )}
                        >
                          {item.broken}
                        </span>
                      </td>

                      {/* Stolen (int) */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-block rounded px-2 py-0.5 text-xs font-semibold",
                            item.stolen > 0
                              ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold"
                              : "text-slate-400"
                          )}
                        >
                          {item.stolen}
                        </span>
                      </td>

                      {/* Cost / Billing */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          ₹{Number(item.costPrice).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.sellingPrice ? `₹${Number(item.sellingPrice).toFixed(2)} billable` : "Internal"}
                        </p>
                      </td>

                      {/* Expiration */}
                      <td className="px-4 py-3">
                        {item.expiryDate ? (
                          <div>
                            <p className="text-slate-700 dark:text-slate-300">{item.expiryDate}</p>
                            {daysLeft !== null && (
                              <p
                                className={cn(
                                  "text-[10px] font-medium",
                                  daysLeft <= 0
                                    ? "text-red-600 font-bold"
                                    : daysLeft <= 60
                                    ? "text-amber-600"
                                    : "text-slate-400"
                                )}
                              >
                                {daysLeft <= 0
                                  ? "EXPIRED"
                                  : daysLeft <= 60
                                  ? `${daysLeft}d left`
                                  : "Valid"}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">&mdash;</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {canWrite && (
                            <>
                              <button
                                onClick={() => handleOpenSellModal(item)}
                                disabled={item.stockQuantity <= 0}
                                title={item.stockQuantity > 0 ? `Register sale for ${item.name}` : "Out of stock"}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 dark:hover:text-emerald-400 disabled:opacity-30"
                              >
                                <TbShoppingCart className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOpenAdjustModal(item)}
                                title="Quick adjust stock or log damage/theft"
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-teal-600 dark:hover:bg-slate-800 dark:hover:text-teal-400"
                              >
                                <TbAdjustments className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleRowClick(item)}
                            title="Open detail slide-over panel"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          >
                            <TbChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Slide-over Detail Drawer */}
      <StockDetailDrawer
        itemId={selectedItemId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedItemId(null);
        }}
        onEdit={(item) => handleOpenEditModal(item)}
        onAdjust={(item) => handleOpenAdjustModal(item)}
        onSell={(item) => handleOpenSellModal(item)}
        onDelete={(item) => handleDeleteItem(item)}
        canWrite={canWrite}
      />

      {/* Add / Edit Item Modal */}
      <ItemModal
        item={editingItem}
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSuccess={() => {
          fetchItems();
          // If drawer is open on that item, reload item
          if (selectedItemId) {
            setSelectedItemId(selectedItemId);
          }
        }}
      />

      {/* Quick Adjust Modal (Receive stock, report broken, report stolen) */}
      <QuickAdjustModal
        item={adjustingItem}
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onSuccess={() => {
          fetchItems();
          // Also trigger reload of drawer if open
          if (selectedItemId) {
            setSelectedItemId(selectedItemId);
          }
        }}
      />

      {/* Sell Stock Modal */}
      <SellStockModal
        item={sellingItem}
        allItems={items}
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSuccess={() => {
          fetchItems();
          if (selectedItemId) {
            setSelectedItemId(selectedItemId);
          }
        }}
      />
    </div>
  );
}
