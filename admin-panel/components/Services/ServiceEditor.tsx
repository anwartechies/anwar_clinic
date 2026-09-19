"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageField } from "./ImageField";
import Link from "next/link";
import {
  TbArrowLeft, TbCheck, TbAlertCircle, TbChevronDown, TbEye, TbEyeOff, TbExternalLink,
} from "react-icons/tb";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { SchemaFieldInput } from "./SchemaFields";
import type { SectionSchema, ServiceDetail, SectionData } from "./types";

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3200";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

export function ServiceEditor({ serviceId, roleSlug }: { serviceId: string; roleSlug: string }) {
  const { has } = usePermissions();
  const canWrite = has("services:write");

  const [schema, setSchema] = useState<SectionSchema[]>([]);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [sections, setSections] = useState<SectionData>({});
  const [hidden, setHidden] = useState<string[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<SectionSchema[]>("/services/schema"),
      apiFetch<ServiceDetail>(`/services/${serviceId}`),
    ])
      .then(([schemaData, svc]) => {
        setSchema(schemaData);
        setService(svc);
        setSections(svc.sections ?? {});
        setHidden(svc.hiddenSections ?? []);
      })
      .catch((err) => setMessage({ kind: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, [serviceId]);

  // Warn before losing edits on an accidental tab close.
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
  if (!service) {
    return <p className="text-sm text-slate-500">Service not found.</p>;
  }

  const setField = (key: keyof ServiceDetail, value: unknown) => {
    setService((prev) => (prev ? { ...prev, [key]: value } : prev));
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

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await apiFetch<ServiceDetail>(`/services/${serviceId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: service.title,
          slug: service.slug,
          cardDescription: service.cardDescription,
          cardImage: service.cardImage,
          badge: service.badge,
          status: service.status,
          seoTitle: service.seoTitle,
          seoDescription: service.seoDescription,
          sections,
          hiddenSections: hidden,
        }),
      });
      setService(updated);
      setSections(updated.sections ?? {});
      setDirty(false);
      setMessage({ kind: "ok", text: "Saved." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/${roleSlug}/services`}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700"
          >
            <TbArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-100">
              {service.title || "Untitled service"}
            </h1>
            <a
              href={`${LANDING_URL}/services/${service.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 hover:text-teal-600"
            >
              /services/{service.slug} <TbExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2">
            <select
              value={service.status}
              onChange={(e) => setField("status", e.target.value)}
              className={cn(inputCls, "w-auto py-1.5")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-60"
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

      {/* Card / listing details */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Listing &amp; SEO
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input value={service.title} onChange={(e) => setField("title", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Slug <span className="text-slate-400">— changing this changes the page URL</span>
            </label>
            <input value={service.slug} onChange={(e) => setField("slug", e.target.value)} className={cn(inputCls, "font-mono text-xs")} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Card description</label>
            <textarea rows={2} value={service.cardDescription} onChange={(e) => setField("cardDescription", e.target.value)} className={cn(inputCls, "resize-y")} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Badge</label>
            <input value={service.badge ?? ""} onChange={(e) => setField("badge", e.target.value)} placeholder="Most Popular" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Card image</label>
            <ImageField value={service.cardImage ?? ""} onChange={(v) => setField("cardImage", v)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">SEO title</label>
            <input value={service.seoTitle ?? ""} onChange={(e) => setField("seoTitle", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">SEO description</label>
            <textarea rows={2} value={service.seoDescription ?? ""} onChange={(e) => setField("seoDescription", e.target.value)} className={cn(inputCls, "resize-y")} />
          </div>
        </div>
      </div>

      {/* Page sections */}
      <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Page sections</h2>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Leave a field empty to use the built-in default. Every section renders whether you fill it in
        or not — switch one off with the eye icon to drop it from this service&apos;s page.
      </p>

      <div className="flex flex-col gap-2">
        {schema.map((section) => {
          const isHidden = hidden.includes(section.key);
          const isOpen = openSection === section.key;
          const filled = filledCount[section.key] ?? 0;
          return (
            <div
              key={section.key}
              className={cn(
                "rounded-xl border bg-white transition dark:bg-slate-900",
                isHidden ? "border-slate-200 opacity-60 dark:border-slate-800" : "border-slate-200 dark:border-slate-800"
              )}
            >
              <div className="flex items-center gap-2 p-3">
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.key)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <TbChevronDown
                    className={cn("h-4 w-4 shrink-0 text-slate-400 transition", isOpen && "rotate-180")}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {section.label}
                      {isHidden && <span className="ml-2 text-xs font-normal text-slate-400">hidden</span>}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {section.fields.length === 0
                        ? "Shared content — toggle only"
                        : filled > 0
                          ? `${filled} of ${section.fields.length} field${section.fields.length === 1 ? "" : "s"} customised`
                          : `Using defaults · ${section.fields.length} field${section.fields.length === 1 ? "" : "s"}`}
                    </span>
                  </span>
                </button>
                {canWrite && (
                  <button
                    onClick={() => toggleHidden(section.key)}
                    title={isHidden ? "Show this section" : "Hide this section"}
                    className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:text-slate-700 dark:border-slate-700"
                  >
                    {isHidden ? <TbEyeOff className="h-4 w-4" /> : <TbEye className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{section.description}</p>
                  {section.fields.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      This section has no per-service fields.
                    </p>
                  ) : (
                    <fieldset disabled={!canWrite} className="flex flex-col gap-4">
                      {section.fields.map((field) => (
                        <SchemaFieldInput
                          key={field.name}
                          field={field}
                          value={sections[section.key]?.[field.name]}
                          onChange={(v) => setSectionField(section.key, field.name, v)}
                        />
                      ))}
                    </fieldset>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
