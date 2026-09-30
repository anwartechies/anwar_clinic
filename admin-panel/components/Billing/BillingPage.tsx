"use client";

import { useState, useEffect, useCallback } from "react";
import { Invoice, QueueEntry } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "../Layout/PageHeader";
import { PaymentModal } from "./PaymentModal";
import { ReceiptPrintModal } from "./ReceiptPrintModal";
import {
  TbReceipt2,
  TbClock,
  TbSearch,
  TbPrinter,
  TbCreditCard,
  TbAlertTriangle,
} from "react-icons/tb";

export function BillingPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "invoices">("pending");

  // Pending Billing Queue State
  const [pendingQueue, setPendingQueue] = useState<QueueEntry[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  // Invoices Ledger State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Modals
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const data = await apiFetch<QueueEntry[]>("/billing/pending");
      setPendingQueue(data);
    } catch (err: any) {
      console.error("Failed to fetch pending bills:", err);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const q = search ? `&search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch<{ invoices: Invoice[]; total: number }>(
        `/billing/invoices?page=${page}&limit=20${q}`
      );
      setInvoices(data.invoices);
      setTotalInvoices(data.total);
    } catch (err: any) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoadingInvoices(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPending();
    } else {
      fetchInvoices();
    }
  }, [activeTab, fetchPending, fetchInvoices]);

  const handleOpenPaymentFromQueue = (entry: QueueEntry) => {
    const inv = (entry as any).consultation?.invoice;
    if (inv) {
      setSelectedInvoiceForPayment(inv);
    } else {
      setError("No draft invoice found for this encounter. Please ask doctor to finalize consultation.");
    }
  };

  return (
    <>
      <PageHeader
        title="Billing & Cashier POS"
        description="Process patient invoices, collect payments, and generate tax receipts."
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <TbAlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "pending"
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TbClock className="h-4 w-4" />
          Pending Checkout ({pendingQueue.length})
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "invoices"
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TbReceipt2 className="h-4 w-4" />
          Invoices & Ledger ({totalInvoices})
        </button>
      </div>

      {/* Tab 1: Pending Queue */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {loadingPending ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              Loading pending checkout queue...
            </div>
          ) : pendingQueue.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
              <TbReceipt2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                No patients currently waiting for checkout
              </p>
              <p className="text-xs text-slate-500">
                When doctors finalize consultations, invoices will automatically appear here for payment collection.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingQueue.map((entry) => {
                const inv = (entry as any).consultation?.invoice;
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col justify-between rounded-2xl border border-purple-200 bg-white p-5 shadow-sm dark:border-purple-900/50 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="rounded-xl bg-purple-600 px-3 py-1 font-mono text-xs font-bold text-white">
                          {entry.tokenNumber}
                        </span>
                        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Awaiting Payment
                        </span>
                      </div>

                      <div className="mt-3.5">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {entry.patient ? `${entry.patient.firstName} ${entry.patient.lastName}` : "—"}
                        </h4>
                        <p className="text-xs text-slate-500">
                          MRN: {entry.patient?.mrn} • {entry.patient?.phone}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Doctor: <span className="font-semibold">{entry.doctor?.fullName}</span>
                        </p>
                      </div>

                      {inv && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                          <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                            <span>Total Bill:</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              ₹{Number(inv.netTotal).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">
                            Includes consultation fee & prescribed medicines
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 border-t pt-3 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenPaymentFromQueue(entry)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                      >
                        <TbCreditCard className="h-4 w-4" />
                        Collect Payment & Discharge
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Invoices History Table */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <TbSearch className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices by Invoice # (INV-...), Patient Name, or Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Net Total</th>
                  <th className="px-5 py-3.5">Amount Paid</th>
                  <th className="px-5 py-3.5">Payment Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingInvoices ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {new Date(inv.billedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {inv.patient?.phone} • MRN: {inv.patient?.mrn}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        ₹{Number(inv.netTotal).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-semibold text-teal-700 dark:text-teal-400">
                        ₹{Number(inv.paidAmount).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            inv.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : inv.paymentStatus === "partial"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.paymentStatus !== "paid" && (
                            <button
                              onClick={() => setSelectedInvoiceForPayment(inv)}
                              className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300"
                            >
                              Settle Due
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoiceForReceipt(inv)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                            title="Print Receipt"
                          >
                            <TbPrinter className="h-3.5 w-3.5" />
                            Receipt
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

      {/* Payment Collection Modal */}
      {selectedInvoiceForPayment && (
        <PaymentModal
          invoice={selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onPaymentSuccess={(paidInv) => {
            setSelectedInvoiceForPayment(null);
            setSelectedInvoiceForReceipt(paidInv);
            fetchPending();
            fetchInvoices();
          }}
        />
      )}

      {/* Receipt Print Modal */}
      {selectedInvoiceForReceipt && (
        <ReceiptPrintModal
          invoice={selectedInvoiceForReceipt}
          onClose={() => setSelectedInvoiceForReceipt(null)}
        />
      )}
    </>
  );
}
