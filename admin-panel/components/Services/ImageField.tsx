"use client";

import { useState } from "react";
import { TbPhoto } from "react-icons/tb";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./MediaPicker";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

/**
 * One image field: paste a URL, or pick/upload one through the Media Library
 * without leaving the editor. Shared by the service section fields, the service
 * card image and the product fields so they all behave the same.
 */
export function ImageField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [picking, setPicking] = useState(false);
  return (
    <>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://…"}
          className={cn(inputCls, "font-mono text-xs")}
        />
        <button
          type="button"
          onClick={() => setPicking(true)}
          title="Choose or upload an image"
          className="shrink-0 rounded-lg border border-slate-300 px-2.5 text-slate-500 transition hover:border-teal-400 hover:text-teal-600 dark:border-slate-700"
        >
          <TbPhoto className="h-4 w-4" />
        </button>
      </div>
      {value && (
        <span className="mt-1.5 block h-16 w-fit overflow-hidden rounded border border-slate-200 dark:border-slate-700">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary content URLs */}
          <img src={value} alt="" className="h-full w-auto object-contain" />
        </span>
      )}
      <MediaPicker open={picking} onClose={() => setPicking(false)} onPick={onChange} />
    </>
  );
}
