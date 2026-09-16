"use client";

import React, { useState, useEffect } from "react";
import {
  TbPlus,
  TbSearch,
  TbEdit,
  TbTrash,
  TbHistory,
  TbPlayerPlay,
  TbLock,
  TbEye,
  TbSparkles,
  TbAlertCircle,
  TbCheck,
  TbGift,
  TbLoader2,
  TbRefresh,
} from "react-icons/tb";
import { Offer, OfferStatus, OFFER_STATUS_BADGES } from "./types";
import { OfferModal } from "./OfferModal";
import { OfferTimelineModal } from "./OfferTimelineModal";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";

export function OffersTable() {
  const { has } = usePermissions();
  const canWrite = has("offers:write");

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OfferStatus>("all");

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineOffer, setTimelineOffer] = useState<Offer | null>(null);

  // Custom alert / confirmation dialog state
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    type: "blocked_active" | "confirm_activate" | "confirm_complete";
    title: string;
    message: string;
    targetOffer?: Offer;
  }>({
    isOpen: false,
    type: "blocked_active",
    title: "",
    message: "",
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Offer[]>("/offers");
      setOffers(data);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const activeOffer = offers.find((o) => o.status === "active") || null;

  // Filtered offers
  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.highlightText && o.highlightText.toLowerCase().includes(search.toLowerCase())) ||
      (o.couponCode && o.couponCode.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingOffer(null);
    setEditModalOpen(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setEditModalOpen(true);
  };

  const handleOpenTimeline = (offer: Offer) => {
    setTimelineOffer(offer);
    setTimelineModalOpen(true);
  };

  // Status transition handlers
  const handleRequestActivate = (targetOffer: Offer) => {
    // If another offer is active, show the block message per user requirement!
    if (activeOffer && activeOffer.id !== targetOffer.id) {
      setAlertDialog({
        isOpen: true,
        type: "blocked_active",
        title: "Another Offer is Currently Active",
        message: `The offer "${activeOffer.title}" is currently active on the website. Only one offer can be active at a time. Please mark the currently active offer as completed first before activating "${targetOffer.title}".`,
        targetOffer,
      });
      return;
    }

    // Confirm activation
    setAlertDialog({
      isOpen: true,
      type: "confirm_activate",
      title: "Activate Offer Banner",
      message: `Are you sure you want to activate "${targetOffer.title}"? It will immediately appear on the website landing page banner for all visitors.`,
      targetOffer,
    });
  };

  const handleRequestComplete = (targetOffer: Offer) => {
    // Warning per user requirement: once completed, status cannot be changed further
    setAlertDialog({
      isOpen: true,
      type: "confirm_complete",
      title: "Mark Offer as Completed",
      message: `Are you sure you want to mark "${targetOffer.title}" as completed? Once an offer is completed, it is permanently locked and its status CANNOT be changed or reactivated in the future.`,
      targetOffer,
    });
  };

  const handleExecuteStatusChange = async () => {
    const target = alertDialog.targetOffer;
    if (!target) return;

    setActionLoading(true);
    try {
      if (alertDialog.type === "confirm_activate") {
        await apiFetch(`/offers/${target.id}`, {
          method: "PUT",
          body: JSON.stringify({ status: "active", statusNote: "Activated by administrator" }),
        });
      } else if (alertDialog.type === "confirm_complete") {
        await apiFetch(`/offers/${target.id}`, {
          method: "PUT",
          body: JSON.stringify({
            status: "completed",
            statusNote: "Marked as completed by administrator",
          }),
        });
      }
      setAlertDialog({ ...alertDialog, isOpen: false });
      await fetchOffers();
    } catch (err: any) {
      alert(err.message || "Failed to update offer status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async (offer: Offer) => {
    if (offer.status !== "draft") return;
    if (!confirm(`Are you sure you want to delete draft offer "${offer.title}"?`)) return;

    try {
      await apiFetch(`/offers/${offer.id}`, { method: "DELETE" });
      fetchOffers();
    } catch (err: any) {
      alert(err.message || "Failed to delete offer.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Active Offer Highlight Bar */}
      {activeOffer ? (
        <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE ON WEBSITE
                </span>
                {activeOffer.badge && (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    [{activeOffer.badge}]
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {activeOffer.title}
              </h3>
              {activeOffer.highlightText && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {activeOffer.highlightText}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenTimeline(activeOffer)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition"
              >
                <TbHistory className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Timeline
              </button>
              {canWrite && (
                <button
                  onClick={() => handleRequestComplete(activeOffer)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <TbLock className="w-4 h-4" />
                  Complete Offer
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <TbAlertCircle className="w-4 h-4 text-amber-500" />
            No offer banner is currently active. The website banner is cleanly hidden until an offer is activated.
          </p>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "active", "draft", "completed"] as const).map((st) => {
            const count =
              st === "all"
                ? offers.length
                : offers.filter((o) => o.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition flex items-center gap-1.5 shrink-0 ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === st
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Create */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <TbSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search offers or code..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={fetchOffers}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            title="Refresh"
          >
            <TbRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {canWrite && (
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition shrink-0"
            >
              <TbPlus className="w-4 h-4" />
              <span>Create Offer</span>
            </button>
          )}
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Offer Banner</th>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created / Activated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <TbLoader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading offers...
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <TbGift className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No offers found.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => {
                  const badgeMeta =
                    OFFER_STATUS_BADGES[offer.status] || OFFER_STATUS_BADGES.draft;
                  const isCompleted = offer.status === "completed";
                  const isActive = offer.status === "active";
                  const isDraft = offer.status === "draft";

                  return (
                    <tr
                      key={offer.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition ${
                        isActive ? "bg-emerald-50/20 dark:bg-emerald-950/10" : ""
                      }`}
                    >
                      {/* Banner Info */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-2 mb-1">
                          {offer.badge && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <TbSparkles className="w-3 h-3" />
                              {offer.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {offer.title}
                        </p>
                        {offer.highlightText && (
                          <p className="text-[11.5px] text-emerald-600 dark:text-emerald-400 line-clamp-1 font-medium mt-0.5">
                            {offer.highlightText}
                          </p>
                        )}
                        {Array.isArray(offer.perks) && offer.perks.length > 0 && (
                          <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-1">
                            {offer.perks.join(" • ")}
                          </p>
                        )}
                      </td>

                      {/* Coupon Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {offer.couponCode ? (
                          <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {offer.couponCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${badgeMeta.className}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${badgeMeta.bgDot} ${
                              isActive ? "animate-pulse" : ""
                            }`}
                          />
                          {badgeMeta.label}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11.5px]">
                        <div>Created: {new Date(offer.createdAt).toLocaleDateString()}</div>
                        {offer.activatedAt && (
                          <div className="text-emerald-600 dark:text-emerald-400 text-[11px] mt-0.5">
                            Activated: {new Date(offer.activatedAt).toLocaleDateString()}
                          </div>
                        )}
                        {offer.completedAt && (
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Completed: {new Date(offer.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Timeline Button */}
                          <button
                            onClick={() => handleOpenTimeline(offer)}
                            title="View Lifecycle Timeline"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <TbHistory className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>

                          {/* Edit / View Details */}
                          <button
                            onClick={() => handleOpenEdit(offer)}
                            title={isCompleted ? "View Completed Offer" : "Edit Offer"}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            {isCompleted ? (
                              <TbEye className="w-4 h-4 text-slate-500" />
                            ) : (
                              <TbEdit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </button>

                          {/* Activate Button (for drafts only) */}
                          {isDraft && canWrite && (
                            <button
                              onClick={() => handleRequestActivate(offer)}
                              title="Activate Offer Banner"
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition"
                            >
                              <TbPlayerPlay className="w-3.5 h-3.5 text-emerald-600" />
                              Activate
                            </button>
                          )}

                          {/* Complete Button (for active only) */}
                          {isActive && canWrite && (
                            <button
                              onClick={() => handleRequestComplete(offer)}
                              title="Complete Offer (Permanent)"
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 flex items-center gap-1 transition"
                            >
                              <TbLock className="w-3.5 h-3.5" />
                              Complete
                            </button>
                          )}

                          {/* Delete Button (for drafts only) */}
                          {isDraft && canWrite && (
                            <button
                              onClick={() => handleDeleteDraft(offer)}
                              title="Delete Draft"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            >
                              <TbTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      <OfferModal
        offer={editingOffer}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchOffers}
        currentActiveOffer={activeOffer}
      />

      {/* Timeline Modal */}
      <OfferTimelineModal
        offer={timelineOffer}
        isOpen={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
      />

      {/* Custom Confirmation / Alert Dialog */}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  alertDialog.type === "blocked_active"
                    ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                    : alertDialog.type === "confirm_complete"
                    ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                    : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {alertDialog.type === "blocked_active" ? (
                  <TbAlertCircle className="w-6 h-6" />
                ) : alertDialog.type === "confirm_complete" ? (
                  <TbLock className="w-6 h-6" />
                ) : (
                  <TbPlayerPlay className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {alertDialog.title}
              </h3>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {alertDialog.message}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              {alertDialog.type === "blocked_active" ? (
                <button
                  onClick={() => setAlertDialog({ ...alertDialog, isOpen: false })}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  Understood
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setAlertDialog({ ...alertDialog, isOpen: false })}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteStatusChange}
                    disabled={actionLoading}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition flex items-center gap-1.5 ${
                      alertDialog.type === "confirm_complete"
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    {actionLoading ? "Processing..." : "Confirm"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
