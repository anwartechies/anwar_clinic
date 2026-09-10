"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { TbArrowLeft, TbAlertCircle } from "react-icons/tb";
import { apiFetch } from "@/lib/api";
import { RequirePermission } from "@/components/UI/Guards";
import { ImageField } from "@/components/Products/ProductSchemaFields";
import { cn } from "@/lib/utils";

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

function NewProductForm() {
  const router = useRouter();
  const roleSlug = usePathname().split("/")[1] || "";

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Kits & Combos");
  const [concern, setConcern] = useState("Post-Transplant Care");
  const [price, setPrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [isKit, setIsKit] = useState(true);
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a product title.");
      return;
    }
    if (price === "" || isNaN(Number(price))) {
      setError("Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await apiFetch<any>("/products", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          category,
          concern,
          price: Number(price),
          originalPrice: originalPrice !== "" ? Number(originalPrice) : null,
          image: image.trim(),
          description: description.trim(),
          isKit: category === "Kits & Combos" ? true : isKit,
          status,
        }),
      });

      router.push(`/${roleSlug}/products/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create product");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/${roleSlug}/products`}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700"
        >
          <TbArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Add New Product
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fill in the essential product details, then customize rich page sections in the editor.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <TbAlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. URoots Clinical Scalp Treatment Kit"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value === "Kits & Combos") setIsKit(true);
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

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Hair Concern
            </label>
            <select
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              className={inputCls}
            >
              {CONCERN_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Selling Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              required
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? parseFloat(e.target.value) : "")
              }
              placeholder="e.g. 2499"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Original Price / MRP (₹) <span className="text-slate-400 font-normal">(Strike-through)</span>
            </label>
            <input
              type="number"
              step="any"
              value={originalPrice}
              onChange={(e) =>
                setOriginalPrice(e.target.value ? parseFloat(e.target.value) : "")
              }
              placeholder="e.g. 2999"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Main Image URL Link <span className="text-slate-400 font-normal">(or pick from Media Library)</span>
          </label>
          <ImageField
            value={image}
            onChange={setImage}
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Short Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short overview teaser displayed on cards..."
            className={cn(inputCls, "resize-y")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={inputCls}
            >
              <option value="published">Published (Visible on store)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isKit}
                onChange={(e) => setIsKit(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span>Is Kit / Bundle (Shows "What's Inside Kit")</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Link
            href={`/${roleSlug}/products`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60 cursor-pointer shadow-xs"
          >
            {submitting ? "Creating…" : "Create & Continue to Editor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <RequirePermission permissions={["products:write"]}>
      <NewProductForm />
    </RequirePermission>
  );
}
