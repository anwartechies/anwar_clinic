"use client";

import { useState, useEffect } from "react";
import { Patient, PatientVitals, Consultation, Prescription, Invoice } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import {
  TbX,
  TbHeartRateMonitor,
  TbStethoscope,
  TbPrescription,
  TbReceipt2,
  TbAlertTriangle,
  TbCalendarEvent,
} from "react-icons/tb";

interface TimelineData {
  vitals: PatientVitals[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  invoices: Invoice[];
}

export function PatientDetailDrawer({
  patientId,
  onClose,
  onRecordVitals,
}: {
  patientId: string;
  onClose: () => void;
  onRecordVitals?: (patient: Patient) => void;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [timeline, setTimeline] = useState<TimelineData>({
    vitals: [],
    consultations: [],
    prescriptions: [],
    invoices: [],
  });
  const [activeTab, setActiveTab] = useState<"overview" | "vitals" | "consultations" | "prescriptions" | "billing">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ patient: Patient }>(`/patients/${patientId}`),
      apiFetch<TimelineData>(`/patients/${patientId}/timeline`),
    ])
      .then(([pData, tData]) => {
        setPatient(pData.patient);
        setTimeline(tData);
      })
      .catch((err) => console.error("Patient timeline fetch error:", err))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
        <div className="flex h-full w-full max-w-xl items-center justify-center bg-white p-6 shadow-2xl dark:bg-slate-900">
          <p className="text-sm text-slate-500">Loading patient chart...</p>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="border-b p-6 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-lg font-bold text-white shadow-md">
                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-xs text-slate-500">
                  MRN: <span className="font-mono font-semibold">{patient.mrn}</span> • {patient.phone}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {patient.gender}, {patient.age ? `${patient.age} yrs` : "—"}
                  </span>
                  {patient.bloodGroup && (
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      Blood: {patient.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onRecordVitals && (
                <button
                  onClick={() => onRecordVitals(patient)}
                  className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                >
                  Record Vitals
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <TbX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Allergies Alert */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              <TbAlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>Known Drug Allergies: {patient.allergies.join(", ")}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-5 flex border-b border-slate-200 dark:border-slate-800">
            {[
              { id: "overview", label: "Overview" },
              { id: "vitals", label: `Vitals (${timeline.vitals.length})` },
              { id: "consultations", label: `Visits (${timeline.consultations.length})` },
              { id: "prescriptions", label: `Prescriptions (${timeline.prescriptions.length})` },
              { id: "billing", label: `Invoices (${timeline.invoices.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`border-b-2 px-3.5 py-2 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Contact & Address</h4>
                <div className="mt-2 grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                  <p>Email: <span className="font-medium text-slate-800 dark:text-slate-200">{patient.email || "—"}</span></p>
                  <p>City: <span className="font-medium text-slate-800 dark:text-slate-200">{patient.city || "—"}</span></p>
                  <p className="col-span-2">Address: <span className="font-medium text-slate-800 dark:text-slate-200">{patient.address || "—"}</span></p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Emergency Contact</h4>
                <div className="mt-2 text-slate-600 dark:text-slate-400">
                  <p>Contact: <span className="font-medium text-slate-800 dark:text-slate-200">{patient.emergencyContactName || "—"}</span></p>
                  <p>Phone: <span className="font-medium text-slate-800 dark:text-slate-200">{patient.emergencyContactPhone || "—"}</span></p>
                </div>
              </div>

              {patient.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Patient Notes</h4>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{patient.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "vitals" && (
            <div className="space-y-3">
              {timeline.vitals.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">No vitals recorded yet.</p>
              ) : (
                timeline.vitals.map((v) => (
                  <div key={v.id} className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(v.recordedAt).toLocaleString()}</span>
                      <span>By: {v.recordedBy?.fullName || "Staff"}</span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                      {v.bpSystolic && (
                        <span className="rounded-lg bg-teal-50 px-2 py-1 font-semibold text-teal-800 dark:bg-teal-950/50 dark:text-teal-200">
                          BP: {v.bpSystolic}/{v.bpDiastolic} mmHg
                        </span>
                      )}
                      {v.pulseRate && (
                        <span className="rounded-lg bg-sky-50 px-2 py-1 font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
                          Pulse: {v.pulseRate} bpm
                        </span>
                      )}
                      {v.temperature && (
                        <span className="rounded-lg bg-amber-50 px-2 py-1 font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                          Temp: {v.temperature}°F
                        </span>
                      )}
                      {v.bmi && (
                        <span className="rounded-lg bg-purple-50 px-2 py-1 font-semibold text-purple-800 dark:bg-purple-950/50 dark:text-purple-200">
                          BMI: {v.bmi} kg/m²
                        </span>
                      )}
                    </div>
                    {v.chiefComplaint && (
                      <p className="mt-2 text-xs italic text-slate-600 dark:text-slate-400">
                        &ldquo;{v.chiefComplaint}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "consultations" && (
            <div className="space-y-3">
              {timeline.consultations.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">No past consultations recorded.</p>
              ) : (
                timeline.consultations.map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                        {c.consultationNumber}
                      </span>
                      <span className="text-slate-500">{new Date(c.startedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Doctor: {c.doctor?.fullName || "—"}</p>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Diagnosis:</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{c.diagnosis}</p>
                    </div>
                    {c.clinicalNotes && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Notes:</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{c.clinicalNotes}</p>
                      </div>
                    )}
                    {c.followUpDate && (
                      <p className="mt-2 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                        Follow-up: {c.followUpDate}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="space-y-3">
              {timeline.prescriptions.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">No prescriptions issued yet.</p>
              ) : (
                timeline.prescriptions.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{p.prescriptionNumber}</span>
                      <span className="text-slate-500">{new Date(p.signedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Prescribing Doctor: {p.doctor?.fullName}</p>
                    {p.items && p.items.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t pt-2 text-xs">
                        {p.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                            <span>
                              <strong>{it.medicineName}</strong> {it.strength} ({it.frequency}, {it.durationValue} {it.durationUnit})
                            </span>
                            <span className="text-[11px] text-slate-500 capitalize">{it.timing.replace("_", " ")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-3">
              {timeline.invoices.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">No invoices recorded yet.</p>
              ) : (
                timeline.invoices.map((inv) => (
                  <div key={inv.id} className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          inv.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Total: ₹{Number(inv.netTotal).toLocaleString()}</span>
                      <span>Paid: ₹{Number(inv.paidAmount).toLocaleString()}</span>
                      <span>Balance: ₹{Number(inv.balanceDue).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
