"use client";

import { useState, useEffect } from "react";
import { Patient, QueueEntry } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { TbX, TbHeartRateMonitor, TbAlertTriangle, TbCheck, TbReceipt2 } from "react-icons/tb";

interface DoctorUser {
  id: string;
  fullName: string;
  department?: string | null;
  designation?: string | null;
  role?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function RecordVitalsModal({
  patient,
  appointmentId,
  preselectedDoctorId,
  onClose,
  onSuccess,
}: {
  patient: Patient;
  appointmentId?: string;
  preselectedDoctorId?: string;
  onClose: () => void;
  onSuccess: (queueEntry: QueueEntry) => void;
}) {
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId || "");
  const [priority, setPriority] = useState<"normal" | "follow_up" | "emergency" | "vip">("normal");

  // Vitals State
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [pulseRate, setPulseRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [spO2, setSpO2] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [sugarTestType, setSugarTestType] = useState<"random" | "fasting" | "post_prandial">("random");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [triageNotes, setTriageNotes] = useState("");

  // Upfront Consultation Fee State (Front-desk Cashier)
  const [consultationFee, setConsultationFee] = useState("500");
  const [waiveFee, setWaiveFee] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card" | "net_banking">("cash");
  const [paymentNotes, setPaymentNotes] = useState("Paid at reception desk");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available consulting doctors
    apiFetch<DoctorUser[]>("/doctors")
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setDoctors(list);
        if (list.length > 0) {
          setSelectedDoctorId((prev) => (prev ? prev : list[0].id));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch doctors:", err);
      });
  }, []);

  // Compute BMI dynamically
  const weightNum = parseFloat(weightKg);
  const heightNum = parseFloat(heightCm);
  let computedBmi: number | null = null;
  let bmiCategory: { label: string; color: string } | null = null;

  if (!isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0) {
    const hMeter = heightNum / 100;
    computedBmi = parseFloat((weightNum / (hMeter * hMeter)).toFixed(1));
    if (computedBmi < 18.5) {
      bmiCategory = { label: "Underweight", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" };
    } else if (computedBmi <= 24.9) {
      bmiCategory = { label: "Normal Weight", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" };
    } else if (computedBmi <= 29.9) {
      bmiCategory = { label: "Overweight", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
    } else {
      bmiCategory = { label: "Obese", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" };
    }
  }

  // Clinical alerts
  const isHighBp = parseInt(bpSystolic, 10) >= 140 || parseInt(bpDiastolic, 10) >= 90;
  const isLowBp = parseInt(bpSystolic, 10) > 0 && parseInt(bpSystolic, 10) <= 90;
  const isFever = parseFloat(temperature) >= 99.5;
  const isHypoxic = parseInt(spO2, 10) > 0 && parseInt(spO2, 10) < 95;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError("Please select a consulting doctor");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        patientId: patient.id,
        doctorId: selectedDoctorId,
        appointmentId: appointmentId || undefined,
        priority,
        consultationFee: waiveFee ? 0 : parseFloat(consultationFee) || 0,
        paymentMethod,
        paymentNotes,
        waiveFee,
        vitals: {
          bpSystolic,
          bpDiastolic,
          pulseRate,
          temperature,
          spO2,
          bloodSugar,
          sugarTestType,
          weightKg,
          heightCm,
          chiefComplaint,
          triageNotes,
        },
      };

      const res = await apiFetch<QueueEntry>("/queue/checkin", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess(res);
    } catch (err: any) {
      setError(err.message || "Failed to save vitals and assign token");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <TbHeartRateMonitor className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Record Patient Vitals & Triage
              </h2>
              <p className="text-xs text-slate-500">
                {patient.firstName} {patient.lastName} • MRN: {patient.mrn} • {patient.gender}, {patient.age || "—"} yrs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <TbX className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <TbAlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Doctor & Priority Assignment */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Assign Consulting Doctor *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select Doctor...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} {d.designation ? `(${d.designation})` : d.role?.name ? `(${d.role.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="normal">Normal Walk-in</option>
                <option value="follow_up">Scheduled Follow-up</option>
                <option value="emergency">Emergency / Acute Attention</option>
                <option value="vip">Senior / VIP</option>
              </select>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vital Signs & Measurements
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              {/* BP */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Blood Pressure (mmHg)
                </label>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="120"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-center text-sm font-semibold focus:outline-none ${
                      isHighBp
                        ? "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                        : isLowBp
                        ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    }`}
                  />
                  <span className="text-slate-400">/</span>
                  <input
                    type="number"
                    placeholder="80"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-center text-sm font-semibold focus:outline-none ${
                      isHighBp
                        ? "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                        : isLowBp
                        ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    }`}
                  />
                </div>
                {isHighBp && <p className="mt-1 text-[10px] font-semibold text-rose-600">High Blood Pressure Alert</p>}
              </div>

              {/* Pulse */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Pulse Rate (BPM)
                </label>
                <input
                  type="number"
                  placeholder="72"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-sm font-semibold focus:outline-none ${
                    isFever
                      ? "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  }`}
                />
                {isFever && <p className="mt-1 text-[10px] font-semibold text-rose-600">Fever Detected</p>}
              </div>

              {/* SpO2 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  SpO2 (%)
                </label>
                <input
                  type="number"
                  placeholder="99"
                  value={spO2}
                  onChange={(e) => setSpO2(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-sm font-semibold focus:outline-none ${
                    isHypoxic
                      ? "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  }`}
                />
                {isHypoxic && <p className="mt-1 text-[10px] font-semibold text-rose-600">Low Oxygen Saturation</p>}
              </div>

              {/* Blood Sugar */}
              <div>
                <div className="flex justify-between">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Sugar (mg/dL)
                  </label>
                  <select
                    value={sugarTestType}
                    onChange={(e) => setSugarTestType(e.target.value as any)}
                    className="text-[10px] font-semibold text-teal-600 dark:text-teal-400"
                  >
                    <option value="random">Random</option>
                    <option value="fasting">Fasting</option>
                    <option value="post_prandial">Post Prandial</option>
                  </select>
                </div>
                <input
                  type="number"
                  placeholder="110"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Weight & Height */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Computed BMI Banner */}
            {computedBmi && bmiCategory && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <span className="text-xs text-slate-500">Calculated Body Mass Index (BMI):</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{computedBmi} kg/m²</span>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Chief Complaint / Reason for Visit
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Crown hair thinning for past 6 months, severe dandruff, consultation for hair transplant"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Upfront Consultation Fee Billing (Receptionist Desk) */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/50 dark:bg-teal-950/20">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                <TbReceipt2 className="h-4 w-4 text-teal-600" />
                Front-Desk Consultation Fee
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={waiveFee}
                  onChange={(e) => setWaiveFee(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Complimentary / Follow-up (₹0 Fee)</span>
              </label>
            </div>

            {!waiveFee && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="cash">Cash (Paid at Counter)</option>
                    <option value="upi">UPI (GPay / PhonePe / QR)</option>
                    <option value="card">Debit / Credit Card (POS)</option>
                    <option value="net_banking">Net Banking / Transfer</option>
                  </select>
                </div>
              </div>
            )}
            <p className="mt-2 text-[11px] text-teal-700/80 dark:text-teal-400/80">
              {waiveFee
                ? "This visit is marked complimentary. No upfront consultation fee will be billed."
                : `A paid receipt of ₹${Number(consultationFee || 0).toLocaleString()} will be generated upon token issuance. Prescribed medicines will be billed separately at the pharmacy.`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Saving & Enqueueing..." : "Collect Fee & Issue Token"}
              <TbCheck className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
