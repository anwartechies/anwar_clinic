"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TbX, TbPhoto, TbUpload, TbLoader2 } from "react-icons/tb";
import { apiFetch, apiUpload } from "@/lib/api";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/context/PermissionsContext";

interface MediaAsset {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
}

interface MediaConfig {
  maxUploadBytes: number;
  allowedMimeTypes: string[];
}

// Lets an image field pull a URL straight from the Media Library — or upload a
// new image right here, so adding a photo never means leaving the editor and
// losing unsaved changes.
export function MediaPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
}) {
  const { has } = usePermissions();
  const canUpload = has("media:write");

  // null = not fetched yet for this opening; the loading flag is derived from
  // it rather than written synchronously inside the effect.
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [config, setConfig] = useState<MediaConfig | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const loading = open && assets === null;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError("");
    apiFetch<MediaAsset[]>("/media")
      .then((list) => {
        if (!cancelled) setAssets(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setAssets([]);
      });
    apiFetch<MediaConfig>("/media/config")
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  const upload = useCallback(
    async (file: File) => {
      // Check against the server's own limits first, so an oversized or
      // unsupported file fails instantly instead of after a long upload.
      if (config && !config.allowedMimeTypes.includes(file.type) && !file.type.startsWith("image/")) {
        setError(`${file.type || "That file type"} can't be uploaded here.`);
        return;
      }
      if (config && file.size > config.maxUploadBytes) {
        setError(
          `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is ${Math.round(
            config.maxUploadBytes / 1024 / 1024
          )}MB.`
        );
        return;
      }
      setUploading(true);
      setError("");
      try {
        const asset = await apiUpload<MediaAsset>("/media/upload", file);
        setAssets((prev) => [asset, ...(prev ?? [])]);
        // Uploading in a picker means "I want this one" — select it and close.
        onPick(asset.url);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [config, onPick, onClose]
  );

  if (!open) return null;

  const images = (assets ?? []).filter((a) => a.mimeType.startsWith("image/"));
  const maxMb = config ? Math.round(config.maxUploadBytes / 1024 / 1024) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl dark:bg-slate-900"
        onDragOver={(e) => {
          if (!canUpload) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (!canUpload) return;
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {canUpload ? "Choose or upload an image" : "Choose from Media Library"}
          </h3>
          <div className="flex items-center gap-2">
            {canUpload && (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file);
                    e.target.value = ""; // allow re-picking the same file
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
                >
                  {uploading ? <TbLoader2 className="h-4 w-4 animate-spin" /> : <TbUpload className="h-4 w-4" />}
                  {uploading ? "Uploading…" : "Upload"}
                </button>
              </>
            )}
            <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600">
              <TbX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <div className={cn("flex-1 overflow-y-auto p-4", dragging && "bg-teal-50/60 dark:bg-teal-950/20")}>
          {dragging ? (
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-teal-400 text-sm font-medium text-teal-700 dark:text-teal-400">
              Drop the image to upload it
            </div>
          ) : loading ? (
            <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <TbPhoto className="mb-2 h-6 w-6 text-slate-400" />
              <p className="text-sm text-slate-500">
                {canUpload
                  ? "No images yet — upload one with the button above, or drag a file here."
                  : "No images yet — upload some in the Media tab."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onPick(a.url);
                    onClose();
                  }}
                  className="group overflow-hidden rounded-lg border border-slate-200 transition hover:border-teal-400 dark:border-slate-700"
                >
                  <span className="flex h-24 items-center justify-center bg-slate-50 dark:bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs */}
                    <img src={a.url} alt={a.originalName} className="h-full w-full object-contain" />
                  </span>
                  <span className="block truncate px-2 py-1.5 text-left text-[11px] text-slate-600 dark:text-slate-400">
                    {a.originalName}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {canUpload && (
          <p className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800">
            Drag an image anywhere onto this window to upload it{maxMb ? ` · up to ${maxMb}MB` : ""} · uploads are
            added to the Media Library
          </p>
        )}
      </div>
    </div>
  );
}
