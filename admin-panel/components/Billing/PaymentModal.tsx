"use client";

import { useState } from "react";
import { Invoice } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import {
  TbX,
  TbCreditCard,
  TbCash,
  TbQrcode,
  TbArrowsExchange,
  TbCheck,
  TbAlertTriangle,
} from "react-icons/tb";

export function PaymentModal({
  invoice,
  onClose,
  onPaymentSuccess,
}: {
  invoice: Invoice;
  onClose: () => void;
  onPaymentSuccess: (paidInvoice: Invoice) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card" | "net_banking" | "split">("upi");
  const [paidAmount, setPaidAmount] = useState(String(invoice.balanceDue || invoice.netTotal));
  const [discountAmount, setDiscountAmount] = useState(String(invoice.discountAmount || 0));
  const [discountReason, setDiscountReason] = useState(invoice.discountReason || "");
  const [taxAmount, setTaxAmount] = useState(String(invoice.taxAmount || 0));
  const [tenderReceived, setTenderReceived] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate net total and balance
  const subtotal = Number(invoice.subtotal);
  const disc = parseFloat(discountAmount) || 0;
  const tax = parseFloat(taxAmount) || 0;
  const computedNet = Math.max(0, subtotal - disc + tax);
  const toPay = parseFloat(paidAmount) || 0;

  // Tender change calculation
  const tender = parseFloat(tenderReceived) || 0;
  const changeToReturn = Math.max(0, tender - toPay);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await apiFetch<{ message: string; invoice: Invoice }>(
        `/billing/invoices/${invoice.id}/collect-payment`,
        {
          method: "POST",
          body: JSON.stringify({
            paidAmount: toPay,
            paymentMethod,
            discountAmount: disc,
            discountReason: discountReason || undefined,
            taxAmount: tax,
            paymentNotes: paymentNotes || undefined,
          }),
        }
      );

      onPaymentSuccess(res.invoice);
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Collect Payment & Discharge
            </h2>
            <p className="text-xs text-slate-500">
              Invoice #{invoice.invoiceNumber} • Patient: {invoice.patient?.firstName} {invoice.patient?.lastName}
            </p>
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
          {/* Bill Summary Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40">
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">₹{subtotal.toLocaleString()}</span>
              </div>

              {/* Discount Field */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-xs text-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              {/* Tax Field */}
              <div className="flex items-center justify-between gap-2">
                <span>GST / Tax (₹):</span>
                <input
                  type="number"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                <span>Net Payable:</span>
                <span>₹{computedNet.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Payment Method *
            </label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[
                { id: "upi", label: "UPI / QR", icon: <TbQrcode className="h-4 w-4" /> },
                { id: "cash", label: "Cash", icon: <TbCash className="h-4 w-4" /> },
                { id: "card", label: "Card / POS", icon: <TbCreditCard className="h-4 w-4" /> },
                { id: "split", label: "Split", icon: <TbArrowsExchange className="h-4 w-4" /> },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    paymentMethod === m.id
                      ? "border-teal-600 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paying */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount to Collect (₹) *
              </label>
              <input
                type="number"
                required
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Cash Tender Calculator */}
            {paymentMethod === "cash" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cash Tendered (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={tenderReceived}
                  onChange={(e) => setTenderReceived(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                {tender > 0 && (
                  <p className="mt-1 text-[11px] font-bold text-teal-700 dark:text-teal-400">
                    Change to Return: ₹{changeToReturn.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Discount Reason if discount given */}
          {disc > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reason for Discount
              </label>
              <input
                type="text"
                placeholder="e.g. Staff courtesy / Festival Promo"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          {/* Action Buttons */}
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
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Processing..." : "Collect & Settle Invoice"}
              <TbCheck className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
