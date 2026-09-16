"use client";

import React, { useState, useEffect } from "react";
import {
  TbX,
  TbSparkles,
  TbTag,
  TbArrowRight,
  TbLock,
  TbAlertCircle,
  TbPlus,
  TbTrash,
  TbCheck,
} from "react-icons/tb";
import { Offer, OfferFormValues } from "./types";
import { apiFetch } from "@/lib/api";

interface OfferModalProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentActiveOffer: Offer | null;
}

export function OfferModal({
  offer,
  isOpen,
  onClose,
  onSuccess,
  currentActiveOffer,
}: OfferModalProps) {
  const isEditing = Boolean(offer);
  const isCompleted = offer?.status === "completed";

  const [formData, setFormData] = useState<OfferFormValues>({
    badge: "Special Offer",
    title: "",
    highlightText: "",
    perks: [],
    couponCode: "",
    ctaText: "Claim Consultation",
    link: "/offer",
    status: "draft",
  });

  const [newPerk, setNewPerk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (offer) {
      setFormData({
        badge: offer.badge || "Special Offer",
        title: offer.title || "",
        highlightText: offer.highlightText || "",
        perks: Array.isArray(offer.perks) ? [...offer.perks] : [],
        couponCode: offer.couponCode || "",
        ctaText: offer.ctaText || "Claim Consultation",
        link: offer.link || "/offer",
        status: offer.status === "active" ? "active" : "draft",
      });
    } else {
      setFormData({
        badge: "Special Offer",
        title: "",
        highlightText: "",
        perks: ["Free Scalp Diagnostics", "1 Year Post-Op Support"],
        couponCode: "SAVE25",
        ctaText: "Claim Consultation",
        link: "/offer",
        status: "draft",
      });
    }
    setNewPerk("");
    setError(null);
  }, [offer, isOpen]);

  if (!isOpen) return null;

  const handleAddPerk = () => {
    const trimmed = newPerk.trim();
    if (!trimmed) return;
    if (formData.perks.includes(trimmed)) return;
    setFormData({ ...formData, perks: [...formData.perks, trimmed] });
    setNewPerk("");
  };

  const handleRemovePerk = (index: number) => {
    setFormData({
      ...formData,
      perks: formData.perks.filter((_, idx) => idx !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted) return;

    if (!formData.title.trim()) {
      setError("Offer title is required.");
      return;
    }

    // Check if activating while another offer is active
    if (
      formData.status === "active" &&
      currentActiveOffer &&
      currentActiveOffer.id !== offer?.id
    ) {
      setError(
        `Another offer "${currentActiveOffer.title}" is currently active. You cannot activate multiple offers at the same time. Please mark the currently active offer as completed first.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        badge: formData.badge.trim(),
        title: formData.title.trim(),
        highlightText: formData.highlightText.trim() || null,
        perks: formData.perks,
        couponCode: formData.couponCode.trim() || null,
        ctaText: formData.ctaText.trim() || "Claim Consultation",
        link: formData.link.trim() || "/offer",
        status: formData.status,
      };

      if (isEditing && offer) {
        await apiFetch(`/offers/${offer.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/offers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save offer banner.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TbTag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {isCompleted
                ? "View Completed Offer"
                : isEditing
                ? "Edit Offer Banner"
                : "Create New Offer Banner"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isCompleted
                ? "This offer has been marked as completed and is locked from further edits."
                : "Configure the promotional banner displayed at the top of the landing page."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Offer Lock Alert */}
        {isCompleted && (
          <div className="mx-6 mt-6 p-4 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl flex items-start gap-3">
            <TbLock className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Immutable Campaign:</strong> Once marked completed, an offer banner cannot be
              re-activated or edited. This preserves the exact historical record of the promotional campaign.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
            <TbAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Live Preview Card */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Live Banner Preview (How visitors will see it)
            </label>
            <div className="bg-gradient-to-r from-[#142017] via-[#243527] to-[#142017] text-white p-3.5 rounded-xl border border-white/15 shadow-md overflow-hidden relative">
              <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {formData.badge && (
                    <span className="inline-flex items-center gap-1 bg-[#52664d] text-[#bbf786] border border-[#bbf786]/40 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide uppercase">
                      <TbSparkles className="w-3 h-3 text-[#bbf786]" />
                      {formData.badge}
                    </span>
                  )}
                  <span className="text-white/95 font-medium">
                    {formData.title || "Offer headline goes here..."}
                  </span>
                  {formData.highlightText && (
                    <span className="font-bold text-[#d2f896] underline decoration-white/30 underline-offset-2">
                      {formData.highlightText}
                    </span>
                  )}
                  {formData.couponCode && (
                    <span className="inline-flex items-center gap-1 bg-black/40 border border-dashed border-white/30 text-white/90 px-2 py-0.5 rounded font-mono text-[11px] font-semibold">
                      Code: <strong className="text-[#bbf786]">{formData.couponCode}</strong>
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 bg-[#bbf786] text-[#17241a] font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                  <span>{formData.ctaText || "Claim Offer"}</span>
                  <TbArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Main Headline / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isCompleted}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Book your Anwar Clinic Hair Transplant this month & get"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-60"
                required
              />
            </div>

            {/* Highlight Text */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Highlight Text (Emphasized with bright accent)
              </label>
              <input
                type="text"
                disabled={isCompleted}
                value={formData.highlightText}
                onChange={(e) => setFormData({ ...formData, highlightText: e.target.value })}
                placeholder="e.g. Free Scalp Diagnostics + 1 Year Post-Op Support"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-60"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Badge Label
              </label>
              <input
                type="text"
                disabled={isCompleted}
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Special Offer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-60"
              />
            </div>

            {/* Coupon Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                disabled={isCompleted}
                value={formData.couponCode}
                onChange={(e) =>
                  setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })
                }
                placeholder="e.g. SAVE25"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-60"
              />
            </div>

            {/* CTA Button Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                disabled={isCompleted}
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="e.g. Claim Consultation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-60"
              />
            </div>

            {/* Destination Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Offer Landing Path
              </label>
              <input
                type="text"
                disabled={isCompleted}
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/offer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-60"
              />
            </div>

            {/* Perks List */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inclusions / Perks (Listed on /offer page)
              </label>
              {!isCompleted && (
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newPerk}
                    onChange={(e) => setNewPerk(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPerk();
                      }
                    }}
                    placeholder="e.g. Free Scalp Diagnostics (press Enter to add)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddPerk}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <TbPlus className="w-4 h-4" /> Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.perks.map((perk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs"
                  >
                    <TbCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{perk}</span>
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleRemovePerk(idx)}
                        className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 ml-1"
                      >
                        <TbX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
                {formData.perks.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No inclusions added yet.</span>
                )}
              </div>
            </div>

            {/* Status Selection (only if not completed) */}
            {!isCompleted && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Initial Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={() => setFormData({ ...formData, status: "draft" })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Draft (Saved privately, not live on website)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={() => setFormData({ ...formData, status: "active" })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active (Live on website)
                    </span>
                  </label>
                </div>
                {formData.status === "active" && currentActiveOffer && currentActiveOffer.id !== offer?.id && (
                  <p className="text-[11.5px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                    <TbAlertCircle className="w-4 h-4 shrink-0" />
                    Note: &quot;{currentActiveOffer.title}&quot; is currently active. You will need to complete it first before activating this offer.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              {isCompleted ? "Close" : "Cancel"}
            </button>

            {!isCompleted && (
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/20 transition disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Offer"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
