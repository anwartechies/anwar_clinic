"use client";

import { useState, useEffect } from "react";
import { QueueEntry, Patient } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { ConsultationWorkspace } from "../Consultation/ConsultationWorkspace";
import { QuickPatientModal } from "../Patients/QuickPatientModal";
import { RecordVitalsModal } from "../Reception/RecordVitalsModal";
import { TokenSlipModal } from "../Reception/TokenSlipModal";
import { PharmacyDispenseModal } from "../Pharmacy/PharmacyDispenseModal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TbStethoscope,
  TbClock,
  TbUsers,
  TbReceipt2,
  TbUserPlus,
  TbHeartRateMonitor,
  TbCalendarPlus,
  TbCheck,
  TbArrowRight,
  TbPill,
} from "react-icons/tb";

export function ClinicalDashboardWidgets() {
  const pathname = usePathname();
  const roleSlug = pathname.split("/")[1] || "";
  const { effectiveRoleSlug, has, userId } = usePermissions();
  const isDoctor = effectiveRoleSlug === "doctor";
  const isPharmacist = effectiveRoleSlug === "pharmacist";
  const isReceptionist = effectiveRoleSlug === "receptionist" || (!isDoctor && !isPharmacist && has("queue:write"));

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    inConsultation: 0,
    pendingBilling: 0,
    pendingPharmacy: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  // Active consultation workspace modal
  const [consultingQueueEntry, setConsultingQueueEntry] = useState<QueueEntry | null>(null);

  // Pharmacy dispense modal
  const [selectedForDispensing, setSelectedForDispensing] = useState<QueueEntry | null>(null);

  // Quick modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState<Patient | null>(null);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<QueueEntry | null>(null);

  const fetchTodayQueue = async () => {
    try {
      const data = await apiFetch<{ stats: any; queue: QueueEntry[] }>("/queue/today");
      setQueue(data.queue);
      setStats(data.stats);
    } catch {
      // Ignore if user lacks permission or API unready
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayQueue();
    const timer = setInterval(fetchTodayQueue, 15000);
    return () => clearInterval(timer);
  }, []);

  // Find currently consulting patient for doctor
  const currentInChamber = queue.find(
    (e) => e.status === "in_consultation" && (!isDoctor || !e.doctorId || e.doctorId === userId)
  );
  const nextWaitingPatients = queue.filter(
    (e) => e.status === "waiting" && (!isDoctor || !e.doctorId || e.doctorId === userId)
  );

  const handleCallPatient = async (entry: QueueEntry) => {
    try {
      await apiFetch(`/queue/${entry.id}/call`, { method: "PATCH" });
      await fetchTodayQueue();
      setConsultingQueueEntry(entry);
    } catch (err: any) {
      alert(err.message || "Failed to call patient");
    }
  };

  return (
    <div className="mb-8 space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. DOCTOR DASHBOARD VIEW                                      */}
      {/* ------------------------------------------------------------- */}
      {isDoctor && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Live Consultation Desk
            </h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Clinic Queue
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Active Consultation Chamber Card */}
            <div className="lg:col-span-2 rounded-3xl border border-teal-200 bg-linear-to-br from-teal-50/60 to-white p-6 shadow-sm dark:border-teal-900/50 dark:from-teal-950/20 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  <TbStethoscope className="h-4 w-4" />
                  Currently Inside Chamber
                </span>
                {currentInChamber && (
                  <span className="rounded-full bg-teal-100 px-3 py-1 font-mono text-xs font-bold text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                    {currentInChamber.tokenNumber}
                  </span>
                )}
              </div>

              {currentInChamber ? (
                <div className="mt-4 flex flex-col justify-between sm:flex-row sm:items-center gap-4">
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      {currentInChamber.patient ? `${currentInChamber.patient.firstName} ${currentInChamber.patient.lastName}` : "—"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      MRN: {currentInChamber.patient?.mrn} • {currentInChamber.patient?.gender}, {currentInChamber.patient?.age || "—"} yrs
                    </p>

                    {currentInChamber.vitals && (
                      <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                        {currentInChamber.vitals.bpSystolic && (
                          <span className="rounded-md bg-white px-2 py-0.5 font-semibold text-slate-800 shadow-xs dark:bg-slate-800 dark:text-slate-200">
                            BP: {currentInChamber.vitals.bpSystolic}/{currentInChamber.vitals.bpDiastolic}
                          </span>
                        )}
                        {currentInChamber.vitals.bmi && (
                          <span className="rounded-md bg-white px-2 py-0.5 font-semibold text-slate-800 shadow-xs dark:bg-slate-800 dark:text-slate-200">
                            BMI: {currentInChamber.vitals.bmi}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setConsultingQueueEntry(currentInChamber)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-700"
                  >
                    <TbStethoscope className="h-4 w-4" />
                    Open Consultation Workspace
                  </button>
                </div>
              ) : (
                <div className="my-6 text-center">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Chamber is currently empty.
                  </p>
                  {nextWaitingPatients.length > 0 ? (
                    <button
                      onClick={() => handleCallPatient(nextWaitingPatients[0])}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                    >
                      Call Next Patient ({nextWaitingPatients[0].tokenNumber})
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">No patients waiting in queue right now.</p>
                  )}
                </div>
              )}
            </div>

            {/* Next in Line Queue */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Waiting in Lobby ({nextWaitingPatients.length})
                </span>
                <Link
                  href={`/${roleSlug}/patients`}
                  className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
                >
                  View All
                </Link>
              </div>

              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                {nextWaitingPatients.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">Waiting lobby is empty</p>
                ) : (
                  nextWaitingPatients.slice(0, 4).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                            {entry.tokenNumber}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {entry.patient ? `${entry.patient.firstName} ${entry.patient.lastName}` : "—"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {entry.vitals?.chiefComplaint || "General consultation"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCallPatient(entry)}
                        className="rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300"
                      >
                        Call In
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. RECEPTIONIST / FRONT-DESK VIEW                             */}
      {/* ------------------------------------------------------------- */}
      {isReceptionist && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Front-Desk Intake & Lobby Traffic
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                <TbUserPlus className="h-4 w-4" />
                Register Walk-in
              </button>
              <Link
                href={`/${roleSlug}/appointments`}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <TbCalendarPlus className="h-4 w-4" />
                Book Appointment
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
                In Waiting Lobby
              </span>
              <p className="mt-1 text-2xl font-black text-amber-900 dark:text-amber-100">{stats.waiting}</p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
              <span className="text-xs font-bold uppercase text-sky-700 dark:text-sky-300">
                With Doctor
              </span>
              <p className="mt-1 text-2xl font-black text-sky-900 dark:text-sky-100">{stats.inConsultation}</p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20">
              <span className="text-xs font-bold uppercase text-purple-700 dark:text-purple-300">
                Awaiting Checkout
              </span>
              <p className="mt-1 text-2xl font-black text-purple-900 dark:text-purple-100">{stats.pendingBilling}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                Discharged Today
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-900 dark:text-emerald-100">{stats.completed}</p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. PHARMACIST VIEW                                            */}
      {/* ------------------------------------------------------------- */}
      {isPharmacist && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Pharmacy Dispensing Counter
            </h3>
            <Link
              href={`/${roleSlug}/pharmacy`}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
            >
              Open Pharmacy Board <TbArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/50 dark:bg-teal-950/20">
              <span className="text-xs font-bold uppercase text-teal-800 dark:text-teal-300">
                Awaiting Dispensing
              </span>
              <p className="mt-1 text-2xl font-black text-teal-950 dark:text-teal-100">
                {queue.filter((e) => e.status === "pending_pharmacy").length}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
              <span className="text-xs font-bold uppercase text-sky-800 dark:text-sky-300">
                Total Queue Tokens Today
              </span>
              <p className="mt-1 text-2xl font-black text-sky-900 dark:text-sky-100">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                Discharged Patients
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-900 dark:text-emerald-100">{stats.completed}</p>
            </div>
          </div>

          {/* Pending Pharmacy List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Patients Waiting for Medicine Dispensing
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {queue.filter((e) => e.status === "pending_pharmacy").length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <TbPill className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-1" />
                  No patients waiting at the pharmacy counter right now.
                </div>
              ) : (
                queue
                  .filter((e) => e.status === "pending_pharmacy")
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/30 p-4 dark:border-teal-900/40 dark:bg-teal-950/20"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-teal-600 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                            {entry.tokenNumber}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {entry.patient ? `${entry.patient.firstName} ${entry.patient.lastName}` : "—"}
                          </span>
                          <span className="text-xs text-slate-400">MRN: {entry.patient?.mrn}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Doctor: <span className="font-semibold">{entry.doctor?.fullName}</span> • Diagnosis: {entry.consultation?.diagnosis || "Consultation Completed"}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedForDispensing(entry)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
                      >
                        <TbPill className="h-4 w-4" />
                        Dispense & Bill
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {consultingQueueEntry && (
        <ConsultationWorkspace
          queueEntry={consultingQueueEntry}
          onClose={() => setConsultingQueueEntry(null)}
          onFinalized={() => {
            setConsultingQueueEntry(null);
            fetchTodayQueue();
          }}
        />
      )}

      {selectedForDispensing && (
        <PharmacyDispenseModal
          entry={selectedForDispensing}
          onClose={() => setSelectedForDispensing(null)}
          onSuccess={() => {
            setSelectedForDispensing(null);
            fetchTodayQueue();
          }}
        />
      )}

      {showRegisterModal && (
        <QuickPatientModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(newPatient, andVitals) => {
            setShowRegisterModal(false);
            if (andVitals) {
              setVitalsPatient(newPatient);
            }
          }}
        />
      )}

      {vitalsPatient && (
        <RecordVitalsModal
          patient={vitalsPatient}
          onClose={() => setVitalsPatient(null)}
          onSuccess={(token) => {
            setVitalsPatient(null);
            setNewlyCreatedToken(token);
            fetchTodayQueue();
          }}
        />
      )}

      {newlyCreatedToken && (
        <TokenSlipModal
          entry={newlyCreatedToken}
          onClose={() => setNewlyCreatedToken(null)}
        />
      )}
    </div>
  );
}
