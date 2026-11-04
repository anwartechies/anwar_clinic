"use client";

import { useState, useEffect, useCallback } from "react";
import { QueueEntry, Invoice } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "../Layout/PageHeader";
import { PharmacyDispenseModal } from "./PharmacyDispenseModal";
import { ReceiptPrintModal } from "../Billing/ReceiptPrintModal";
import {
  TbPill,
  TbClock,
  TbReceipt2,
  TbAlertTriangle,
  TbStethoscope,
  TbSearch,
  TbCheck,
  TbPackage,
  TbShoppingBag,
} from "react-icons/tb";

interface PharmacyStats {
  waitingAtPharmacy: number;
  dispensedToday: number;
  revenueToday: number;
  lowStockCount: number;
}

export function PharmacyPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "invoices">("queue");

  // Pharmacy Queue
  const [pharmacyQueue, setPharmacyQueue] = useState<QueueEntry[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  // Pharmacy Stats
  const [stats, setStats] = useState<PharmacyStats>({
    waitingAtPharmacy: 0,
    dispensedToday: 0,
    revenueToday: 0,
    lowStockCount: 0,
  });

  // Modals
  const [selectedEntryForDispensing, setSelectedEntryForDispensing] = useState<QueueEntry | null>(null);
  const [printedInvoice, setPrintedInvoice] = useState<Invoice | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPharmacyData = useCallback(async () => {
    try {
      const [queueData, statsData] = await Promise.all([
        apiFetch<QueueEntry[]>("/pharmacy/queue"),
        apiFetch<PharmacyStats>("/pharmacy/stats"),
      ]);
      setPharmacyQueue(queueData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to fetch pharmacy data:", err);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    fetchPharmacyData();
    const interval = setInterval(fetchPharmacyData, 10000);
    return () => clearInterval(interval);
  }, [fetchPharmacyData]);

  const handleDispenseSuccess = (result: { invoice?: any; optedOutAll?: boolean }) => {
    setSelectedEntryForDispensing(null);
    fetchPharmacyData();

    if (result.optedOutAll) {
      setNotification("Patient opted to buy medicines outside clinic. Queue entry marked complete.");
    } else if (result.invoice) {
      setPrintedInvoice(result.invoice);
      setNotification(`Medicine bill ${result.invoice.invoiceNumber} generated successfully!`);
    }

    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <>
      <PageHeader
        title="Pharmacy & Dispensary Counter"
        description="Review doctor prescriptions, dispense clinic medications, and collect medicine bills."
      />

      {notification && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <TbCheck className="h-4 w-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Real-time Pharmacy Metrics */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/50 dark:bg-teal-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Patients in Queue
            </span>
            <TbClock className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-teal-950 dark:text-teal-100">
            {stats.waitingAtPharmacy}
          </p>
          <span className="text-[11px] text-teal-700/80 dark:text-teal-400/80">Awaiting medicine dispensing</span>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              Dispensed Today
            </span>
            <TbPill className="h-5 w-5 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-950 dark:text-sky-100">
            {stats.dispensedToday}
          </p>
          <span className="text-[11px] text-sky-700/80 dark:text-sky-400/80">Completed prescriptions</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Pharmacy Revenue
            </span>
            <TbReceipt2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-950 dark:text-emerald-100">
            ₹{stats.revenueToday.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Today's medicine collections</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Low Stock Alerts
            </span>
            <TbPackage className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-950 dark:text-amber-100">
            {stats.lowStockCount}
          </p>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Items below minimum reorder</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "queue"
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TbPill className="h-4 w-4" />
          Prescription Dispensing Queue ({pharmacyQueue.length})
        </button>
      </div>

      {/* Tab 1: Live Pharmacy Queue */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {loadingQueue ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              Loading pharmacy dispensing queue...
            </div>
          ) : pharmacyQueue.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
              <TbPill className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                No patients waiting at the pharmacy counter
              </p>
              <p className="mt-1 text-xs text-slate-500">
                When doctors finalize consultations and prescribe medications, patients will automatically enter this queue.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pharmacyQueue.map((entry) => {
                const rx = entry.consultation?.prescription;
                const itemsCount = rx?.items?.length || 0;

                return (
                  <div
                    key={entry.id}
                    className="flex flex-col justify-between rounded-3xl border border-teal-200 bg-white p-5 shadow-sm dark:border-teal-900/50 dark:bg-slate-900"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <span className="rounded-xl bg-teal-600 px-3 py-1 font-mono text-xs font-bold text-white shadow-xs">
                          {entry.tokenNumber}
                        </span>
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                          {itemsCount} {itemsCount === 1 ? "Medicine" : "Medicines"} Prescribed
                        </span>
                      </div>

                      {/* Patient info */}
                      <div className="mt-3.5">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {entry.patient ? `${entry.patient.firstName} ${entry.patient.lastName}` : "—"}
                        </h4>
                        <p className="text-xs text-slate-500">
                          MRN: {entry.patient?.mrn} • {entry.patient?.gender}, {entry.patient?.age || "—"} yrs
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Doctor: <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.doctor?.fullName}</span>
                        </p>
                      </div>

                      {/* Diagnosis */}
                      <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnosis:</span>
                        <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                          {entry.consultation?.diagnosis || "Consultation Completed"}
                        </p>
                      </div>

                      {/* Prescribed Items preview */}
                      {rx?.items && rx.items.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rx Items:</span>
                          {rx.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300">
                              <span className="truncate">• {item.medicineName}</span>
                              <span className="shrink-0 font-mono text-[10px] text-slate-400">
                                {item.frequency} ({item.durationValue} {item.durationUnit})
                              </span>
                            </div>
                          ))}
                          {rx.items.length > 3 && (
                            <p className="text-[10px] text-teal-600 font-semibold dark:text-teal-400">
                              +{rx.items.length - 3} more medications
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        onClick={() => setSelectedEntryForDispensing(entry)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
                      >
                        <TbPill className="h-4 w-4" />
                        Dispense & Bill Medicines
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dispense Modal */}
      {selectedEntryForDispensing && (
        <PharmacyDispenseModal
          entry={selectedEntryForDispensing}
          onClose={() => setSelectedEntryForDispensing(null)}
          onSuccess={handleDispenseSuccess}
        />
      )}

      {/* Receipt Modal */}
      {printedInvoice && (
        <ReceiptPrintModal
          invoice={printedInvoice}
          onClose={() => setPrintedInvoice(null)}
        />
      )}
    </>
  );
}
