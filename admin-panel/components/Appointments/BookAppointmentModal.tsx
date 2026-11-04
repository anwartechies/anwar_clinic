"use client";

import { useState, useEffect } from "react";
import { Appointment, Patient } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { TbX, TbCalendarPlus, TbAlertTriangle, TbSearch } from "react-icons/tb";

const TIME_SLOTS = [
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 11:30",
  "11:30 - 12:00",
  "12:00 - 12:30",
  "12:30 - 01:00",
  "02:00 - 02:30",
  "02:30 - 03:00",
  "03:00 - 03:30",
  "03:30 - 04:00",
  "04:00 - 04:30",
  "04:30 - 05:00",
  "05:00 - 05:30",
  "05:30 - 06:00",
  "06:00 - 06:30",
  "06:30 - 07:00",
];

export function BookAppointmentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}) {
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [doctors, setDoctors] = useState<{ id: string; fullName: string; designation?: string | null; role?: { name: string; slug: string } | null }[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[2]);
  const [type, setType] = useState<"new_consultation" | "follow_up" | "procedure" | "review">("new_consultation");
  const [channel, setChannel] = useState<"walk_in" | "phone" | "website" | "whatsapp">("phone");
  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors
  useEffect(() => {
    apiFetch<any>("/doctors")
      .then((res: any) => {
        const list = Array.isArray(res) ? res : [];
        setDoctors(list);
        if (list.length > 0) {
          setSelectedDoctorId((prev: string) => (prev ? prev : list[0].id));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch doctors:", err);
      });
  }, []);

  // Search patients
  useEffect(() => {
    if (!patientSearch.trim()) {
      setPatientResults([]);
      return;
    }
    const timer = setTimeout(() => {
      apiFetch<{ patients: Patient[] }>(`/patients?search=${encodeURIComponent(patientSearch)}&limit=5`)
        .then((data) => setPatientResults(data.patients))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError("Please search and select a patient");
      return;
    }
    if (!selectedDoctorId) {
      setError("Please select a doctor");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        patientId: selectedPatient.id,
        doctorId: selectedDoctorId,
        appointmentDate,
        timeSlot,
        type,
        channel,
        reason,
      };

      const apt = await apiFetch<Appointment>("/appointments", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess(apt);
    } catch (err: any) {
      setError(err.message || "Failed to book appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <TbCalendarPlus className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Book Patient Appointment
              </h2>
              <p className="text-xs text-slate-500">Select doctor, date, and schedule slot</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Patient *
            </label>
            {selectedPatient ? (
              <div className="mt-1 flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-900/50 dark:bg-teal-950/30">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    MRN: <span className="font-mono">{selectedPatient.mrn}</span> • {selectedPatient.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 shadow-sm hover:bg-rose-50 dark:bg-slate-800 dark:text-rose-400"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative mt-1">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <TbSearch className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by phone (+91...) or name..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full bg-transparent focus:outline-none dark:text-slate-100"
                  />
                </div>

                {patientResults.length > 0 && (
                  <div className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    {patientResults.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setSelectedPatient(p);
                          setPatientResults([]);
                          setPatientSearch("");
                        }}
                        className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            MRN: {p.mrn} • {p.phone}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-teal-600">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor & Date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Doctor *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} {d.designation ? `(${d.designation})` : d.role?.name ? `(${d.role.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Time Slot *
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Type & Channel */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Consultation Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="new_consultation">New Consultation</option>
                <option value="follow_up">Follow-Up Visit</option>
                <option value="procedure">Clinical Procedure</option>
                <option value="review">Post-Op Review</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Booking Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="phone">Phone Call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="website">Website Portal</option>
                <option value="walk_in">Walk-In Desk</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reason / Symptoms
            </label>
            <input
              type="text"
              placeholder="e.g. Scalp consultation, FUE hair transplant inquiry"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 border-t pt-4 dark:border-slate-800">
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
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
