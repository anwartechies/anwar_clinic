"use client";

import { useEffect, useMemo, useState } from "react";
import { TbPlus, TbTrash, TbShield, TbCheck, TbAlertCircle, TbLock } from "react-icons/tb";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { PERMISSION_LABELS, PLATFORM_RESOURCES, resourceLabel, resourceOrder } from "@/constants/nav";
import { PageHeader } from "@/components/Layout/PageHeader";

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  usersCount?: number;
  Permissions?: Permission[];
}

// Enforced server-side too (see backend routes/roles.ts) — mirrored here only
// so the UI can explain itself instead of failing on submit.
const LOCKED_SLUGS = ["superadmin"];

function permissionLabel(permission: Permission) {
  return (
    PERMISSION_LABELS[permission.name] ??
    `${resourceLabel(permission.resource)} — ${permission.action}`
  );
}

export function RolesManager() {
  const { has, refresh: refreshPermissions } = usePermissions();
  const canWrite = has("settings:write");

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleSlug, setNewRoleSlug] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const selectRole = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermIds(new Set((role.Permissions ?? []).map((p) => p.id)));
    setMessage(null);
  };

  useEffect(() => {
    Promise.all([apiFetch<Role[]>("/roles"), apiFetch<Permission[]>("/permissions")])
      .then(([rolesData, permsData]) => {
        const list = Array.isArray(rolesData) ? rolesData : [];
        setRoles(list);
        setPermissions(Array.isArray(permsData) ? permsData : []);
        if (list.length > 0) selectRole(list[0]);
      })
      .catch((err) => setMessage({ kind: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  // Group the flat catalog by resource — the matrix is built from whatever the
  // API returns, so a new backend permission shows up here with no UI change.
  const grouped = useMemo(() => {
    const byResource = new Map<string, Permission[]>();
    for (const perm of permissions) {
      if (PLATFORM_RESOURCES.includes(perm.resource)) continue;
      const list = byResource.get(perm.resource) ?? [];
      list.push(perm);
      byResource.set(perm.resource, list);
    }
    return Array.from(byResource.entries())
      .map(([resource, perms]) => ({
        resource,
        label: resourceLabel(resource),
        permissions: perms.sort((a, b) => a.action.localeCompare(b.action)),
      }))
      .sort((a, b) => resourceOrder(a.resource) - resourceOrder(b.resource));
  }, [permissions]);

  const isLocked = selectedRole ? LOCKED_SLUGS.includes(selectedRole.slug) : false;
  const editable = canWrite && !isLocked;

  const togglePermission = (id: string) => {
    if (!editable) return;
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleResource = (perms: Permission[]) => {
    if (!editable) return;
    const allSelected = perms.every((p) => selectedPermIds.has(p.id));
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      for (const p of perms) {
        if (allSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRole || !editable) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await apiFetch<Role>(`/roles/${selectedRole.id}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissionIds: Array.from(selectedPermIds) }),
      });
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      setSelectedRole((prev) => (prev ? { ...prev, ...updated } : prev));
      setMessage({ kind: "ok", text: "Permissions updated." });
      // If the edited role is the signed-in user's own, their nav must re-gate now.
      refreshPermissions();
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const role = await apiFetch<Role>("/roles", {
        method: "POST",
        body: JSON.stringify({ name: newRoleName, slug: newRoleSlug }),
      });
      setRoles((prev) => [...prev, role]);
      selectRole(role);
      setCreating(false);
      setNewRoleName("");
      setNewRoleSlug("");
      setMessage({ kind: "ok", text: `Role "${role.name}" created. Grant it permissions below.` });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Create failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Delete the "${role.name}" role? This cannot be undone.`)) return;
    setMessage(null);
    try {
      await apiFetch(`/roles/${role.id}`, { method: "DELETE" });
      const remaining = roles.filter((r) => r.id !== role.id);
      setRoles(remaining);
      if (selectedRole?.id === role.id) {
        if (remaining.length > 0) selectRole(remaining[0]);
        else setSelectedRole(null);
      }
      setMessage({ kind: "ok", text: "Role deleted." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Delete failed" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Create roles and choose exactly what each one can reach. Changes apply immediately — no redeploy, no re-login."
        action={
          canWrite && (
            <button
              onClick={() => setCreating((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              <TbPlus className="h-4 w-4" />
              New role
            </button>
          )
        }
      />

      {creating && canWrite && (
        <form
          onSubmit={handleCreate}
          className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Role name</label>
            <input
              required
              value={newRoleName}
              onChange={(e) => {
                setNewRoleName(e.target.value);
                setNewRoleSlug(
                  e.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                );
              }}
              placeholder="Lab Technician"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              URL slug
            </label>
            <input
              required
              pattern="[a-z0-9\-]+"
              value={newRoleSlug}
              onChange={(e) => setNewRoleSlug(e.target.value)}
              placeholder="lab-technician"
              className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
          >
            Create
          </button>
        </form>
      )}

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

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Role list */}
        <div className="flex flex-col gap-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className={cn(
                "group flex items-center gap-2 rounded-xl border p-3 transition",
                selectedRole?.id === role.id
                  ? "border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              )}
            >
              <button onClick={() => selectRole(role)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                <TbShield
                  className={cn(
                    "h-4 w-4 shrink-0",
                    selectedRole?.id === role.id ? "text-teal-600" : "text-slate-400"
                  )}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {role.name}
                  </span>
                  <span className="block truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    /{role.slug} · {role.usersCount ?? 0} user{(role.usersCount ?? 0) === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
              {canWrite && !LOCKED_SLUGS.includes(role.slug) && (
                <button
                  onClick={() => handleDelete(role)}
                  className="rounded p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  aria-label={`Delete ${role.name}`}
                >
                  <TbTrash className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Permission matrix */}
        {selectedRole ? (
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedRole.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isLocked
                    ? "Super Admin always holds every permission."
                    : `${selectedPermIds.size} of ${permissions.length} permissions granted`}
                </p>
              </div>
              {editable && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              )}
            </div>

            {isLocked && (
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <TbLock className="h-3.5 w-3.5" />
                This role is locked — its permissions cannot be edited.
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {grouped.map((group) => {
                const allSelected = group.permissions.every((p) => selectedPermIds.has(p.id));
                return (
                  <div key={group.resource} className="p-4">
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {group.label}
                      </h3>
                      {editable && (
                        <button
                          onClick={() => toggleResource(group.permissions)}
                          className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
                        >
                          {allSelected ? "Clear all" : "Select all"}
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.permissions.map((perm) => {
                        const checked = isLocked || selectedPermIds.has(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={cn(
                              "flex items-start gap-2.5 rounded-lg border p-2.5 text-sm transition",
                              checked
                                ? "border-teal-300 bg-teal-50/60 dark:border-teal-700 dark:bg-teal-500/10"
                                : "border-slate-200 dark:border-slate-800",
                              editable ? "cursor-pointer hover:border-slate-300" : "cursor-not-allowed opacity-80"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!editable}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 h-4 w-4 shrink-0 accent-teal-600"
                            />
                            <span className="min-w-0">
                              <span className="block text-slate-800 dark:text-slate-200">
                                {permissionLabel(perm)}
                              </span>
                              <span className="block font-mono text-[11px] text-slate-400">
                                {perm.name}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
            Select a role to edit its permissions.
          </p>
        )}
      </div>
    </>
  );
}
