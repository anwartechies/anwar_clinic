export type OfferStatus = "draft" | "active" | "completed";

export interface OfferTimelineEvent {
  id: string;
  status: OfferStatus;
  timestamp: string;
  userId?: string | null;
  userName?: string | null;
  note?: string;
}

export interface Offer {
  id: string;
  badge: string;
  title: string;
  highlightText?: string | null;
  perks: string[];
  couponCode?: string | null;
  ctaText: string;
  link?: string | null;
  status: OfferStatus;
  activatedAt?: string | null;
  completedAt?: string | null;
  timeline: OfferTimelineEvent[];
  createdById?: string | null;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfferFormValues {
  badge: string;
  title: string;
  highlightText: string;
  perks: string[];
  couponCode: string;
  ctaText: string;
  link: string;
  status: "draft" | "active";
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

export const OFFER_STATUS_BADGES: Record<
  OfferStatus,
  { label: string; className: string; bgDot: string }
> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold",
    bgDot: "bg-emerald-500",
  },
  draft: {
    label: "Draft",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium",
    bgDot: "bg-amber-500",
  },
  completed: {
    label: "Completed (Locked)",
    className:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 font-medium",
    bgDot: "bg-slate-500",
  },
};
