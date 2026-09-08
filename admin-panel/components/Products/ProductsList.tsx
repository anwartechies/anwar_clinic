"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TbPlus,
  TbSearch,
  TbEdit,
  TbTrash,
  TbEye,
  TbEyeOff,
  TbExternalLink,
  TbShoppingBag,
  TbCheck,
  TbAlertCircle,
} from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "./types";

const ECOMMERCE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL || "http://localhost:3300";

const CATEGORIES = [
  "All",
  "Kits & Combos",
  "Devices",
  "Shampoos",
  "Tablets & Supplements",
  "Topical Solutions",
];

export function ProductsList({ roleSlug }: { roleSlug: string }) {
  const { has } = usePermissions();
  const canWrite = has("products:write");

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusTab, setStatusTab] = useState<"all" | "published" | "draft">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<ProductSummary[]>("/products");
      setProducts(data);
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || "Failed to load products" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await apiFetch<{ id: string; status: "draft" | "published" }>(
        `/products/${id}/toggle-status`,
        { method: "PATCH" }
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: res.status } : p))
      );
      setMessage({ kind: "ok", text: `Product status updated to ${res.status}.` });
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || "Failed to update status" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(id);
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage({ kind: "ok", text: "Product deleted successfully." });
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || "Failed to delete product" });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.concern.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "All" || p.category === selectedCategory;

      const matchesStatus =
        statusTab === "all" || p.status === statusTab;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, search, selectedCategory, statusTab]);

  const counts = useMemo(() => {
    return {
      all: products.length,
      published: products.filter((p) => p.status === "published").length,
      draft: products.filter((p) => p.status === "draft").length,
    };
  }, [products]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TbShoppingBag className="h-6 w-6 text-teal-600" />
            Ecommerce Products
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage products, pricing, stock, clinical benefits, kit items, and details for the store.
          </p>
        </div>

        {canWrite && (
          <Link
            href={`/${roleSlug}/products/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 shadow-xs cursor-pointer"
          >
            <TbPlus className="h-4 w-4" /> Add Product
          </Link>
        )}
      </div>

      {message && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
            message.kind === "ok"
              ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          )}
        >
          {message.kind === "ok" ? (
            <TbCheck className="h-4 w-4 shrink-0" />
          ) : (
            <TbAlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Controls Bar: Search & Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1">
          <button
            type="button"
            onClick={() => setStatusTab("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
              statusTab === "all"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:text-black dark:text-slate-400"
            )}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusTab("published")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
              statusTab === "published"
                ? "bg-teal-600 text-white"
                : "text-slate-600 hover:text-teal-600 dark:text-slate-400"
            )}
          >
            Published ({counts.published})
          </button>
          <button
            type="button"
            onClick={() => setStatusTab("draft")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
              statusTab === "draft"
                ? "bg-amber-600 text-white"
                : "text-slate-600 hover:text-amber-600 dark:text-slate-400"
            )}
          >
            Draft ({counts.draft})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer border",
              selectedCategory === cat
                ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold dark:bg-teal-950/40 dark:border-teal-700 dark:text-teal-200"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <TbShoppingBag className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No products found
            </p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or category filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category / Concern</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Thumbnail & Title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#ebe6df] border border-slate-200 dark:border-slate-800">
                          {p.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <TbShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <Link
                            href={`/${roleSlug}/products/${p.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-600 dark:text-slate-100 line-clamp-1"
                          >
                            {p.name}
                          </Link>
                          <span className="block font-mono text-[10px] text-slate-400 truncate">
                            /product/{p.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Concern */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {p.category}
                        </span>
                        <span className="text-[10.5px] text-slate-500">
                          {p.concern}
                        </span>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {formatPrice(p.price)}
                        </span>
                        {p.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatPrice(p.originalPrice)}
                          </span>
                        )}
                        {p.isSale && (
                          <span className="rounded bg-[#b1fc85] text-black px-1 text-[9px] font-bold">
                            SALE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          p.inStock
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            p.inStock ? "bg-emerald-500" : "bg-red-500"
                          )}
                        />
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          p.status === "published"
                            ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        )}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View on Store */}
                        <a
                          href={`${ECOMMERCE_URL}/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on store"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-teal-600 dark:hover:bg-slate-800"
                        >
                          <TbExternalLink className="h-4 w-4" />
                        </a>

                        {canWrite && (
                          <>
                            {/* Toggle Publish/Draft */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p.id)}
                              title={
                                p.status === "published"
                                  ? "Unpublish to draft"
                                  : "Publish to store"
                              }
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              {p.status === "published" ? (
                                <TbEye className="h-4 w-4 text-teal-600" />
                              ) : (
                                <TbEyeOff className="h-4 w-4 text-amber-600" />
                              )}
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/${roleSlug}/products/${p.id}`}
                              title="Edit product"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-teal-600 dark:hover:bg-slate-800"
                            >
                              <TbEdit className="h-4 w-4" />
                            </Link>

                            {/* Delete */}
                            <button
                              type="button"
                              disabled={deletingId === p.id}
                              onClick={() => handleDelete(p.id, p.name)}
                              title="Delete product"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 cursor-pointer"
                            >
                              <TbTrash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
