"use client";

import { useState, useEffect, useCallback } from "react";
import { Prescription } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "../Layout/PageHeader";
import { PrescriptionPrintModal } from "./PrescriptionPrintModal";
import { TbSearch, TbPrinter, TbEye, TbPrescription } from "react-icons/tb";

export function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `&search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<{
        prescriptions: Prescription[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/prescriptions?page=${page}&limit=20${q}`);
      setPrescriptions(data.prescriptions);
      setTotal(data.total);
    } catch (err: any) {
      console.error("Failed to fetch prescriptions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleOpenPrint = async (rx: Prescription) => {
    try {
      const full = await apiFetch<Prescription>(`/prescriptions/${rx.id}`);
      setSelectedPrescription(full);
    } catch {
      setSelectedPrescription(rx);
    }
  };

  return (
    <>
      <PageHeader
        title="Prescriptions & E-Prescribing Archive"
        description="Search, view, and print patient medical prescriptions."
      />

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <TbSearch className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Rx Number (RX-...), Patient Name, or Phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100"
        />
      </div>

      {/* Prescriptions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Rx Number</th>
              <th className="px-5 py-3.5">Date Issued</th>
              <th className="px-5 py-3.5">Patient Details</th>
              <th className="px-5 py-3.5">Doctor</th>
              <th className="px-5 py-3.5">Clinical Diagnosis</th>
              <th className="px-5 py-3.5">Items</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                  Loading prescriptions...
                </td>
              </tr>
            ) : prescriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                  <TbPrescription className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 font-medium">No prescriptions found</p>
                </td>
              </tr>
            ) : (
              prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                    {rx.prescriptionNumber}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {new Date(rx.signedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {rx.patient ? `${rx.patient.firstName} ${rx.patient.lastName}` : "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {rx.patient?.phone} • MRN: {rx.patient?.mrn}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {rx.doctor?.fullName || "—"}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300">
                    {rx.consultation?.diagnosis || "—"}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {rx.items?.length || 0} drugs
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleOpenPrint(rx)}
                      className="inline-flex items-center gap-1 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300"
                    >
                      <TbPrinter className="h-3.5 w-3.5" />
                      View & Print
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedPrescription && (
        <PrescriptionPrintModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </>
  );
}
