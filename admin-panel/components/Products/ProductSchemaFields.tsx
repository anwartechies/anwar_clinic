"use client";

import { useState } from "react";
import { TbPlus, TbTrash, TbPhoto, TbChevronUp, TbChevronDown } from "react-icons/tb";
import { cn } from "@/lib/utils";
import { MediaPicker } from "@/components/Services/MediaPicker";
import type { ItemField, SchemaField } from "./types";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

function Label({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{children}</label>
      {help && <p className="text-[11px] text-slate-400">{help}</p>}
    </div>
  );
}

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
          title="Pick from Media Library"
          className="shrink-0 rounded-lg border border-slate-300 px-2.5 text-slate-500 transition hover:border-teal-400 hover:text-teal-600 dark:border-slate-700 cursor-pointer"
        >
          <TbPhoto className="h-4 w-4" />
        </button>
      </div>
      {value && (
        <span className="mt-1.5 block h-16 w-fit overflow-hidden rounded border border-slate-200 dark:border-slate-700 bg-[#ebe6df]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-auto object-contain" />
        </span>
      )}
      <MediaPicker open={picking} onClose={() => setPicking(false)} onPick={onChange} />
    </>
  );
}

function StringListField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const list = Array.isArray(value) ? value : [];
  const set = (i: number, v: string) => onChange(list.map((x, idx) => (idx === i ? v : x)));
  return (
    <div className="flex flex-col gap-1.5">
      {list.map((item, i) => (
        <div key={i} className="flex gap-1.5">
          <textarea
            rows={1}
            value={item}
            onChange={(e) => set(i, e.target.value)}
            className={cn(inputCls, "resize-y")}
          />
          <button
            type="button"
            onClick={() => onChange(list.filter((_, idx) => idx !== i))}
            className="shrink-0 rounded-lg border border-slate-200 px-2 text-slate-400 transition hover:border-red-200 hover:text-red-600 dark:border-slate-700 cursor-pointer"
          >
            <TbTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, ""])}
        className="flex w-fit items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-teal-400 hover:text-teal-600 dark:border-slate-700 cursor-pointer"
      >
        <TbPlus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

function ObjectRowField({
  field,
  value,
  onChange,
}: {
  field: ItemField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "image") {
    return <ImageField value={(value as string) ?? ""} onChange={onChange} />;
  }
  if (field.type === "textarea") {
    return (
      <textarea
        rows={2}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputCls, "resize-y")}
      />
    );
  }
  if (field.type === "stringList") {
    return <StringListField value={(value as string[]) ?? []} onChange={onChange} />;
  }
  return (
    <input
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function ObjectListField({
  fields,
  value,
  onChange,
}: {
  fields: ItemField[];
  value: Record<string, unknown>[];
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const rows = Array.isArray(value) ? value : [];

  const updateRow = (index: number, key: string, val: unknown) => {
    onChange(
      rows.map((row, i) => (i === index ? { ...row, [key]: val } : row))
    );
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const moveRow = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const addRow = () => {
    const empty: Record<string, unknown> = {};
    for (const f of fields) empty[f.name] = f.type === "stringList" ? [] : "";
    onChange([...rows, empty]);
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">#{i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => moveRow(i, i - 1)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
              >
                <TbChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={i === rows.length - 1}
                onClick={() => moveRow(i, i + 1)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
              >
                <TbChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="rounded p-1 text-slate-400 hover:text-red-600 cursor-pointer"
              >
                <TbTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.name}
                className={f.type === "textarea" || f.type === "stringList" ? "sm:col-span-2" : ""}
              >
                <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  {f.label}
                </label>
                <ObjectRowField
                  field={f}
                  value={row[f.name]}
                  onChange={(v) => updateRow(i, f.name, v)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex w-fit items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 cursor-pointer"
      >
        <TbPlus className="h-3.5 w-3.5" /> Add entry
      </button>
    </div>
  );
}

export function ProductSchemaFieldInput({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    <div>
      <Label help={field.help}>{field.label}</Label>
      {field.type === "text" && (
        <input
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputCls}
        />
      )}
      {field.type === "textarea" && (
        <textarea
          rows={3}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(inputCls, "resize-y")}
        />
      )}
      {field.type === "image" && (
        <ImageField
          value={(value as string) ?? ""}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      )}
      {field.type === "stringList" && (
        <StringListField value={(value as string[]) ?? []} onChange={onChange} />
      )}
      {field.type === "objectList" && field.itemFields && (
        <ObjectListField
          fields={field.itemFields}
          value={(value as Record<string, unknown>[]) ?? []}
          onChange={onChange}
        />
      )}
    </div>
  );
}
