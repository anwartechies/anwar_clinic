"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TbPlus,
  TbSearch,
  TbEdit,
  TbTrash,
  TbEye,
  TbExternalLink,
  TbArticle,
  TbCheck,
  TbAlertCircle,
  TbX,
  TbStar,
} from "react-icons/tb";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import type { BlogItem } from "./types";

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3200";

export function BlogsList({ roleSlug }: { roleSlug: string }) {
  const { has } = usePermissions();
  const canWrite = has("blogs:write");

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const fetchBlogs = () => {
    setLoading(true);
    apiFetch<BlogItem[]>("/blogs")
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch((err) => setMessage({ kind: "error", text: err.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = b.title?.toLowerCase().includes(query);
        const matchesExcerpt = b.excerpt?.toLowerCase().includes(query);
        const matchesCategory = b.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesExcerpt && !matchesCategory) return false;
      }
      return true;
    });
  }, [blogs, statusFilter, categoryFilter, search]);

  const handleToggleStatus = async (blog: BlogItem) => {
    if (!canWrite) return;
    try {
      const res = await apiFetch<{ status: "draft" | "published"; message: string }>(
        `/blogs/${blog.id}/toggle-status`,
        { method: "PATCH" }
      );
      setBlogs((prev) =>
        prev.map((item) => (item.id === blog.id ? { ...item, status: res.status } : item))
      );
      setMessage({ kind: "ok", text: res.message });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!canWrite) return;
    try {
      await apiFetch(`/blogs/${id}`, { method: "DELETE" });
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      setDeletingId(null);
      setMessage({ kind: "ok", text: "Blog deleted successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Blog Posts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage articles, patient guides, and clinic educational content.
          </p>
        </div>

        {canWrite && (
          <Link
            href={`/${roleSlug}/blogs/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition"
          >
            <TbPlus className="h-4 w-4" />
            New Blog Post
          </Link>
        )}
      </div>

      {/* Feedback message */}
      {message && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg p-3 text-sm",
            message.kind === "ok"
              ? "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
              : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          )}
        >
          {message.kind === "ok" ? (
            <TbCheck className="h-4 w-4 shrink-0 text-teal-600" />
          ) : (
            <TbAlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, excerpt or category…"
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 text-xs font-medium">
          {(["all", "published", "draft"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 capitalize transition",
                statusFilter === tab
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table / List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <TbArticle className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              No blog posts found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
              {search || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Create your first clinic blog post to share medical insights and patient guidance."}
            </p>
            {canWrite && (
              <Link
                href={`/${roleSlug}/blogs/new`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-teal-700 transition"
              >
                <TbPlus className="h-4 w-4" /> Create Blog
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
                <tr>
                  <th className="px-5 py-3.5">Post</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Author</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Published Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredBlogs.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Post Title & Thumbnail */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5 max-w-md">
                        {b.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.coverImage}
                            alt=""
                            className="h-12 w-16 shrink-0 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                            <TbArticle className="h-6 w-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {b.featured && (
                              <span className="inline-flex items-center gap-0.5 rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                                <TbStar className="h-3 w-3 fill-amber-500 text-amber-500" />
                                Spotlight
                              </span>
                            )}
                            <Link
                              href={`/${roleSlug}/blogs/${b.id}`}
                              className="font-semibold text-slate-900 hover:text-teal-600 dark:text-slate-100 dark:hover:text-teal-400 truncate block"
                            >
                              {b.title}
                            </Link>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {b.excerpt || "No excerpt provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {b.category || "General"}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-xs">
                        <span className="font-medium text-slate-900 dark:text-slate-100 block">
                          {b.authorName}
                        </span>
                        <span className="text-slate-400">{b.authorRole}</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(b)}
                        disabled={!canWrite}
                        title={canWrite ? "Click to toggle publish status" : undefined}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition cursor-pointer disabled:cursor-default",
                          b.status === "published"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            b.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                          )}
                        />
                        <span className="capitalize">{b.status}</span>
                      </button>
                    </td>

                    {/* Published Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                      {b.publishedAt
                        ? new Date(b.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Live on Landing Page */}
                        <a
                          href={`${LANDING_URL}/blogs/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="View on Landing Page"
                        >
                          <TbExternalLink className="h-4 w-4" />
                        </a>

                        {/* Edit */}
                        <Link
                          href={`/${roleSlug}/blogs/${b.id}`}
                          className="rounded p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                          title="Edit Post"
                        >
                          <TbEdit className="h-4 w-4" />
                        </Link>

                        {/* Delete */}
                        {canWrite && (
                          <button
                            type="button"
                            onClick={() => setDeletingId(b.id)}
                            className="rounded p-1.5 text-slate-400 hover:text-rose-600"
                            title="Delete Post"
                          >
                            <TbTrash className="h-4 w-4" />
                          </button>
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

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <TbTrash className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Delete Blog Post?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action cannot be undone. The post will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
