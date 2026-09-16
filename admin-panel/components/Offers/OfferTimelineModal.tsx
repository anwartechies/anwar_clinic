"use client";

import React from "react";
import {
  TbX,
  TbHistory,
  TbCalendarEvent,
  TbClock,
  TbUser,
  TbCheck,
  TbLock,
  TbSparkles,
  TbPlayerPlay,
  TbCircleCheck,
} from "react-icons/tb";
import { Offer, OFFER_STATUS_BADGES } from "./types";

interface OfferTimelineModalProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getDuration(startStr?: string | null, endStr?: string | null): string | null {
  if (!startStr || !endStr) return null;
  try {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const diffMs = end - start;
    if (diffMs <= 0) return null;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""}${remHours > 0 ? ` ${remHours} hr${remHours > 1 ? "s" : ""}` : ""}`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } catch {
    return null;
  }
}

export function OfferTimelineModal({ offer, isOpen, onClose }: OfferTimelineModalProps) {
  if (!isOpen || !offer) return null;

  const badgeMeta = OFFER_STATUS_BADGES[offer.status] || OFFER_STATUS_BADGES.draft;
  const isCompleted = offer.status === "completed";
  const isActive = offer.status === "active";
  const duration = getDuration(offer.activatedAt, offer.completedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TbHistory className="w-4 h-4" />
                Promotion Lifecycle
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeMeta.className}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badgeMeta.bgDot} ${isActive ? "animate-pulse" : ""}`} />
                {badgeMeta.label}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
              {offer.title}
            </h3>
            {offer.couponCode && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Coupon Code: <code className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{offer.couponCode}</code>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Stepper + Detailed Event Log */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Visual 3-Stage Lifecycle Stepper */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 sm:p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Lifecycle Progress
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              {/* 1. Created */}
              <div className="relative flex flex-col p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    <TbSparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    1. Created
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-400">
                  {formatDate(offer.createdAt)}
                </p>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  By {offer.createdBy?.fullName || "Admin"}
                </span>
              </div>

              {/* 2. Activated */}
              <div
                className={`relative flex flex-col p-3 rounded-lg border shadow-xs transition ${
                  offer.activatedAt
                    ? "bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700/60"
                    : "bg-slate-100/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      offer.activatedAt
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    <TbPlayerPlay className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    2. Activated
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-400">
                  {offer.activatedAt ? formatDate(offer.activatedAt) : "Not yet activated"}
                </p>
                {isActive && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Currently Live
                  </span>
                )}
                {duration && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Ran for {duration}
                  </span>
                )}
              </div>

              {/* 3. Completed */}
              <div
                className={`relative flex flex-col p-3 rounded-lg border shadow-xs transition ${
                  isCompleted
                    ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    : "bg-slate-100/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    <TbLock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    3. Completed
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-400">
                  {offer.completedAt ? formatDate(offer.completedAt) : "Not yet completed"}
                </p>
                {isCompleted && (
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1">
                    Finalized (Locked)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Audit Trail */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <TbCalendarEvent className="w-4 h-4 text-slate-400" />
              Event Timeline History
            </h4>

            {Array.isArray(offer.timeline) && offer.timeline.length > 0 ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {offer.timeline.map((evt, idx) => {
                  const evtBadge =
                    OFFER_STATUS_BADGES[evt.status] || OFFER_STATUS_BADGES.draft;

                  return (
                    <div key={evt.id || idx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-600 dark:bg-emerald-500 shadow-xs" />

                      <div className="bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${evtBadge.className}`}
                          >
                            {evtBadge.label}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <TbClock className="w-3.5 h-3.5" />
                            {formatDate(evt.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 font-medium">
                          {evt.note || `Status changed to ${evt.status}`}
                        </p>

                        {evt.userName && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                            <TbUser className="w-3 h-3" /> Action by: {evt.userName}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No timeline entries recorded yet.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
