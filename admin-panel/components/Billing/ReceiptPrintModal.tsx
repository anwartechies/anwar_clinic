"use client";

import { Invoice } from "../Clinical/types";
import { TbPrinter, TbX } from "react-icons/tb";

export function ReceiptPrintModal({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  const patient = invoice.patient;
  const items = invoice.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex max-h-[95vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Tax Invoice & Receipt</span>
            <span className="font-mono text-xs text-teal-600 dark:text-teal-400">({invoice.invoiceNumber})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <TbPrinter className="h-4 w-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <TbX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div id="printable-receipt" className="mx-auto max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-800">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-black tracking-tight text-teal-800">Nexgen CLINIC</h2>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Hair Transplant & Aesthetic Surgery</p>
              <p className="text-[10px] text-slate-400 mt-1">GSTIN: 27AABCA1234F1Z5 • Patna, Bihar</p>
            </div>

            {/* Invoice & Patient Meta */}
            <div className="my-3 space-y-1 text-xs border-b pb-3 text-slate-600">
              <div className="flex justify-between">
                <span>Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{new Date(invoice.billedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Patient Name:</span>
                <span className="font-semibold text-slate-900">{patient ? `${patient.firstName} ${patient.lastName}` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>MRN:</span>
                <span className="font-mono text-slate-700">{patient?.mrn}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase text-teal-700">{invoice.paymentMethod}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="my-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-1 text-left">Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx} className="py-1.5">
                      <td className="py-1.5 text-left font-medium text-slate-900">{it.description}</td>
                      <td className="py-1.5 text-center text-slate-500">{it.quantity}</td>
                      <td className="py-1.5 text-right text-slate-500">₹{Number(it.unitPrice).toLocaleString()}</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">₹{Number(it.totalPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 border-t pt-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              {Number(invoice.discountAmount) > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-₹{Number(invoice.discountAmount).toLocaleString()}</span>
                </div>
              )}
              {Number(invoice.taxAmount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax:</span>
                  <span>+₹{Number(invoice.taxAmount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-900 pt-1.5 text-sm font-extrabold text-slate-900">
                <span>Net Total Payable:</span>
                <span>₹{Number(invoice.netTotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-teal-800">
                <span>Amount Paid:</span>
                <span>₹{Number(invoice.paidAmount).toLocaleString()}</span>
              </div>
              {Number(invoice.balanceDue) > 0 && (
                <div className="flex justify-between font-bold text-rose-600">
                  <span>Balance Due:</span>
                  <span>₹{Number(invoice.balanceDue).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 border-t pt-4 text-center text-[10px] text-slate-400">
              <p>Thank you for choosing Nexgen Clinic!</p>
              <p className="mt-0.5">Medicines once sold cannot be returned.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
