"use client";

import { useState, useEffect, useCallback } from "react";
import { Appointment, QueueEntry } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { usePermissions } from "@/context/PermissionsContext";
import { PageHeader } from "../Layout/PageHeader";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { RecordVitalsModal } from "../Reception/RecordVitalsModal";
import { TokenSlipModal } from "../Reception/TokenSlipModal";
import {
  TbCalendarPlus,
  TbCalendarEvent,
  TbClock,
  TbCheck,
  TbX,
  TbHeartRateMonitor,
  TbAlertTriangle,
} from "react-icons/tb";

export function AppointmentsPage() {
  const { has } = usePermissions();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [checkinAppointment, setCheckinAppointment] = useState<Appointment | null>(null);
  const [newlyGeneratedToken, setNewlyGeneratedToken] = useState<QueueEntry | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const qStatus = selectedStatus ? `&status=${selectedStatus}` : "";
      const data = await apiFetch<Appointment[]>(
        `/appointments?date=${selectedDate}${qStatus}`
      );
      setAppointments(data);
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStatus]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id: string) => {
    const reason = prompt("Enter cancellation reason:");
    if (reason === null) return;
    try {
      setActionError(null);
      await apiFetch(`/appointments/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ cancellationReason: reason }),
      });
      fetchAppointments();
    } catch (err: any) {
      setActionError(err.message || "Failed to cancel appointment");
    }
  };

  const handleQuickCheckin = async (apt: Appointment) => {
    try {
      setActionError(null);
      const token = await apiFetch<QueueEntry>(`/appointments/${apt.id}/checkin`, {
        method: "POST",
      });
      setNewlyGeneratedToken(token);
      fetchAppointments();
    } catch (err: any) {
      setActionError(err.message || "Failed to check-in appointment");
    }
  };

  return (
    <>
      <PageHeader
        title="Appointments & Scheduling"
        description="Book, track, and manage doctor consultation appointments."
        action={
          has("appointments:write") && (
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <TbCalendarPlus className="h-4 w-4" />
              Book Appointment
            </button>
          )
        }
      />

      {actionError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <TbAlertTriangle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Date & Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <TbCalendarEvent className="h-4 w-4 text-teal-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              selectedDate === new Date().toISOString().split("T")[0]
                ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const tm = new Date();
              tm.setDate(tm.getDate() + 1);
              setSelectedDate(tm.toISOString().split("T")[0]);
            }}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Tomorrow
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="checked_in">Checked In</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Time Slot</th>
              <th className="px-5 py-3.5">Apt #</th>
              <th className="px-5 py-3.5">Patient Details</th>
              <th className="px-5 py-3.5">Doctor</th>
              <th className="px-5 py-3.5">Type & Source</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                  Loading appointments...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                  No appointments scheduled for {selectedDate}. Click &ldquo;Book Appointment&rdquo; to add one.
                </td>
              </tr>
            ) : (
              appointments.map((apt) => {
                const isScheduled = apt.status === "scheduled";
                const isCheckedIn = apt.status === "checked_in";

                return (
                  <tr key={apt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <TbClock className="h-4 w-4 text-teal-600" />
                        <span>{apt.timeSlot}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {apt.appointmentNumber}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : "—"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {apt.patient?.phone} • MRN: {apt.patient?.mrn}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {apt.doctor?.fullName || "—"}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <p className="font-semibold capitalize text-slate-700 dark:text-slate-300">
                        {apt.type.replace("_", " ")}
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize">Via {apt.channel}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          isCheckedIn
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                            : isScheduled
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : apt.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {apt.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isScheduled && has("appointments:write") && (
                          <>
                            {apt.patient && (
                              <button
                                onClick={() => setCheckinAppointment(apt)}
                                className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300"
                                title="Check In with Vitals"
                              >
                                <TbHeartRateMonitor className="h-3.5 w-3.5" />
                                Vitals Check-in
                              </button>
                            )}
                            <button
                              onClick={() => handleQuickCheckin(apt)}
                              className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                              title="Quick check-in to queue"
                            >
                              Check-In
                            </button>
                            <button
                              onClick={() => handleCancel(apt.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                              title="Cancel"
                            >
                              <TbX className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {isCheckedIn && (
                          <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">In Queue</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <BookAppointmentModal
          onClose={() => setShowBookModal(false)}
          onSuccess={() => {
            setShowBookModal(false);
            fetchAppointments();
          }}
        />
      )}

      {/* Checkin with Vitals Modal */}
      {checkinAppointment && checkinAppointment.patient && (
        <RecordVitalsModal
          patient={checkinAppointment.patient}
          appointmentId={checkinAppointment.id}
          preselectedDoctorId={checkinAppointment.doctorId}
          onClose={() => setCheckinAppointment(null)}
          onSuccess={(token) => {
            setCheckinAppointment(null);
            setNewlyGeneratedToken(token);
            fetchAppointments();
          }}
        />
      )}

      {/* Token Slip Modal */}
      {newlyGeneratedToken && (
        <TokenSlipModal
          entry={newlyGeneratedToken}
          onClose={() => setNewlyGeneratedToken(null)}
        />
      )}
    </>
  );
}
