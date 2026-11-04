"use client";

import { useState, useEffect, useCallback } from "react";
import { Patient, QueueEntry } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { PageHeader } from "../Layout/PageHeader";
import { LiveQueueBoard } from "../Reception/LiveQueueBoard";
import { QuickPatientModal } from "./QuickPatientModal";
import { RecordVitalsModal } from "../Reception/RecordVitalsModal";
import { PatientDetailDrawer } from "./PatientDetailDrawer";
import { TokenSlipModal } from "../Reception/TokenSlipModal";
import { ConsultationWorkspace } from "../Consultation/ConsultationWorkspace";
import {
  TbUserPlus,
  TbSearch,
  TbHeartRateMonitor,
  TbEye,
  TbUsers,
  TbClock,
} from "react-icons/tb";

export function PatientsPage({
  onOpenConsultation,
}: {
  onOpenConsultation?: (queueEntry: QueueEntry) => void;
}) {
  const { has } = usePermissions();
  const [activeTab, setActiveTab] = useState<"queue" | "directory">("queue");

  // Patients Directory State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals & Drawers
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<QueueEntry | null>(null);
  const [consultingQueueEntry, setConsultingQueueEntry] = useState<QueueEntry | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `&search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<{
        patients: Patient[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/patients?page=${page}&limit=15${q}`);
      setPatients(data.patients);
      setTotal(data.total);
    } catch (err: any) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (activeTab === "directory") {
      fetchPatients();
    }
  }, [activeTab, fetchPatients]);

  const handlePatientRegistered = (newPatient: Patient, andRecordVitals?: boolean) => {
    setShowRegisterModal(false);
    if (andRecordVitals) {
      setVitalsPatient(newPatient);
    } else {
      setActiveTab("directory");
      fetchPatients();
    }
  };

  const handleVitalsSuccess = (queueEntry: QueueEntry) => {
    setVitalsPatient(null);
    setNewlyCreatedToken(queueEntry);
    setActiveTab("queue");
  };

  return (
    <>
      <PageHeader
        title="Patients & Front-Desk Queue"
        description="Patient intake, triage vitals recording, and live doctor waiting queue."
        action={
          has("patients:write") && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                <TbUserPlus className="h-4 w-4" />
                Register Walk-in Patient
              </button>
            </div>
          )
        }
      />

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
          <TbClock className="h-4 w-4" />
          Live Waiting Queue
        </button>
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "directory"
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TbUsers className="h-4 w-4" />
          Patient Registry ({total})
        </button>
      </div>

      {/* Tab 1: Live Queue Board */}
      {activeTab === "queue" && (
        <LiveQueueBoard onOpenConsultation={onOpenConsultation || ((entry) => setConsultingQueueEntry(entry))} />
      )}

      {/* Tab 2: Patients Directory */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <TbSearch className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by Name, Phone (+91...), or MRN (ANW-...)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100"
            />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">MRN</th>
                  <th className="px-5 py-3.5">Patient Name</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Demographics</th>
                  <th className="px-5 py-3.5">Blood Group</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                      Searching patients...
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                      No patient records found. Register a new patient to get started.
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                        {p.mrn}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {p.firstName} {p.lastName}
                        {p.allergies && p.allergies.length > 0 && (
                          <span className="ml-2 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Allergies
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">{p.phone}</td>
                      <td className="px-5 py-4 text-xs capitalize">
                        {p.gender}, {p.age ? `${p.age} yrs` : "—"}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {p.bloodGroup ? (
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                            {p.bloodGroup}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {has("vitals:write") && (
                            <button
                              onClick={() => setVitalsPatient(p)}
                              className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300"
                              title="Record Vitals & Add to Queue"
                            >
                              <TbHeartRateMonitor className="h-3.5 w-3.5" />
                              Check-In & Vitals
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPatientId(p.id)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                            title="View Patient Chart"
                          >
                            <TbEye className="h-3.5 w-3.5" />
                            Chart
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <QuickPatientModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handlePatientRegistered}
        />
      )}

      {/* Vitals & Triage Modal */}
      {vitalsPatient && (
        <RecordVitalsModal
          patient={vitalsPatient}
          onClose={() => setVitalsPatient(null)}
          onSuccess={handleVitalsSuccess}
        />
      )}

      {/* Patient Detail Drawer */}
      {selectedPatientId && (
        <PatientDetailDrawer
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onRecordVitals={(p) => {
            setSelectedPatientId(null);
            setVitalsPatient(p);
          }}
        />
      )}

      {/* Token Slip Print Modal */}
      {newlyCreatedToken && (
        <TokenSlipModal
          entry={newlyCreatedToken}
          onClose={() => setNewlyCreatedToken(null)}
        />
      )}

      {/* Doctor Consultation Chamber Modal */}
      {consultingQueueEntry && (
        <ConsultationWorkspace
          queueEntry={consultingQueueEntry}
          onClose={() => setConsultingQueueEntry(null)}
          onFinalized={() => {
            setConsultingQueueEntry(null);
            fetchPatients();
          }}
        />
      )}
    </>
  );
}
