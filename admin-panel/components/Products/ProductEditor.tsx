"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TbArrowLeft,
  TbCheck,
  TbAlertCircle,
  TbChevronDown,
  TbEye,
  TbEyeOff,
  TbExternalLink,
  TbWand,
} from "react-icons/tb";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { ProductSchemaFieldInput, ImageField } from "./ProductSchemaFields";
import type { SectionSchema, ProductDetail, SectionData } from "./types";

const ECOMMERCE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL || "http://localhost:3300";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

const CATEGORY_OPTIONS = [
  "Kits & Combos",
  "Devices",
  "Shampoos",
  "Tablets & Supplements",
  "Topical Solutions",
];

const CONCERN_OPTIONS = [
  "Post-Transplant Care",
  "Hair Fall",
  "Regrowth",
  "Dandruff",
  "Daily Maintenance",
];

export function ProductEditor({ productId, roleSlug }: { productId: string; roleSlug: string }) {
  const { has } = usePermissions();
  const canWrite = has("products:write");

  const [schema, setSchema] = useState<SectionSchema[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [sections, setSections] = useState<SectionData>({});
  const [hidden, setHidden] = useState<string[]>([]);
  const [openSection, setOpenSection] = useState<string | null>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<SectionSchema[]>("/products/schema"),
      apiFetch<ProductDetail>(`/products/${productId}`),
    ])
      .then(([schemaData, prod]) => {
        setSchema(schemaData);
        setProduct(prod);
        setSections(prod.sections ?? {});
        setHidden(prod.hiddenSections ?? []);
      })
      .catch((err) => setMessage({ kind: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, [productId]);

  // Warn before losing edits on tab close
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const filledCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of schema) counts[s.key] = Object.keys(sections[s.key] ?? {}).length;
    return counts;
  }, [schema, sections]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-sm text-slate-500">Product not found.</p>;
  }

  const setField = (key: keyof ProductDetail, value: unknown) => {
    setProduct((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
  };

  const setSectionField = (sectionKey: string, fieldName: string, value: unknown) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] ?? {}), [fieldName]: value },
    }));
    setDirty(true);
  };

  const toggleHidden = (key: string) => {
    setHidden((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setDirty(true);
  };

  const generateSlug = () => {
    if (!product?.name) return;
    const auto = product.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setField("slug", auto);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await apiFetch<ProductDetail>(`/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: product.name,
          slug: product.slug,
          category: product.category,
          concern: product.concern,
          price: product.price,
          originalPrice: product.originalPrice,
          isSale: product.isSale,
          badge: product.badge,
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          image: product.image,
          description: product.description,
          inStock: product.inStock,
          stockQuantity: product.stockQuantity,
          isKit: product.isKit,
          status: product.status,
          sortOrder: product.sortOrder,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          sections,
          hiddenSections: hidden,
        }),
      });
      setProduct(updated);
      setSections(updated.sections ?? {});
      setDirty(false);
      setMessage({ kind: "ok", text: "Product saved successfully." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-16">
      {/* Top Header Controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/${roleSlug}/products`}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700"
          >
            <TbArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-100">
              {product.name || "Untitled Product"}
            </h1>
            <a
              href={`${ECOMMERCE_URL}/product/${product.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 hover:text-teal-600"
            >
              /product/{product.slug} <TbExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2">
            <select
              value={product.status}
              onChange={(e) => setField("status", e.target.value)}
              className={cn(inputCls, "w-auto py-1.5 font-medium")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-60 cursor-pointer"
            >
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div
          className={cn(
            "mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
            message.kind === "ok"
              ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          )}
        >
          {message.kind === "ok" ? (
            <TbCheck className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <TbAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Listing & Pricing Card */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Listing &amp; Pricing Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Product Name */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Product Title / Name
            </label>
            <input
              value={product.name}
              onChange={(e) => setField("name", e.target.value)}
              className={inputCls}
              placeholder="e.g. Post Hair Transplant Kit"
            />
          </div>

          {/* Slug with Auto Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Slug <span className="text-slate-400 font-normal">(URL Segment)</span>
              </label>
              <button
                type="button"
                onClick={generateSlug}
                title="Generate from name"
                className="text-[11px] text-teal-600 hover:text-teal-700 inline-flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <TbWand className="h-3 w-3" /> Auto
              </button>
            </div>
            <input
              value={product.slug}
              onChange={(e) => setField("slug", e.target.value)}
              className={cn(inputCls, "font-mono text-xs")}
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={product.category}
              onChange={(e) => {
                const newCat = e.target.value;
                setField("category", newCat);
                if (newCat === "Kits & Combos") {
                  setField("isKit", true);
                }
              }}
              className={inputCls}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Concern */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Hair Concern
            </label>
            <select
              value={product.concern}
              onChange={(e) => setField("concern", e.target.value)}
              className={inputCls}
            >
              {CONCERN_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Kit vs Single Product Indicator */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Is Kit / Bundle?
            </label>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isKit}
                  onChange={(e) => setField("isKit", e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Show "What's Inside Kit" section</span>
              </label>
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Selling Price (₹)
            </label>
            <input
              type="number"
              step="any"
              value={product.price}
              onChange={(e) => setField("price", parseFloat(e.target.value) || 0)}
              className={inputCls}
            />
          </div>

          {/* Original Price */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Original Price / MRP (₹) <span className="text-slate-400 font-normal">(Strike-through)</span>
            </label>
            <input
              type="number"
              step="any"
              value={product.originalPrice ?? ""}
              onChange={(e) =>
                setField(
                  "originalPrice",
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              placeholder="e.g. 3500"
              className={inputCls}
            />
          </div>

          {/* Sale Toggle & Badge */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Badge &amp; Sale Tag
            </label>
            <div className="flex items-center gap-2">
              <input
                value={product.badge ?? ""}
                onChange={(e) => setField("badge", e.target.value)}
                placeholder="e.g. Best Seller / Sale"
                className={inputCls}
              />
              <label className="flex items-center gap-1 text-xs font-medium whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isSale}
                  onChange={(e) => setField("isSale", e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Sale</span>
              </label>
            </div>
          </div>

          {/* In Stock & Quantity */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Stock Status
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) => setField("inStock", e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>In Stock</span>
              </label>
              <input
                type="number"
                value={product.stockQuantity}
                onChange={(e) => setField("stockQuantity", parseInt(e.target.value) || 0)}
                placeholder="Qty"
                className={cn(inputCls, "w-24 py-1 text-xs")}
              />
            </div>
          </div>

          {/* Rating & Review Count */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Rating &amp; Reviews Count
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={product.rating}
                onChange={(e) => setField("rating", parseFloat(e.target.value) || 5.0)}
                className={cn(inputCls, "w-24")}
              />
              <input
                type="number"
                value={product.reviewsCount}
                onChange={(e) => setField("reviewsCount", parseInt(e.target.value) || 0)}
                placeholder="Count"
                className={inputCls}
              />
            </div>
          </div>

          {/* Main Product Image Link with MediaPicker and Preview */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Main Product Image <span className="text-slate-400 font-normal">— Direct Image URL Link (or choose from Media Library)</span>
            </label>
            <ImageField
              value={product.image ?? ""}
              onChange={(v) => setField("image", v)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          {/* Card Description */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Product Summary Description
            </label>
            <textarea
              rows={2}
              value={product.description}
              onChange={(e) => setField("description", e.target.value)}
              className={cn(inputCls, "resize-y")}
              placeholder="Brief summary displayed on cards and hero intro..."
            />
          </div>

          {/* SEO Meta */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              SEO Title
            </label>
            <input
              value={product.seoTitle ?? ""}
              onChange={(e) => setField("seoTitle", e.target.value)}
              placeholder="e.g. URoots Hair Kit | Anwar Clinic"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              SEO Description
            </label>
            <input
              value={product.seoDescription ?? ""}
              onChange={(e) => setField("seoDescription", e.target.value)}
              placeholder="Meta description for search engines..."
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Page Sections Accordion */}
      <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Product Detail Page Sections
      </h2>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Customize rich content blocks on the product's detail page. Switch off any section with the eye icon to hide it.
      </p>

      <div className="flex flex-col gap-2">
        {schema.map((section) => {
          const isOpen = openSection === section.key;
          const isHidden = hidden.includes(section.key);
          const count = filledCount[section.key] ?? 0;
          const sectionValues = sections[section.key] ?? {};

          return (
            <div
              key={section.key}
              className={cn(
                "rounded-xl border bg-white transition dark:bg-slate-900",
                isHidden
                  ? "border-dashed border-slate-300 opacity-60 dark:border-slate-800"
                  : "border-slate-200 dark:border-slate-800"
              )}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  onClick={() => setOpenSection(isOpen ? null : section.key)}
                  className="flex flex-1 items-center gap-3 text-left cursor-pointer"
                >
                  <TbChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {section.label}
                      </span>
                      {count > 0 && (
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                          {count} customized
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {section.description}
                    </p>
                  </div>
                </button>

                {canWrite && (
                  <button
                    type="button"
                    onClick={() => toggleHidden(section.key)}
                    title={isHidden ? "Show section on page" : "Hide section from page"}
                    className={cn(
                      "ml-2 rounded-lg p-1.5 transition cursor-pointer",
                      isHidden
                        ? "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    )}
                  >
                    {isHidden ? <TbEyeOff className="h-4 w-4" /> : <TbEye className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 p-4 dark:border-slate-800 space-y-4">
                  {section.fields.map((f) => (
                    <ProductSchemaFieldInput
                      key={f.name}
                      field={f}
                      value={sectionValues[f.name]}
                      onChange={(v) => setSectionField(section.key, f.name, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
