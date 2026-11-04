"use client";

import { QueueEntry } from "../Clinical/types";
import { TbPrinter, TbX } from "react-icons/tb";

export function TokenSlipModal({
  entry,
  onClose,
}: {
  entry: QueueEntry;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Patient Token Slip</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <TbX className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-token" className="my-6 rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            Nexgen Clinic
          </p>
          <p className="text-[11px] text-slate-500">Outpatient Consultation Department</p>

          <div className="my-5 rounded-lg bg-teal-50 py-4 dark:bg-teal-950/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Token</span>
            <div className="text-4xl font-extrabold text-teal-700 dark:text-teal-300">
              {entry.tokenNumber}
            </div>
            <span className="inline-block mt-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
              {entry.priority}
            </span>
          </div>

          <div className="space-y-1.5 text-left text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-400">Patient:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {entry.patient ? `${entry.patient.firstName} ${entry.patient.lastName}` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MRN:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{entry.patient?.mrn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consulting Doctor:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {entry.doctor?.fullName || "Assigned Doctor"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Queue Date:</span>
              <span>{entry.queueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Check-in Time:</span>
              <span>{new Date(entry.queuedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {entry.consultationInvoice ? (
              <div className="flex justify-between border-t border-slate-200 pt-1.5 dark:border-slate-800">
                <span className="text-slate-400">Consultation Fee:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{Number(entry.consultationInvoice.netTotal).toLocaleString()} (PAID • {entry.consultationInvoice.paymentMethod.toUpperCase()})
                </span>
              </div>
            ) : (
              <div className="flex justify-between border-t border-slate-200 pt-1.5 dark:border-slate-800">
                <span className="text-slate-400">Consultation Fee:</span>
                <span className="font-medium text-slate-500">
                  Complimentary Visit
                </span>
              </div>
            )}
          </div>

          <p className="mt-6 text-[10px] text-slate-400">
            Please watch the waiting room monitor for your token number.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            <TbPrinter className="h-4 w-4" />
            Print Token
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
