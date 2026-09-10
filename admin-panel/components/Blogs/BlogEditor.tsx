"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TbArrowLeft,
  TbCheck,
  TbAlertCircle,
  TbPhoto,
  TbPlus,
  TbTrash,
  TbEye,
  TbCode,
  TbSparkles,
  TbCalendar,
  TbClock,
  TbExternalLink,
} from "react-icons/tb";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { TipTapEditor } from "./TipTapEditor";
import { MediaPicker } from "../Services/MediaPicker";
import type { BlogDetail, BlogFormData, BlogFaq } from "./types";

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3200";

const PRESET_CATEGORIES = [
  "Hair Transplant",
  "Recovery & Aftercare",
  "PRP & Non-Surgical",
  "Beard & Eyebrow",
  "Hair Care Tips",
  "Clinical Research",
];

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

function slugify(raw: string) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculateReadTime(text: string): string {
  const words = text.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function BlogEditor({
  blogId,
  roleSlug,
  isNew = false,
}: {
  blogId?: string;
  roleSlug: string;
  isNew?: boolean;
}) {
  const router = useRouter();
  const { has } = usePermissions();
  const canWrite = has("blogs:write");

  const [form, setForm] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Hair Transplant",
    tags: [],
    authorName: "Dr. Anwar",
    authorRole: "Lead Surgeon & Hair Specialist",
    authorAvatar: "",
    coverImage: "",
    readTime: "5 min read",
    publishedAt: new Date().toISOString().slice(0, 16),
    status: "draft",
    featured: false,
    metaTitle: "",
    metaDescription: "",
    faqs: [],
  });

  const [customCategory, setCustomCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSlug, setAutoSlug] = useState(isNew);

  useEffect(() => {
    if (isNew || !blogId) return;

    apiFetch<BlogDetail>(`/blogs/${blogId}`)
      .then((blog) => {
        setForm({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          category: blog.category || "Hair Transplant",
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          authorName: blog.authorName || "Dr. Anwar",
          authorRole: blog.authorRole || "Lead Surgeon & Hair Specialist",
          authorAvatar: blog.authorAvatar || "",
          coverImage: blog.coverImage || "",
          readTime: blog.readTime || "5 min read",
          publishedAt: blog.publishedAt
            ? new Date(blog.publishedAt).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          status: blog.status || "draft",
          featured: Boolean(blog.featured),
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          faqs: Array.isArray(blog.faqs) ? blog.faqs : [],
        });
        if (!PRESET_CATEGORIES.includes(blog.category)) {
          setCustomCategory(blog.category);
        }
      })
      .catch((err) => setMessage({ kind: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, [blogId, isNew]);

  // Protect against accidental navigation
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleTitleChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug ? slugify(val) : prev.slug,
    }));
    setDirty(true);
  };

  const handleContentChange = (html: string) => {
    setForm((prev) => ({
      ...prev,
      content: html,
      readTime: calculateReadTime(html),
    }));
    setDirty(true);
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || form.tags.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    setTagInput("");
    setDirty(true);
  };

  const removeTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
    setDirty(true);
  };

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
    setDirty(true);
  };

  const updateFaq = (index: number, field: "question" | "answer", val: string) => {
    setForm((prev) => {
      const nextFaqs = [...prev.faqs];
      nextFaqs[index] = { ...nextFaqs[index], [field]: val };
      return { ...prev, faqs: nextFaqs };
    });
    setDirty(true);
  };

  const removeFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
    setDirty(true);
  };

  const save = async (explicitStatus?: "draft" | "published") => {
    if (!form.title.trim()) {
      setMessage({ kind: "error", text: "Please provide a blog title." });
      return;
    }
    setSaving(true);
    setMessage(null);

    const payload = {
      ...form,
      status: explicitStatus || form.status,
      category: customCategory.trim() ? customCategory.trim() : form.category,
      publishedAt: new Date(form.publishedAt).toISOString(),
    };

    try {
      if (isNew) {
        const created = await apiFetch<BlogDetail>("/blogs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setDirty(false);
        setMessage({ kind: "ok", text: "Blog post created successfully!" });
        router.push(`/${roleSlug}/blogs/${created.id}`);
      } else {
        await apiFetch(`/blogs/${blogId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (explicitStatus) {
          setForm((prev) => ({ ...prev, status: explicitStatus }));
        }
        setDirty(false);
        setMessage({ kind: "ok", text: "Changes saved successfully!" });
      }
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || "Failed to save blog post." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${roleSlug}/blogs`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <TbArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isNew ? "Create New Blog Post" : "Edit Blog Post"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {form.status === "published" ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Draft
                </span>
              )}
              {form.slug && (
                <>
                  {" · "}
                  <a
                    href={`${LANDING_URL}/blogs/${form.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-teal-600 inline-flex items-center gap-0.5"
                  >
                    /blogs/{form.slug}
                    <TbExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <TbEye className="h-4 w-4" />
              {previewMode ? "Editor View" : "Preview"}
            </button>
          )}

          {canWrite && (
            <>
              <button
                type="button"
                onClick={() => save("draft")}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => save("published")}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition"
              >
                <TbCheck className="h-4 w-4" />
                {saving ? "Saving…" : form.status === "published" ? "Update Post" : "Publish Post"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status banner feedback */}
      {message && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg p-3.5 text-sm",
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

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Article Content */}
        <div className="lg:col-span-2 space-y-6">
          {previewMode ? (
            /* Live Preview Box */
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 mb-3">
                {form.category}
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                {form.title || "Untitled Post"}
              </h1>
              {form.coverImage && (
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.coverImage}
                    alt={form.title}
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}
              {form.excerpt && (
                <p className="text-lg italic text-slate-600 dark:text-slate-300 mb-6 border-l-4 border-teal-500 pl-4">
                  {form.excerpt}
                </p>
              )}
              <div
                className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          ) : (
            /* Edit Form */
            <>
              {/* Title & Slug */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Post Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. FUE vs FUT Hair Transplant: Which Technique Is Best?"
                    className={cn(inputCls, "text-base font-medium")}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      URL Slug
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoSlug(!autoSlug)}
                      className="text-xs text-teal-600 hover:underline"
                    >
                      {autoSlug ? "Unlock slug" : "Auto-sync from title"}
                    </button>
                  </div>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                    <span className="text-slate-400 select-none">/blogs/</span>
                    <input
                      type="text"
                      value={form.slug}
                      readOnly={autoSlug}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                        setDirty(true);
                      }}
                      className="flex-1 bg-transparent text-slate-900 outline-none dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Excerpt / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, excerpt: e.target.value }));
                      setDirty(true);
                    }}
                    placeholder="Brief 1-2 sentence overview shown in blog cards and social previews…"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Rich Content Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Article Content <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">{form.readTime}</span>
                </div>
                <TipTapEditor value={form.content} onChange={handleContentChange} />
              </div>

              {/* FAQs Section */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Frequently Asked Questions (FAQs)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Helpful Q&A items rendered at the bottom of the article.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <TbPlus className="h-3.5 w-3.5" /> Add FAQ
                  </button>
                </div>

                {form.faqs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No FAQs added yet. Click &quot;Add FAQ&quot; to include patient questions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-950/50 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(idx, "question", e.target.value)}
                            placeholder="Question (e.g. Is hair transplant painful?)"
                            className={cn(inputCls, "text-xs font-medium")}
                          />
                          <button
                            type="button"
                            onClick={() => removeFaq(idx)}
                            className="rounded p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          >
                            <TbTrash className="h-4 w-4" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                          placeholder="Answer details…"
                          className={cn(inputCls, "text-xs")}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right 1 Column: Meta & Publishing Controls */}
        <div className="space-y-6">
          {/* Publishing Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Publishing Settings
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Post Status
              </label>
              <select
                value={form.status}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, status: e.target.value as any }));
                  setDirty(true);
                }}
                className={inputCls}
              >
                <option value="draft">Draft (hidden from public)</option>
                <option value="published">Published (live on website)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Publish Date & Time
              </label>
              <input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, publishedAt: e.target.value }));
                  setDirty(true);
                }}
                className={inputCls}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, featured: e.target.checked }));
                  setDirty(true);
                }}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Feature as Spotlight Hero Article
              </span>
            </label>
          </div>

          {/* Category & Tags */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category & Tags
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={
                  PRESET_CATEGORIES.includes(form.category) && !customCategory
                    ? form.category
                    : "custom"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setCustomCategory(form.category || "General");
                  } else {
                    setCustomCategory("");
                    setForm((prev) => ({ ...prev, category: val }));
                  }
                  setDirty(true);
                }}
                className={inputCls}
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">Other (Custom Category)</option>
              </select>

              {customCategory !== "" && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    setForm((prev) => ({ ...prev, category: e.target.value }));
                    setDirty(true);
                  }}
                  placeholder="Enter category name…"
                  className={cn(inputCls, "mt-2")}
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Type tag & press enter…"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-lg bg-slate-100 px-3 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="hover:text-rose-500 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Cover Image */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Featured Cover Image
            </h3>

            {form.coverImage ? (
              <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverImage}
                  alt="Cover Preview"
                  className="h-40 w-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCoverPickerOpen(true)}
                    className="rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80 text-xs backdrop-blur-xs"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, coverImage: "" }));
                      setDirty(true);
                    }}
                    className="rounded-md bg-rose-600/80 p-1.5 text-white hover:bg-rose-600 text-xs backdrop-blur-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCoverPickerOpen(true)}
                className="flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/20 dark:border-slate-700 dark:hover:border-teal-500 transition"
              >
                <TbPhoto className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Select from Media Library
                </span>
              </button>
            )}

            <input
              type="text"
              value={form.coverImage || ""}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, coverImage: e.target.value }));
                setDirty(true);
              }}
              placeholder="Or paste external image URL…"
              className={cn(inputCls, "text-xs")}
            />
          </div>

          {/* Author Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Author Info
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={form.authorName}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, authorName: e.target.value }));
                  setDirty(true);
                }}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Author Designation / Role
              </label>
              <input
                type="text"
                value={form.authorRole}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, authorRole: e.target.value }));
                  setDirty(true);
                }}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Author Photo URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.authorAvatar || ""}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, authorAvatar: e.target.value }));
                    setDirty(true);
                  }}
                  placeholder="https://…"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setAvatarPickerOpen(true)}
                  className="rounded-lg bg-slate-100 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 shrink-0"
                >
                  Pick
                </button>
              </div>
            </div>
          </div>

          {/* SEO & Search Preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              SEO & Social Meta
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={form.metaTitle || ""}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, metaTitle: e.target.value }));
                  setDirty(true);
                }}
                placeholder={form.title || "Title shown in Google search…"}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={form.metaDescription || ""}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, metaDescription: e.target.value }));
                  setDirty(true);
                }}
                placeholder={form.excerpt || "Description for search engine snippets…"}
                className={inputCls}
              />
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 text-xs">
              <span className="text-[11px] text-slate-400 block mb-1">Google Search Preview:</span>
              <p className="text-blue-600 dark:text-blue-400 font-medium truncate">
                {form.metaTitle || form.title || "Article Headline"} | Anwar Clinic
              </p>
              <p className="text-emerald-700 dark:text-emerald-400 text-[11px] truncate">
                {LANDING_URL}/blogs/{form.slug || "article-slug"}
              </p>
              <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                {form.metaDescription || form.excerpt || "Read more about hair restoration on Anwar Clinic."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modals */}
      <MediaPicker
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onPick={(url) => {
          setForm((prev) => ({ ...prev, coverImage: url }));
          setDirty(true);
        }}
      />
      <MediaPicker
        open={avatarPickerOpen}
        onClose={() => setAvatarPickerOpen(false)}
        onPick={(url) => {
          setForm((prev) => ({ ...prev, authorAvatar: url }));
          setDirty(true);
        }}
      />
    </div>
  );
}
