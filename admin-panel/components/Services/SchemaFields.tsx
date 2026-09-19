"use client";

import { useState } from "react";
import { TbPlus, TbTrash, TbChevronUp, TbChevronDown } from "react-icons/tb";
import { cn } from "@/lib/utils";
import { ImageField } from "./ImageField";
import type { ItemField, SchemaField } from "./types";

// Every editable field on a service page is rendered by these components,
// driven entirely by the schema the backend serves. Adding a field type here is
// the only front-end work a new schema capability needs.

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
            className="shrink-0 rounded-lg border border-slate-200 px-2 text-slate-400 transition hover:border-red-200 hover:text-red-600 dark:border-slate-700"
          >
            <TbTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, ""])}
        className="flex w-fit items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-teal-400 hover:text-teal-600 dark:border-slate-700"
      >
        <TbPlus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

function ItemFieldInput({
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
  if (field.type === "stringList") {
    return <StringListField value={(value as string[]) ?? []} onChange={onChange} />;
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
  return (
    <input
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function ObjectListField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: Record<string, unknown>[];
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const list = Array.isArray(value) ? value : [];
  const itemFields = field.itemFields ?? [];

  const setItem = (i: number, key: string, v: unknown) =>
    onChange(list.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {list.map((row, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/40"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              #{i + 1}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="rounded p-1 text-slate-400 transition hover:text-slate-700 disabled:opacity-30">
                <TbChevronUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1}
                className="rounded p-1 text-slate-400 transition hover:text-slate-700 disabled:opacity-30">
                <TbChevronDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onChange(list.filter((_, idx) => idx !== i))}
                className="rounded p-1 text-slate-400 transition hover:text-red-600">
                <TbTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {itemFields.map((itemField) => (
              <div
                key={itemField.name}
                className={itemField.type === "stringList" || itemField.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <Label>{itemField.label}</Label>
                <ItemFieldInput
                  field={itemField}
                  value={row[itemField.name]}
                  onChange={(v) => setItem(i, itemField.name, v)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, Object.fromEntries(itemFields.map((f) => [f.name, f.type === "stringList" ? [] : ""]))])}
        className="flex w-fit items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-teal-400 hover:text-teal-600 dark:border-slate-700"
      >
        <TbPlus className="h-3.5 w-3.5" /> Add {field.label.replace(/s$/, "").toLowerCase()}
      </button>
    </div>
  );
}

export function SchemaFieldInput({
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
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
      {field.type === "textarea" && (
        <textarea
          rows={3}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputCls, "resize-y")}
        />
      )}
      {field.type === "image" && (
        <ImageField value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />
      )}
      {field.type === "stringList" && (
        <StringListField value={(value as string[]) ?? []} onChange={onChange} />
      )}
      {field.type === "objectList" && (
        <ObjectListField
          field={field}
          value={(value as Record<string, unknown>[]) ?? []}
          onChange={onChange}
        />
      )}
    </div>
  );
}
