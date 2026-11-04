"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TbUsers,
  TbUserPlus,
  TbSearch,
  TbFilter,
  TbRefresh,
  TbKey,
  TbEdit,
  TbTrash,
  TbCheck,
  TbClock,
  TbShield,
  TbMail,
  TbPhone,
  TbBuilding,
  TbBriefcase,
  TbAlertCircle,
  TbLock,
  TbUserCheck,
  TbUserX,
  TbChevronRight,
  TbCopy,
} from "react-icons/tb";
import { Role, StaffMember } from "./types";
import { StaffModal } from "./StaffModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { PageHeader } from "@/components/Layout/PageHeader";

const ROLE_BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  superadmin: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
  },
  doctor: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  receptionist: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  pharmacist: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
};

export function StaffManager() {
  const { has, roleSlug, effectiveRoleSlug } = usePermissions();
  const canWrite = has("staff:write");
  const isSuperAdmin = roleSlug === "superadmin" || effectiveRoleSlug === "superadmin";

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [staffToReset, setStaffToReset] = useState<StaffMember | null>(null);

  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [staffData, rolesData] = await Promise.all([
        apiFetch<StaffMember[]>("/staff"),
        apiFetch<Role[]>("/roles"),
      ]);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      if (isManualRefresh) {
        setMessage({ kind: "ok", text: "Staff directory refreshed." });
      }
    } catch (err: any) {
      console.error("Failed to load staff:", err);
      setMessage({ kind: "error", text: err.message || "Failed to load staff members." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenInvite = () => {
    setEditingStaff(null);
    setStaffModalOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffModalOpen(true);
  };

  const handleOpenResetPassword = (member: StaffMember) => {
    setStaffToReset(member);
    setResetModalOpen(true);
  };

  const handleToggleStatus = async (member: StaffMember) => {
    const nextStatus = member.status === "active" ? "inactive" : "active";
    try {
      await apiFetch(`/staff/${member.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setMessage({
        kind: "ok",
        text: `${member.fullName}'s status changed to ${nextStatus}.`,
      });
      fetchData();
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || "Failed to update status." });
    }
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (
      !confirm(
        `Are you sure you want to delete "${member.fullName}"? If they have linked clinic records, the account will be deactivated instead.`
      )
    ) {
      return;
    }

    try {
      const res = await apiFetch<{ message: string; action: string }>(`/staff/${member.id}`, {
        method: "DELETE",
      });
      setMessage({ kind: "ok", text: res.message });
      fetchData();
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || "Failed to delete staff member." });
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        !search ||
        member.fullName.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(search.toLowerCase())) ||
        (member.designation && member.designation.toLowerCase().includes(search.toLowerCase())) ||
        (member.phone && member.phone.includes(search));

      const matchesRole = roleFilter === "all" || member.roleId === roleFilter;

      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, search, roleFilter, statusFilter]);

  // Statistics
  const totalCount = staff.length;
  const activeCount = staff.filter((s) => s.status === "active").length;
  const pendingCount = staff.filter((s) => s.status === "inactive" && !s.lastLoginAt).length;
  const inactiveCount = staff.filter((s) => s.status === "inactive" && !!s.lastLoginAt).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Staff Directory"
        description="Manage clinic team members, invite new staff with roles from Settings, and configure credentials."
        action={
          canWrite ? (
            <button
              onClick={handleOpenInvite}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-teal-500/20 transition active:scale-[0.98]"
            >
              <TbUserPlus className="w-4 h-4" />
              Invite Staff
            </button>
          ) : undefined
        }
      />

      {/* Notification banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between transition-all ${
            message.kind === "ok"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.kind === "ok" ? (
              <TbCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <TbAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            &times;
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl font-bold">
            <TbUsers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Staff</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
            <TbUserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Members</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
            <TbClock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Login</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
            <TbShield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{roles.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Defined Roles</div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">All Roles ({roles.length})</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                statusFilter === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                statusFilter === "active"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                statusFilter === "inactive"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Pending / Inactive
            </button>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          title="Refresh staff list"
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition self-end sm:self-auto"
        >
          <TbRefresh className={`w-4 h-4 ${refreshing ? "animate-spin text-teal-500" : ""}`} />
        </button>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <span className="animate-spin inline-block w-6 h-6 border-2 border-teal-500/20 border-t-teal-500 rounded-full mb-3"></span>
            <p>Loading clinic staff directory...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <TbUsers className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              No staff members found
            </h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              {search || roleFilter !== "all" || statusFilter !== "all"
                ? "Try clearing filters to see more results."
                : "No staff have been added yet. Use the Invite Staff button above to add members."}
            </p>
            {canWrite && !search && (
              <button
                onClick={handleOpenInvite}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-xs font-semibold rounded-xl hover:bg-teal-600 transition"
              >
                <TbUserPlus className="w-4 h-4" />
                Invite First Staff Member
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Staff Member</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department / Designation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredStaff.map((member) => {
                  const roleSlug = member.role?.slug || "";
                  const roleColor = ROLE_BADGE_COLORS[roleSlug] || {
                    bg: "bg-slate-100 dark:bg-slate-800",
                    text: "text-slate-700 dark:text-slate-300",
                    border: "border-slate-200 dark:border-slate-700",
                  };

                  const isPending = member.status === "inactive" && !member.lastLoginAt;
                  const isDeactivated = member.status === "inactive" && !!member.lastLoginAt;

                  // Initials for avatar
                  const initials = member.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "U";

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
                    >
                      {/* Name & Contact */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {member.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <TbMail className="w-3 h-3 text-slate-400" />
                                {member.email}
                              </span>
                              <button
                                onClick={() => copyEmail(member.email)}
                                title="Copy email address"
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                              >
                                {copiedEmail === member.email ? (
                                  <TbCheck className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <TbCopy className="w-3 h-3" />
                                )}
                              </button>
                              {member.phone && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  • <TbPhone className="w-3 h-3" />
                                  {member.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${roleColor.bg} ${roleColor.text} ${roleColor.border}`}
                        >
                          <TbShield className="w-3 h-3" />
                          {member.role?.name || "No Role"}
                        </span>
                      </td>

                      {/* Department / Designation */}
                      <td className="py-4 px-4">
                        {member.department || member.designation ? (
                          <div>
                            {member.designation && (
                              <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <TbBriefcase className="w-3 h-3 text-slate-400" />
                                {member.designation}
                              </div>
                            )}
                            {member.department && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <TbBuilding className="w-3 h-3 text-slate-400" />
                                {member.department}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {member.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : isPending ? (
                          <span
                            title="Awaiting first login with email & password to activate"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 cursor-help"
                          >
                            <TbClock className="w-3 h-3 text-amber-500" />
                            Pending First Login
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {member.lastLoginAt ? (
                          <span>{new Date(member.lastLoginAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</span>
                        ) : (
                          <span className="text-amber-600/90 dark:text-amber-400/90 font-medium">
                            Never logged in
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canWrite && (
                            <>
                              {/* Reset Password */}
                              <button
                                onClick={() => handleOpenResetPassword(member)}
                                title="Reset credentials"
                                className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                              >
                                <TbKey className="w-4 h-4" />
                              </button>

                              {/* Edit Staff */}
                              <button
                                onClick={() => handleOpenEdit(member)}
                                title="Edit staff details"
                                className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                              >
                                <TbEdit className="w-4 h-4" />
                              </button>

                              {/* Toggle Active / Inactive */}
                              <button
                                onClick={() => handleToggleStatus(member)}
                                title={member.status === "active" ? "Deactivate staff" : "Activate staff"}
                                className={`p-1.5 rounded-lg transition ${
                                  member.status === "active"
                                    ? "text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    : "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                }`}
                              >
                                {member.status === "active" ? (
                                  <TbUserX className="w-4 h-4" />
                                ) : (
                                  <TbUserCheck className="w-4 h-4" />
                                )}
                              </button>

                              {/* Delete - only visible to superadmin */}
                              {isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteStaff(member)}
                                  title="Delete or remove member"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                >
                                  <TbTrash className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Add / Edit Modal */}
      <StaffModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        staffToEdit={editingStaff}
        roles={roles}
        onSuccess={() => {
          setMessage({
            kind: "ok",
            text: editingStaff
              ? "Staff details updated successfully."
              : "Staff member added. Initially inactive, their account will activate automatically upon first login.",
          });
          fetchData();
        }}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        staff={staffToReset}
        onSuccess={() => {
          setMessage({
            kind: "ok",
            text: `Password for ${staffToReset?.fullName} has been updated successfully.`,
          });
          fetchData();
        }}
      />
    </div>
  );
}
