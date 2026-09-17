"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { apiFetch } from "@/lib/api";

interface RoleWithPermissions {
  id: string;
  slug: string;
  name: string;
  Permissions: { name: string }[];
}

type PermissionsContextType = {
  /** The signed-in user's own permissions (ignoring any preview). */
  permissions: string[];
  /** The signed-in user's own role. */
  roleSlug: string;
  fullName: string;
  /** True while previewing another role's URL as superadmin. */
  isPreviewing: boolean;
  /** The role currently in effect for gating decisions — the previewed role's
   *  slug while superadmin is browsing another role's URL, else roleSlug. */
  effectiveRoleSlug: string;
  ready: boolean;
  /** Rhinon Tech operator (server-decided) — unlocks platform tools like Deploy.
   *  Always false while previewing another role. Being superadmin is not enough. */
  isPlatformAdmin: boolean;
  /** Permission check that accounts for preview mode and the superadmin
   *  override — use this everywhere instead of reading `permissions` directly. */
  has: (...anyOf: string[]) => boolean;
  refresh: () => void;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const EMPTY: string[] = [];

// The `permissions` cookie is a fast-path hint so the nav can render before
// /auth/me resolves. It's an external store, so it's read through
// useSyncExternalStore: the server (and the hydrating render) sees EMPTY and
// React swaps in the cookie value right after hydration — no mismatch, and no
// effect writing state during render.
let cachedRaw: string | undefined;
let cachedHint: string[] = EMPTY;

function subscribeToCookie() {
  // Nothing else mutates the cookie mid-render; login and /auth/me both cause
  // a remount or an explicit state update.
  return () => {};
}

function getCookieHint(): string[] {
  const raw = Cookies.get("permissions");
  // Cache by raw string — getSnapshot must be referentially stable or React
  // re-renders forever.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedHint = raw ? (JSON.parse(raw) as string[]) : EMPTY;
    } catch {
      cachedHint = EMPTY;
    }
  }
  return cachedHint;
}

function getServerCookieHint(): string[] {
  return EMPTY;
}

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const cookieHint = useSyncExternalStore(subscribeToCookie, getCookieHint, getServerCookieHint);

  // null until /auth/me answers; the cookie hint stands in until then.
  const [live, setLive] = useState<{
    permissions: string[];
    roleSlug: string;
    fullName: string;
    isPlatformAdmin: boolean;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);

  const permissions = live?.permissions ?? cookieHint;
  const roleSlug = live?.roleSlug ?? "";
  const fullName = live?.fullName ?? "";

  const urlRoleSlug = pathname.split("/")[1] || "";
  const isPreviewing =
    roleSlug === "superadmin" && urlRoleSlug !== "superadmin" && urlRoleSlug !== "";

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ permissions: string[]; roleSlug: string; fullName: string; isPlatformAdmin?: boolean }>("/auth/me")
      .then((data) => {
        if (cancelled) return;
        setLive({
          permissions: data.permissions || [],
          roleSlug: data.roleSlug || "",
          fullName: data.fullName || "",
          isPlatformAdmin: data.isPlatformAdmin === true,
        });
        setReady(true);
        // Keep the cookie warm as the fast-path hint for the next page load.
        Cookies.set("permissions", JSON.stringify(data.permissions || []), { expires: 7 });
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // While a superadmin previews another role's URL, gate the UI by THAT role's
  // grants so the preview shows what the role's holder would actually see.
  // Stored keyed by slug and derived below, so leaving preview needs no reset.
  const [previewCache, setPreviewCache] = useState<{ slug: string; permissions: string[] } | null>(
    null
  );
  const previewRolePermissions =
    isPreviewing && previewCache?.slug === urlRoleSlug ? previewCache.permissions : null;

  useEffect(() => {
    if (!isPreviewing) return;
    let cancelled = false;
    apiFetch<RoleWithPermissions[]>("/roles")
      .then((roles) => {
        if (cancelled) return;
        const role = roles.find((r) => r.slug === urlRoleSlug);
        setPreviewCache({
          slug: urlRoleSlug,
          permissions: role ? role.Permissions.map((p) => p.name) : [],
        });
      })
      .catch(() => {
        if (!cancelled) setPreviewCache({ slug: urlRoleSlug, permissions: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [isPreviewing, urlRoleSlug]);

  const has = (...anyOf: string[]) => {
    if (isPreviewing) {
      return (previewRolePermissions ?? EMPTY).some((p) => anyOf.includes(p));
    }
    if (roleSlug === "superadmin") return true;
    return anyOf.some((p) => permissions.includes(p));
  };

  const effectiveRoleSlug = isPreviewing ? urlRoleSlug : roleSlug;
  const isPlatformAdmin = !isPreviewing && live?.isPlatformAdmin === true;

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        roleSlug,
        fullName,
        isPreviewing,
        effectiveRoleSlug,
        ready,
        isPlatformAdmin,
        has,
        refresh: () => setTick((t) => t + 1),
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
