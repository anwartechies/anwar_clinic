import type { ReactNode } from "react";
import {
  TbLayoutDashboard,
  TbCalendarEvent,
  TbUsers,
  TbStethoscope,
  TbPrescription,
  TbReceipt2,
  TbPackage,
  TbUserCog,
  TbChartHistogram,
  TbPhoto,
  TbClipboardText,
  TbUserPlus,
  TbArticle,
  TbShoppingBag,
  TbSettings,
  TbBriefcase,
  TbGift,
} from "react-icons/tb";

export interface NavItem {
  title: string;
  icon: ReactNode;
  /** Path suffix, appended after /:role. */
  path: string;
  /** The user needs ANY one of these to see the item. */
  permissions: string[];
}

// The nav is data — each entry declares the permissions that reveal it, and
// Sidebar filters this list through `has()`. Nothing here is role-specific,
// so a role created at runtime gets the right nav automatically from its grants.
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard",     icon: <TbLayoutDashboard className="h-5 w-5 shrink-0" />, path: "/dashboard",     permissions: ["dashboard:read"] },
  { title: "Appointments",  icon: <TbCalendarEvent className="h-5 w-5 shrink-0" />,   path: "/appointments",  permissions: ["appointments:read"] },
  { title: "Patients",      icon: <TbUsers className="h-5 w-5 shrink-0" />,           path: "/patients",      permissions: ["patients:read"] },
  { title: "Doctors",       icon: <TbStethoscope className="h-5 w-5 shrink-0" />,     path: "/doctors",       permissions: ["doctors:read"] },
  { title: "Prescriptions", icon: <TbPrescription className="h-5 w-5 shrink-0" />,    path: "/prescriptions", permissions: ["prescriptions:read"] },
  { title: "Billing",       icon: <TbReceipt2 className="h-5 w-5 shrink-0" />,        path: "/billing",       permissions: ["billing:read"] },
  { title: "Inventory",     icon: <TbPackage className="h-5 w-5 shrink-0" />,         path: "/inventory",     permissions: ["inventory:read"] },
  { title: "Staff",         icon: <TbUserCog className="h-5 w-5 shrink-0" />,         path: "/staff",         permissions: ["staff:read"] },
  { title: "Reports",       icon: <TbChartHistogram className="h-5 w-5 shrink-0" />,  path: "/reports",       permissions: ["reports:read"] },
  { title: "Leads",         icon: <TbUserPlus className="h-5 w-5 shrink-0" />,        path: "/leads",         permissions: ["leads:read"] },
  { title: "Services",      icon: <TbClipboardText className="h-5 w-5 shrink-0" />,   path: "/services",      permissions: ["services:read"] },
  { title: "Blogs",         icon: <TbArticle className="h-5 w-5 shrink-0" />,         path: "/blogs",         permissions: ["blogs:read"] },
  { title: "Products",      icon: <TbShoppingBag className="h-5 w-5 shrink-0" />,     path: "/products",      permissions: ["products:read"] },
  { title: "Careers",       icon: <TbBriefcase className="h-5 w-5 shrink-0" />,       path: "/careers",       permissions: ["careers:read"] },
  { title: "Offers Banner", icon: <TbGift className="h-5 w-5 shrink-0" />,            path: "/offers",        permissions: ["offers:read"] },
  { title: "Media",         icon: <TbPhoto className="h-5 w-5 shrink-0" />,           path: "/media",         permissions: ["media:read"] },
  { title: "Settings",      icon: <TbSettings className="h-5 w-5 shrink-0" />,        path: "/settings",      permissions: ["settings:read"] },
];

// Human labels for the permission matrix in Settings > Roles. Anything missing
// falls back to a prettified "Resource — action", so new catalog entries just work.
export const PERMISSION_LABELS: Record<string, string> = {
  "dashboard:read": "View dashboard",
  "appointments:read": "View appointments",
  "appointments:write": "Book, reschedule & cancel appointments",
  "patients:read": "View patient records",
  "patients:write": "Create & edit patient records",
  "doctors:read": "View doctors & schedules",
  "doctors:write": "Manage doctors & schedules",
  "prescriptions:read": "View prescriptions",
  "prescriptions:write": "Issue & edit prescriptions",
  "billing:read": "View invoices & payments",
  "billing:write": "Create invoices & record payments",
  "inventory:read": "View stock levels",
  "inventory:write": "Manage stock & suppliers",
  "staff:read": "View staff directory",
  "staff:write": "Add, edit & deactivate staff",
  "reports:read": "View clinic reports",
  "leads:read": "View website enquiries",
  "leads:write": "Update, assign & delete enquiries",
  "services:read": "View website services",
  "services:write": "Create, edit & publish service pages",
  "blogs:read": "View blog posts",
  "blogs:write": "Create, edit & publish blog posts",
  "products:read": "View ecommerce products",
  "products:write": "Create, edit & publish products",
  "careers:read": "View job openings & applications",
  "careers:write": "Create/edit jobs & update applications",
  "offers:read": "View offer banners",
  "offers:write": "Create, edit, activate & complete offer banners",
  "media:read": "View the media library",
  "media:write": "Upload & delete media files",
  "deploy:read": "View backend deploys & logs",
  "deploy:trigger": "Deploy the backend (pull, build, restart)",
  "settings:read": "View clinic configuration",
  "settings:write": "Manage roles, permissions & clinic settings",
};

// Display order + label per resource group in the matrix. Unlisted resources
// still render, using a capitalized fallback — the matrix is fully data-driven.
export const RESOURCE_META: { key: string; label: string; order: number }[] = [
  { key: "dashboard", label: "Dashboard", order: 0 },
  { key: "appointments", label: "Appointments", order: 1 },
  { key: "patients", label: "Patients", order: 2 },
  { key: "doctors", label: "Doctors", order: 3 },
  { key: "prescriptions", label: "Prescriptions", order: 4 },
  { key: "billing", label: "Billing", order: 5 },
  { key: "inventory", label: "Inventory", order: 6 },
  { key: "staff", label: "Staff", order: 7 },
  { key: "reports", label: "Reports", order: 8 },
  { key: "leads", label: "Leads", order: 9 },
  { key: "services", label: "Website Services", order: 10 },
  { key: "blogs", label: "Blog Posts", order: 11 },
  { key: "products", label: "Ecommerce Products", order: 12 },
  { key: "careers", label: "Careers & Jobs", order: 13 },
  { key: "offers", label: "Offer Banners", order: 14 },
  { key: "media", label: "Media Library", order: 15 },
  { key: "settings", label: "Settings", order: 16 },
  { key: "deploy", label: "Deploy (Rhinon)", order: 17 },
];

// Permission groups never shown in the role matrix: Deploy is locked to one
// account (prabhat@rhinon.tech) on the server, so granting it to a role does nothing.
export const PLATFORM_RESOURCES = ["deploy"];

export function resourceLabel(resource: string) {
  const known = RESOURCE_META.find((r) => r.key === resource);
  if (known) return known.label;
  return resource.charAt(0).toUpperCase() + resource.slice(1);
}

export function resourceOrder(resource: string) {
  const known = RESOURCE_META.find((r) => r.key === resource);
  return known ? known.order : 99;
}
