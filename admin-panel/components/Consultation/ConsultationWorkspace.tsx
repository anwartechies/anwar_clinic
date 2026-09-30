"use client";

import { useState, useEffect } from "react";
import { QueueEntry, Prescription, PrescriptionItem } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { PrescriptionPrintModal } from "../Prescriptions/PrescriptionPrintModal";
import {
  TbStethoscope,
  TbAlertTriangle,
  TbHeartRateMonitor,
  TbPlus,
  TbTrash,
  TbCheck,
  TbX,
  TbHistory,
  TbClock,
  TbPill,
  TbCalendar,
  TbCopy,
  TbNotes,
  TbChevronDown,
  TbChevronUp,
  TbUserCheck,
  TbRefresh,
} from "react-icons/tb";

const COMMON_DIAGNOSES = [
  "Androgenetic Alopecia (Male Pattern Baldness Norwood III-V)",
  "Female Pattern Hair Loss (Ludwig Stage II)",
  "Telogen Effluvium (Acute Stress/Nutritional)",
  "Alopecia Areata (Patchy scalp loss)",
  "Seborrheic Dermatitis (Scalp scaling & inflammation)",
  "Folliculitis Decalvans",
  "Post Hair Transplant Maintenance",
  "Traction Alopecia",
];

const COMMON_PROCEDURES = [
  "Platelet-Rich Plasma (PRP) Scalp Therapy - Session 1",
  "Platelet-Rich Plasma (PRP) Scalp Therapy - Maintenance",
  "Scalp Microneedling / Dermaroller Treatment",
  "Low-Level Laser Light Therapy (LLLT)",
  "FUE Hair Transplant Consultation (Graft Estimation)",
];

const COMMON_INVESTIGATIONS = [
  "Complete Blood Count (CBC) with ESR",
  "Serum Ferritin & Iron Profile",
  "Thyroid Panel (Free T3, Free T4, TSH)",
  "Serum Vitamin D3 & B12",
  "Scalp Trichoscopy & Density Mapping",
];

export function ConsultationWorkspace({
  queueEntry,
  onClose,
  onFinalized,
}: {
  queueEntry: QueueEntry;
  onClose: () => void;
  onFinalized?: () => void;
}) {
  const patient = queueEntry.patient;
  const vitals = queueEntry.vitals;

  // Inventory medicines for quick picker
  const [inventoryItems, setInventoryItems] = useState<{ id: string; name: string; sellingPrice: number }[]>([]);

  // Clinical Workspace Form State
  const [symptoms, setSymptoms] = useState(vitals?.chiefComplaint || "");
  const [examinationFindings, setExaminationFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>([]);
  const [generalAdvice, setGeneralAdvice] = useState(
    "Maintain balanced protein-rich diet. Avoid harsh chemical dyes or excessive heat styling."
  );
  const [followUpDate, setFollowUpDate] = useState("");
  const [consultationFee, setConsultationFee] = useState("1000");

  // Prescribed Medicines list
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([
    {
      medicineName: "Minoxidil 5% Topical Solution",
      genericName: "Minoxidil 5%",
      dosageForm: "lotion",
      strength: "60ml",
      frequency: "0-0-1",
      durationValue: 30,
      durationUnit: "days",
      timing: "at_bedtime",
      instructions: "Apply 1ml with dropper on dry scalp at crown",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalizedPrescription, setFinalizedPrescription] = useState<Prescription | null>(null);

  // Patient Past History Timeline State
  const [timeline, setTimeline] = useState<{
    summary?: {
      totalVisits: number;
      firstVisitDate?: string;
      lastVisitDate?: string;
      pastDoctors: { id: string; fullName: string; department?: string }[];
    };
    consultations: any[];
    prescriptions: any[];
    vitals: any[];
    queueVisits?: any[];
  } | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<"vitals" | "history">("vitals");
  const [expandedConsultationId, setExpandedConsultationId] = useState<string | null>(null);
  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null);

  // Fetch patient medical history timeline
  useEffect(() => {
    if (!patient?.id) return;
    setLoadingTimeline(true);
    apiFetch<any>(`/patients/${patient.id}/timeline`)
      .then((data) => {
        setTimeline(data);
        const past = (data.consultations || []).filter(
          (c: any) => c.queueEntryId !== queueEntry.id && c.status === "finalized"
        );
        if (past.length > 0) {
          setExpandedConsultationId(past[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load patient timeline:", err);
      })
      .finally(() => {
        setLoadingTimeline(false);
      });
  }, [patient?.id, queueEntry.id]);

  const pastConsultations = (timeline?.consultations || []).filter(
    (c: any) => c.queueEntryId !== queueEntry.id && c.status === "finalized"
  );
  const totalVisitsCount = timeline?.summary?.totalVisits || (pastConsultations.length + 1);
  const isRepeatPatient = pastConsultations.length > 0;

  const handleCopyPreviousPrescription = (prevItems: any[], consultationDate?: string) => {
    if (!prevItems || prevItems.length === 0) {
      alert("No medications found in this previous consultation record.");
      return;
    }
    const mapped: PrescriptionItem[] = prevItems.map((item: any) => ({
      medicineName: item.medicineName || "",
      genericName: item.genericName || "",
      dosageForm: item.dosageForm || "tablet",
      strength: item.strength || "",
      frequency: item.frequency || "1-0-1",
      durationValue: Number(item.durationValue) || 30,
      durationUnit: item.durationUnit || "days",
      timing: item.timing || "after_food",
      instructions: item.instructions || "",
    }));
    setMedicines(mapped);
    const dateFormatted = consultationDate
      ? new Date(consultationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";
    setCopySuccessMsg(`Copied ${mapped.length} medicine(s) from previous visit (${dateFormatted}) into active prescription!`);
    setTimeout(() => setCopySuccessMsg(null), 6000);
  };

  // Fetch available pharmacy inventory
  useEffect(() => {
    apiFetch<{ items?: any[] }>("/inventory/overview")
      .then((data) => {
        if (data.items) {
          setInventoryItems(
            data.items.map((i: any) => ({
              id: i.id,
              name: i.name,
              sellingPrice: Number(i.sellingPrice) || 0,
            }))
          );
        }
      })
      .catch(() => { });
  }, []);

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        medicineName: "",
        dosageForm: "tablet",
        strength: "",
        frequency: "1-0-1",
        durationValue: 30,
        durationUnit: "days",
        timing: "after_food",
        instructions: "",
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescriptionItem, val: any) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const toggleProcedure = (proc: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(proc) ? prev.filter((p) => p !== proc) : [...prev, proc]
    );
  };

  const toggleInvestigation = (test: string) => {
    setSelectedInvestigations((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError("Please specify a primary diagnosis before finalizing.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Initialize or find consultation draft
      const draftRes = await apiFetch<any>("/consultations", {
        method: "POST",
        body: JSON.stringify({
          patientId: patient?.id,
          queueEntryId: queueEntry.id,
          symptoms,
          examinationFindings,
          diagnosis,
          clinicalNotes,
          proceduresRecommended: selectedProcedures,
          investigationsAdvised: selectedInvestigations,
          followUpDate: followUpDate || undefined,
          consultationFee: parseFloat(consultationFee) || 0,
        }),
      });

      // 2. Finalize consultation & generate prescription + invoice
      const finalizeRes = await apiFetch<{ consultation: any }>((`/consultations/${draftRes.id}/finalize`), {
        method: "POST",
        body: JSON.stringify({
          diagnosis,
          symptoms,
          examinationFindings,
          clinicalNotes,
          proceduresRecommended: selectedProcedures,
          investigationsAdvised: selectedInvestigations,
          followUpDate: followUpDate || undefined,
          consultationFee: parseFloat(consultationFee) || 0,
          generalAdvice,
          medicines,
        }),
      });

      if (finalizeRes.consultation?.prescription) {
        const rx = finalizeRes.consultation.prescription;
        const resolvedPatient = rx.patient || finalizeRes.consultation.patient || queueEntry.patient;
        const resolvedDoctor = rx.doctor || finalizeRes.consultation.doctor || queueEntry.doctor;
        const resolvedConsultation = {
          ...finalizeRes.consultation,
          diagnosis: diagnosis || finalizeRes.consultation.diagnosis,
          proceduresRecommended: selectedProcedures,
          investigationsAdvised: selectedInvestigations,
          followUpDate: followUpDate || finalizeRes.consultation.followUpDate,
        };

        setFinalizedPrescription({
          ...rx,
          patient: resolvedPatient,
          doctor: resolvedDoctor,
          consultation: resolvedConsultation,
        });
      } else {
        if (onFinalized) onFinalized();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to finalize consultation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex max-h-[96vh] w-full max-w-6xl flex-col rounded-3xl bg-slate-50 shadow-2xl dark:bg-slate-950 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
              <TbStethoscope className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-teal-100 px-2 py-0.5 font-mono text-xs font-bold text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  {queueEntry.tokenNumber}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Doctor Consultation Chamber
                </h2>
                {isRepeatPatient ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
                    <TbHistory className="h-4 w-4 text-amber-600" />
                    Visit #{totalVisitsCount} (Follow-Up)
                    {pastConsultations[0]?.doctor?.fullName && (
                      <span className="font-normal text-amber-800 dark:text-amber-300">
                        • Previously: Dr. {pastConsultations[0].doctor.fullName}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    <TbUserCheck className="h-3.5 w-3.5" />
                    Visit #1 (New Patient)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{patient?.firstName} {patient?.lastName}</span> • MRN: {patient?.mrn}
                {isRepeatPatient && (
                  <button
                    type="button"
                    onClick={() => setActiveLeftTab("history")}
                    className="ml-2 font-bold text-teal-600 hover:underline dark:text-teal-400"
                  >
                    View Previous Visit History ({pastConsultations.length}) →
                  </button>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <TbX className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <TbAlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Split Workspace */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Patient Chart & Vitals Context (35% width) */}
          <div className="w-80 sm:w-96 shrink-0 border-r border-slate-200 bg-white p-6 overflow-y-auto dark:border-slate-800 dark:bg-slate-900">
            {/* Allergies Warning */}
            {patient?.allergies && patient.allergies.length > 0 && (
              <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs dark:border-rose-900 dark:bg-rose-950/50">
                <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200">
                  <TbAlertTriangle className="h-4 w-4 text-rose-600" />
                  HIGH RISK: DRUG ALLERGIES
                </div>
                <p className="mt-1 text-rose-700 dark:text-rose-300">
                  {patient.allergies.join(", ")}
                </p>
              </div>
            )}

            {/* Patient Demographics & Repeat History Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Patient Profile</h4>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isRepeatPatient
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}>
                  {isRepeatPatient ? `Repeat Patient (${totalVisitsCount} Visits)` : "New Walk-in"}
                </span>
              </div>

              <div className="mt-2.5 space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Age / Gender:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {patient?.age || "—"} yrs / {patient?.gender || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Blood Group:</span>
                  <span className="font-semibold text-rose-600">{patient?.bloodGroup || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-mono">{patient?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>City:</span>
                  <span>{patient?.city || "—"}</span>
                </div>
              </div>

              {/* Repeat Visit Past Summary Pill */}
              {isRepeatPatient && timeline?.summary?.pastDoctors && timeline.summary.pastDoctors.length > 0 && (
                <div className="mt-3 border-t border-slate-200/80 pt-2 text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Consulted previously by: </span>
                  <span>{timeline.summary.pastDoctors.map((d) => d.fullName).join(", ")}</span>
                </div>
              )}
            </div>

            {/* Tab Switcher: Today's Vitals vs Past History */}
            <div className="mt-4 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveLeftTab("vitals")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${activeLeftTab === "vitals"
                    ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-300"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
              >
                <TbHeartRateMonitor className="h-4 w-4" />
                Today&apos;s Vitals
              </button>
              <button
                type="button"
                onClick={() => setActiveLeftTab("history")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${activeLeftTab === "history"
                    ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-300"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
              >
                <TbHistory className="h-4 w-4" />
                Past History ({pastConsultations.length})
              </button>
            </div>

            {/* TAB 1: Today's Triage Vitals */}
            {activeLeftTab === "vitals" && (
              <div className="mt-3 space-y-3">
                {vitals ? (
                  <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 text-xs dark:border-teal-900/50 dark:bg-teal-950/30">
                    <div className="flex items-center justify-between font-bold text-teal-800 dark:text-teal-300">
                      <span className="flex items-center gap-1.5">
                        <TbHeartRateMonitor className="h-4 w-4 text-teal-600" />
                        Today&apos;s Triage Vitals
                      </span>
                      <span className="text-[10px] text-teal-600 font-normal">
                        Recorded {new Date().toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white p-2 shadow-xs dark:bg-slate-900">
                        <span className="text-[10px] uppercase text-slate-400">Blood Pressure</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {vitals.bpSystolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : "—"} mmHg
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 shadow-xs dark:bg-slate-900">
                        <span className="text-[10px] uppercase text-slate-400">Pulse</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {vitals.pulseRate ? `${vitals.pulseRate} bpm` : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 shadow-xs dark:bg-slate-900">
                        <span className="text-[10px] uppercase text-slate-400">Temperature</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {vitals.temperature ? `${vitals.temperature} °F` : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 shadow-xs dark:bg-slate-900">
                        <span className="text-[10px] uppercase text-slate-400">Calculated BMI</span>
                        <p className="text-sm font-bold text-teal-700 dark:text-teal-300">
                          {vitals.bmi ? `${vitals.bmi} kg/m²` : "—"}
                        </p>
                      </div>
                    </div>

                    {vitals.chiefComplaint && (
                      <div className="mt-3 border-t border-teal-100 pt-2 text-[11px] text-teal-900 dark:border-teal-900 dark:text-teal-200">
                        <span className="font-bold">Chief Complaint: </span>
                        <span>{vitals.chiefComplaint}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    No triage vitals recorded for this session.
                  </div>
                )}

                {/* Previous Doctor Consultation Highlight (Always shown in Vitals view for repeat patients) */}
                {isRepeatPatient && pastConsultations.length > 0 && (
                  <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-4 text-xs shadow-xs dark:border-amber-900/80 dark:bg-amber-950/40">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 dark:border-amber-900/60">
                      <div className="flex items-center gap-1.5 font-extrabold text-amber-950 dark:text-amber-100">
                        <TbHistory className="h-4 w-4 text-amber-600" />
                        Previous Consultation History
                      </div>
                      <span className="rounded-md bg-amber-200/90 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                        Visit #{pastConsultations.length}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Consulted by:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Dr. {pastConsultations[0].doctor?.fullName || "Previous Doctor"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Date:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(pastConsultations[0].createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="rounded-xl bg-white p-2.5 shadow-2xs dark:bg-slate-900">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Diagnosis</span>
                        <p className="mt-0.5 font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {pastConsultations[0].diagnosis || "Consultation Completed"}
                        </p>
                      </div>

                      {/* Previous Medicines Given by Doctor */}
                      {pastConsultations[0].prescription?.items && pastConsultations[0].prescription.items.length > 0 && (
                        <div className="rounded-xl border border-teal-200 bg-white p-2.5 dark:border-teal-900 dark:bg-slate-900">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-teal-800 dark:text-teal-300 flex items-center gap-1">
                              <TbPill className="h-3.5 w-3.5 text-teal-600" />
                              Medicines Prescribed ({pastConsultations[0].prescription.items.length})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyPreviousPrescription(
                                  pastConsultations[0].prescription.items,
                                  pastConsultations[0].createdAt
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-teal-700 shadow-2xs"
                            >
                              <TbCopy className="h-3 w-3" />
                              Copy to Today
                            </button>
                          </div>

                          <div className="mt-2 space-y-1.5">
                            {pastConsultations[0].prescription.items.map((med: any, mIdx: number) => (
                              <div key={mIdx} className="border-t border-slate-100 pt-1 text-[11px] dark:border-slate-800">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {med.medicineName} {med.strength ? `(${med.strength})` : ""}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {med.frequency} • {med.durationValue} {med.durationUnit} • {med.timing?.replace("_", " ")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setActiveLeftTab("history")}
                        className="w-full text-center py-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-200"
                      >
                        Inspect All {pastConsultations.length} Previous Visit(s) →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Complete Past Medical & Consultation History Timeline */}
            {activeLeftTab === "history" && (
              <div className="mt-3 space-y-3">
                {loadingTimeline ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <TbRefresh className="mx-auto h-5 w-5 animate-spin text-teal-600 mb-2" />
                    Loading medical history timeline...
                  </div>
                ) : pastConsultations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
                    <TbCalendar className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600 mb-1.5" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">First Visit to Clinic</p>
                    <p className="mt-1">No previous consultations found on record. This is their initial intake.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold text-slate-500">
                      Showing {pastConsultations.length} past clinical consultation{pastConsultations.length === 1 ? "" : "s"}:
                    </p>

                    {pastConsultations.map((c: any, cIdx: number) => {
                      const isExpanded = expandedConsultationId === c.id;
                      const cDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "Past Date";
                      const rxItems = c.prescription?.items || [];

                      return (
                        <div
                          key={c.id || cIdx}
                          className="rounded-2xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900"
                        >
                          {/* Visit Header */}
                          <div
                            onClick={() => setExpandedConsultationId(isExpanded ? null : c.id)}
                            className="flex cursor-pointer items-start justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="rounded-md bg-teal-100 px-1.5 py-0.5 font-bold text-[10px] text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                                  Visit #{pastConsultations.length - cIdx}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {cDate}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                                Dr. {c.doctor?.fullName || "Consulting Doctor"}
                                {c.doctor?.department ? ` • ${c.doctor.department}` : ""}
                              </p>
                            </div>

                            <button
                              type="button"
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {isExpanded ? <TbChevronUp className="h-4 w-4" /> : <TbChevronDown className="h-4 w-4" />}
                            </button>
                          </div>

                          {/* Diagnosis Tag */}
                          <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] dark:bg-slate-800/60">
                            <span className="font-semibold text-slate-500">Diagnosis: </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{c.diagnosis || "Consultation Completed"}</span>
                          </div>

                          {/* Expanded Visit Details */}
                          {isExpanded && (
                            <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                              {/* Clinical Symptoms/Findings */}
                              {c.symptoms && (
                                <div className="text-[11px]">
                                  <span className="font-semibold text-slate-500">Symptoms: </span>
                                  <span className="text-slate-700 dark:text-slate-300">{c.symptoms}</span>
                                </div>
                              )}

                              {c.examinationFindings && (
                                <div className="text-[11px]">
                                  <span className="font-semibold text-slate-500">Exam Findings: </span>
                                  <span className="text-slate-700 dark:text-slate-300">{c.examinationFindings}</span>
                                </div>
                              )}

                              {/* Prescribed Medicines in that visit */}
                              <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-2.5 dark:border-teal-900/40 dark:bg-teal-950/20">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1 font-bold text-[11px] text-teal-900 dark:text-teal-200">
                                    <TbPill className="h-3.5 w-3.5 text-teal-600" />
                                    Prescribed Medications ({rxItems.length})
                                  </span>

                                  {rxItems.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyPreviousPrescription(rxItems, c.createdAt)}
                                      title="Copy these medications to today's prescription"
                                      className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs hover:bg-teal-700"
                                    >
                                      <TbCopy className="h-3 w-3" />
                                      Copy to Today&apos;s Rx
                                    </button>
                                  )}
                                </div>

                                {rxItems.length === 0 ? (
                                  <p className="mt-1 text-[10px] italic text-slate-400">No medications logged in this visit.</p>
                                ) : (
                                  <div className="mt-2 space-y-1.5">
                                    {rxItems.map((item: any, iIdx: number) => (
                                      <div
                                        key={iIdx}
                                        className="rounded-lg bg-white p-1.5 text-[11px] shadow-2xs dark:bg-slate-900"
                                      >
                                        <div className="font-bold text-slate-800 dark:text-slate-200">
                                          {item.medicineName} {item.strength ? `(${item.strength})` : ""}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                          <span className="rounded bg-slate-100 px-1 dark:bg-slate-800">
                                            {item.frequency || "1-0-1"}
                                          </span>
                                          <span>{item.durationValue} {item.durationUnit}</span>
                                          <span>• {item.timing?.replace("_", " ")}</span>
                                        </div>
                                        {item.instructions && (
                                          <p className="mt-0.5 text-[10px] italic text-teal-700 dark:text-teal-300">
                                            &ldquo;{item.instructions}&rdquo;
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Doctor's Advice / Notes */}
                              {c.clinicalNotes && (
                                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                  <span className="font-semibold text-slate-500">Doctor Notes: </span>
                                  <span>{c.clinicalNotes}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Active Clinical Workspace (65% width) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <form onSubmit={handleFinalize} className="space-y-6">
              {/* Previous Doctor History Banner for Follow-up Visits */}
              {isRepeatPatient && pastConsultations.length > 0 && (
                <div className="rounded-2xl border-2 border-amber-300 bg-linear-to-r from-amber-50 to-orange-50/50 p-4 shadow-sm dark:border-amber-900/70 dark:from-amber-950/40 dark:to-orange-950/20 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-xs shadow-xs">
                          <TbHistory className="h-4 w-4" />
                        </span>
                        <h4 className="font-extrabold text-amber-950 dark:text-amber-100 text-sm">
                          Returning Follow-Up: Visit #{totalVisitsCount}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                        Previously consulted by{" "}
                        <span className="font-bold text-slate-900 dark:text-white">
                          Dr. {pastConsultations[0].doctor?.fullName || "Previous Doctor"}
                        </span>{" "}
                        on{" "}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(pastConsultations[0].createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {pastConsultations[0].diagnosis ? (
                          <>
                            {" "}• Previous Diagnosis:{" "}
                            <span className="font-bold text-amber-900 dark:text-amber-200">
                              {pastConsultations[0].diagnosis}
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveLeftTab("history")}
                        className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 transition"
                      >
                        View Full Clinical Notes →
                      </button>

                      {pastConsultations[0].prescription?.items?.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPreviousPrescription(
                              pastConsultations[0].prescription.items,
                              pastConsultations[0].createdAt
                            )
                          }
                          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
                        >
                          <TbCopy className="h-4 w-4" />
                          Re-Prescribe / Copy {pastConsultations[0].doctor?.fullName ? `Dr. ${pastConsultations[0].doctor.fullName}'s` : "Previous"} Rx
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnosis Selection */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Primary Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Androgenetic Alopecia Grade IV, Telogen Effluvium"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />

                {/* Quick Diagnosis Suggestion Chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {COMMON_DIAGNOSES.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setDiagnosis(d)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Notes & Findings */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Clinical Symptoms & Presentation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Patient describes gradual diffuse thinning on vertex..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Trichoscopy & Examination Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Miniaturization > 25% noted at crown, yellow dots visible..."
                    value={examinationFindings}
                    onChange={(e) => setExaminationFindings(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Medicine Formulary Builder */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {copySuccessMsg && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 p-3 text-xs font-bold text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200 animate-fadeIn">
                    <TbCheck className="h-4 w-4 shrink-0 text-teal-600" />
                    <span>{copySuccessMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-serif italic font-black text-xl text-teal-700">℞</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Prescription Medications ({medicines.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="flex items-center gap-1 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300"
                  >
                    <TbPlus className="h-4 w-4" />
                    Add Medication
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid flex-1 gap-2.5 sm:grid-cols-4">
                          {/* Medicine Name with autocomplete */}
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500">Medicine Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Minoxidil 5% Lotion, Finasteride 1mg"
                              value={med.medicineName}
                              onChange={(e) => handleMedicineChange(idx, "medicineName", e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            />
                            {inventoryItems.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {inventoryItems.slice(0, 3).map((inv) => (
                                  <button
                                    type="button"
                                    key={inv.id}
                                    onClick={() => {
                                      handleMedicineChange(idx, "medicineName", inv.name);
                                      handleMedicineChange(idx, "inventoryItemId", inv.id);
                                    }}
                                    className="text-[10px] text-teal-600 hover:underline"
                                  >
                                    +{inv.name} (₹{inv.sellingPrice})
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Form */}
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500">Form</label>
                            <select
                              value={med.dosageForm}
                              onChange={(e) => handleMedicineChange(idx, "dosageForm", e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            >
                              <option value="tablet">Tablet</option>
                              <option value="capsule">Capsule</option>
                              <option value="lotion">Lotion</option>
                              <option value="shampoo">Shampoo</option>
                              <option value="serum">Serum</option>
                              <option value="syrup">Syrup</option>
                              <option value="injection">Injection</option>
                            </select>
                          </div>

                          {/* Strength */}
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500">Strength / Vol</label>
                            <input
                              type="text"
                              placeholder="e.g. 500mg, 5%, 60ml"
                              value={med.strength || ""}
                              onChange={(e) => handleMedicineChange(idx, "strength", e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <TbTrash className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Frequency, Duration, Timing */}
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-3 border-t border-slate-200 pt-2.5 dark:border-slate-700">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500">Frequency</label>
                          <div className="mt-1 flex gap-1">
                            {["1-0-0", "1-0-1", "0-0-1", "1-1-1"].map((freq) => (
                              <button
                                type="button"
                                key={freq}
                                onClick={() => handleMedicineChange(idx, "frequency", freq)}
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${med.frequency === freq
                                    ? "bg-teal-600 text-white"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                                  }`}
                              >
                                {freq}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500">Duration</label>
                          <div className="mt-1 flex items-center gap-1">
                            <input
                              type="number"
                              value={med.durationValue}
                              onChange={(e) => handleMedicineChange(idx, "durationValue", e.target.value)}
                              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center font-bold dark:border-slate-700 dark:bg-slate-900"
                            />
                            <select
                              value={med.durationUnit}
                              onChange={(e) => handleMedicineChange(idx, "durationUnit", e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
                            >
                              <option value="days">Days</option>
                              <option value="weeks">Weeks</option>
                              <option value="months">Months</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500">Food Timing</label>
                          <select
                            value={med.timing}
                            onChange={(e) => handleMedicineChange(idx, "timing", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs capitalize dark:border-slate-700 dark:bg-slate-900"
                          >
                            <option value="after_food">After Food</option>
                            <option value="before_food">Before Food</option>
                            <option value="at_bedtime">At Bedtime</option>
                            <option value="as_needed">As Needed</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Special instructions (e.g. Apply 1ml on dry scalp at night)"
                          value={med.instructions || ""}
                          onChange={(e) => handleMedicineChange(idx, "instructions", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs placeholder-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Procedures & Labs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Advise In-Clinic Procedures
                  </h4>
                  <div className="mt-2 space-y-1">
                    {COMMON_PROCEDURES.map((proc) => {
                      const isChecked = selectedProcedures.includes(proc);
                      return (
                        <button
                          type="button"
                          key={proc}
                          onClick={() => toggleProcedure(proc)}
                          className={`flex w-full items-center justify-between rounded-lg p-2 text-left text-xs transition ${isChecked
                              ? "bg-teal-50 font-semibold text-teal-800 dark:bg-teal-950/50 dark:text-teal-200"
                              : "hover:bg-slate-50 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-400"
                            }`}
                        >
                          <span>{proc}</span>
                          {isChecked && <TbCheck className="h-4 w-4 text-teal-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Order Diagnostic Lab Tests
                  </h4>
                  <div className="mt-2 space-y-1">
                    {COMMON_INVESTIGATIONS.map((test) => {
                      const isChecked = selectedInvestigations.includes(test);
                      return (
                        <button
                          type="button"
                          key={test}
                          onClick={() => toggleInvestigation(test)}
                          className={`flex w-full items-center justify-between rounded-lg p-2 text-left text-xs transition ${isChecked
                              ? "bg-teal-50 font-semibold text-teal-800 dark:bg-teal-950/50 dark:text-teal-200"
                              : "hover:bg-slate-50 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-400"
                            }`}
                        >
                          <span>{test}</span>
                          {isChecked && <TbCheck className="h-4 w-4 text-teal-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Advice, Follow-up & Consultation Fee */}
              <div className="grid gap-4 sm:grid-cols-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Doctor Advice & Dietary Guidelines
                  </label>
                  <input
                    type="text"
                    value={generalAdvice}
                    onChange={(e) => setGeneralAdvice(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Follow-Up Review Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <div className="mt-1 flex gap-1">
                    {["15", "30", "60"].map((days) => (
                      <button
                        type="button"
                        key={days}
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + parseInt(days, 10));
                          setFollowUpDate(d.toISOString().split("T")[0]);
                        }}
                        className="text-[10px] text-teal-600 hover:underline"
                      >
                        +{days}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div> */}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t bg-white p-4 dark:border-slate-800 dark:bg-slate-900 rounded-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel / Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? "Finalizing E-Prescription..." : "Sign & Finalize Consultation"}
                  <TbCheck className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {finalizedPrescription && (
        <PrescriptionPrintModal
          prescription={finalizedPrescription}
          onClose={() => {
            setFinalizedPrescription(null);
            if (onFinalized) onFinalized();
            onClose();
          }}
        />
      )}
    </div>
  );
}
