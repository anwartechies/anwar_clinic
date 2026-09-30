"use client";

import { useState, useEffect, useCallback } from "react";
import { QueueEntry } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { TokenSlipModal } from "./TokenSlipModal";
import {
  TbRefresh,
  TbUsers,
  TbStethoscope,
  TbClock,
  TbCheck,
  TbPrinter,
  TbArrowsExchange,
  TbX,
  TbAlertTriangle,
} from "react-icons/tb";

interface QueueStats {
  total: number;
  waiting: number;
  inConsultation: number;
  inProcedure: number;
  pendingBilling: number;
  completed: number;
  cancelled: number;
}

export function LiveQueueBoard({
  onOpenConsultation,
}: {
  onOpenConsultation?: (queueEntry: QueueEntry) => void;
}) {
  const { has, effectiveRoleSlug, userId } = usePermissions();
  const isDoctor = effectiveRoleSlug === "doctor";
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    waiting: 0,
    inConsultation: 0,
    inProcedure: 0,
    pendingBilling: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorsList, setDoctorsList] = useState<{ id: string; fullName: string }[]>([]);
  const [selectedTokenForPrint, setSelectedTokenForPrint] = useState<QueueEntry | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all active doctors for the filter dropdown
    apiFetch<any[]>("/doctors")
      .then((res: any) => {
        const list = Array.isArray(res) ? res : [];
        const docs = list.map((d: any) => ({ id: d.id, fullName: d.fullName }));
        if (docs.length > 0) {
          setDoctorsList(docs);
        }
      })
      .catch(() => {});
  }, []);

  const fetchQueue = useCallback(async () => {
    try {
      const url = selectedDoctorId ? `/queue/today?doctorId=${selectedDoctorId}` : "/queue/today";
      const data = await apiFetch<{ stats: QueueStats; queue: QueueEntry[] }>(url);
      setQueue(data.queue);
      setStats(data.stats);

      // Extract any additional doctors from queue entries
      const uniqueDocs = Array.from(
        new Map(
          data.queue
            .filter((e) => e.doctor)
            .map((e) => [e.doctor!.id, { id: e.doctor!.id, fullName: e.doctor!.fullName }])
        ).values()
      );
      if (uniqueDocs.length > 0) {
        setDoctorsList((prev) => {
          const map = new Map(prev.map((d) => [d.id, d]));
          for (const d of uniqueDocs) {
            map.set(d.id, d);
          }
          return Array.from(map.values());
        });
      }
    } catch (err: any) {
      console.error("Queue fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctorId]);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh queue every 15 seconds
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleCallPatient = async (entry: QueueEntry) => {
    try {
      setActionError(null);
      await apiFetch(`/queue/${entry.id}/call`, { method: "PATCH" });
      await fetchQueue();
      if (onOpenConsultation) {
        onOpenConsultation(entry);
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to call patient");
    }
  };

  const handleCancelToken = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this token?")) return;
    try {
      setActionError(null);
      await apiFetch(`/queue/${id}/cancel`, { method: "PATCH" });
      await fetchQueue();
    } catch (err: any) {
      setActionError(err.message || "Failed to cancel token");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Counters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <TbClock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Waiting in Lobby
            </p>
            <p className="text-2xl font-bold text-amber-950 dark:text-amber-100">{stats.waiting}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <TbStethoscope className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              In Doctor Chamber
            </p>
            <p className="text-2xl font-bold text-sky-950 dark:text-sky-100">{stats.inConsultation}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
            <TbUsers className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Pending Billing
            </p>
            <p className="text-2xl font-bold text-purple-950 dark:text-purple-100">{stats.pendingBilling}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <TbCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Discharged Today
            </p>
            <p className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">{stats.completed}</p>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <TbAlertTriangle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {isDoctor ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
                <TbStethoscope className="h-3.5 w-3.5" />
                My Consulting Chamber
              </span>
              <span className="text-xs text-slate-500">
                ({queue.length} assigned patient{queue.length === 1 ? "" : "s"})
              </span>
            </div>
          ) : (
            <>
              <span className="text-xs font-semibold text-slate-500">Filter by Doctor:</span>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">All Doctors ({queue.length} tokens)</option>
                {doctorsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchQueue();
          }}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <TbRefresh className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </button>
      </div>

      {/* Queue List */}
      {queue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <TbUsers className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">No active queue tokens</p>
          <p className="text-xs text-slate-500">New checked-in walk-in or booked patients will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queue.map((entry) => {
            const isWaiting = entry.status === "waiting";
            const isInChamber = entry.status === "in_consultation";
            const isPendingBilling = entry.status === "pending_billing";
            const isAssignedDoctor = !isDoctor || !entry.doctorId || entry.doctorId === userId;

            return (
              <div
                key={entry.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 transition shadow-sm dark:bg-slate-900 ${
                  isInChamber
                    ? "border-sky-300 ring-2 ring-sky-400/20 dark:border-sky-700"
                    : isWaiting
                    ? "border-amber-200 hover:border-amber-300 dark:border-amber-900/60"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  {/* Token & Priority Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-slate-900 px-3 py-1 text-sm font-extrabold text-white dark:bg-teal-600">
                        {entry.tokenNumber}
                      </span>
                      {entry.priority === "emergency" && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          EMERGENCY
                        </span>
                      )}
                      {entry.priority === "vip" && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          VIP
                        </span>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        isInChamber
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                          : isWaiting
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : isPendingBilling
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {entry.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div className="mt-3.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {entry.patient ? `${entry.patient.firstName} ${entry.patient.lastName}` : "Unknown"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      MRN: <span className="font-mono">{entry.patient?.mrn}</span> • {entry.patient?.phone}
                    </p>
                    <p className="mt-1 text-xs text-teal-700 dark:text-teal-400">
                      Doctor: <span className="font-semibold">{entry.doctor?.fullName || "Unassigned"}</span>
                    </p>
                  </div>

                  {/* Vitals Summary Pill */}
                  {entry.vitals && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {entry.vitals.bpSystolic && (
                          <span>
                            BP: <strong>{entry.vitals.bpSystolic}/{entry.vitals.bpDiastolic}</strong>
                          </span>
                        )}
                        {entry.vitals.pulseRate && (
                          <span>Pulse: <strong>{entry.vitals.pulseRate}</strong></span>
                        )}
                        {entry.vitals.temperature && (
                          <span>Temp: <strong>{entry.vitals.temperature}°F</strong></span>
                        )}
                        {entry.vitals.bmi && (
                          <span>BMI: <strong>{entry.vitals.bmi}</strong></span>
                        )}
                      </div>
                      {entry.vitals.chiefComplaint && (
                        <p className="mt-1.5 truncate italic text-slate-500">
                          &ldquo;{entry.vitals.chiefComplaint}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 flex items-center justify-between border-t pt-3 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedTokenForPrint(entry)}
                      title="Print Token Slip"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <TbPrinter className="h-4 w-4" />
                    </button>
                    {has("queue:write") && isWaiting && (
                      <button
                        onClick={() => handleCancelToken(entry.id)}
                        title="Cancel Token"
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <TbX className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Doctor call / consultation button */}
                  {isWaiting && (
                    isAssignedDoctor && has("queue:write") ? (
                      <button
                        onClick={() => handleCallPatient(entry)}
                        className="flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                      >
                        <TbStethoscope className="h-3.5 w-3.5" />
                        Call Patient
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        Assigned to {entry.doctor?.fullName || "Doctor"}
                      </span>
                    )
                  )}

                  {isInChamber && (
                    isAssignedDoctor ? (
                      <button
                        onClick={() => onOpenConsultation && onOpenConsultation(entry)}
                        className="flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
                      >
                        Open Consultation
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">
                        In Chamber with {entry.doctor?.fullName || "Doctor"}
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTokenForPrint && (
        <TokenSlipModal
          entry={selectedTokenForPrint}
          onClose={() => setSelectedTokenForPrint(null)}
        />
      )}
    </div>
  );
}
