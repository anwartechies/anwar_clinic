export type InventoryCategory =
  | "surgical_instruments"
  | "anesthetics_meds"
  | "prp_meso"
  | "clinical_consumables"
  | "post_op_care"
  | "general";

export type InventoryAction =
  | "restock"
  | "used_procedure"
  | "broken"
  | "stolen"
  | "expired"
  | "adjustment"
  | "sold";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  stockQuantity: number;
  minStockLevel: number;
  broken: number;
  stolen: number;
  batchNumber?: string | null;
  expiryDate?: string | null;
  costPrice: number;
  sellingPrice?: number | null;
  storageLocation?: string | null;
  supplierName?: string | null;
  supplierContact?: string | null;
  isSterile: boolean;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  logs?: InventoryLog[];
  createdBy?: {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
  } | null;
}

export interface InventoryLog {
  id: string;
  inventoryItemId: string;
  action: InventoryAction;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string | null;
  performedById?: string | null;
  createdAt: string;
  item?: {
    id: string;
    name: string;
    sku: string;
    category: InventoryCategory;
    unit: string;
  } | null;
  performedBy?: {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
  } | null;
}


export interface InventoryOverviewKPIs {
  totalItems: number;
  totalStockUnits: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  totalBroken: number;
  totalStolen: number;
  totalLossCount: number;
  totalLossValue: number;
}

export interface CategoryBreakdownItem {
  count: number;
  stock: number;
  broken: number;
  stolen: number;
}

export interface InventoryOverviewData {
  kpis: InventoryOverviewKPIs;
  categoryBreakdown: Record<string, CategoryBreakdownItem>;
  expiringSoonItems: InventoryItem[];
  recentStocks: InventoryItem[];
  recentLogs: InventoryLog[];
}

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  surgical_instruments: "Surgical Tools & Punches",
  anesthetics_meds: "Anesthetics & Medications",
  prp_meso: "PRP & Mesotherapy",
  clinical_consumables: "OT Consumables & Drapes",
  post_op_care: "Post-Op Care & Retail",
  general: "General Clinic Supplies",
};

export const CATEGORY_BADGES: Record<InventoryCategory, string> = {
  surgical_instruments: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-800",
  anesthetics_meds: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-800",
  prp_meso: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-800",
  clinical_consumables: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-800",
  post_op_care: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-800",
  general: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-800",
};

export const ACTION_LABELS: Record<InventoryAction, { label: string; badge: string }> = {
  restock: {
    label: "Restocked",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  used_procedure: {
    label: "Surgery Used",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  },
  broken: {
    label: "Damaged / Broken",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  },
  stolen: {
    label: "Stolen / Missing",
    badge: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 font-semibold",
  },
  expired: {
    label: "Expired Discarded",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  adjustment: {
    label: "Audit Reconciliation",
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  },
  sold: {
    label: "Sold / Dispensed",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-800 font-semibold",
  },
};
