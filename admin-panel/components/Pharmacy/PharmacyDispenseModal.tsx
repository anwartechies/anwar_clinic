"use client";

import { useState, useEffect } from "react";
import { QueueEntry, PrescriptionItem } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import {
  TbX,
  TbPill,
  TbAlertTriangle,
  TbReceipt,
  TbCheck,
  TbShoppingBag,
  TbPrinter,
  TbLoader,
} from "react-icons/tb";

interface DispenseItemState {
  prescriptionItemId?: string;
  medicineName: string;
  inventoryItemId?: string | null;
  stockQuantity: number;
  unitPrice: number;
  quantity: number;
  dispense: boolean;
  dosageForm: string;
  strength?: string | null;
  frequency: string;
  duration: string;
}

function mapPrescriptionItems(rxItems: PrescriptionItem[]): DispenseItemState[] {
  return rxItems.map((item) => {
    const inv = item.inventoryItem;
    const price = inv?.sellingPrice ? Number(inv.sellingPrice) : 150; // reasonable fallback price if not cataloged
    const stock = inv?.stockQuantity !== undefined ? Number(inv.stockQuantity) : 50;

    // Estimate initial quantity from duration
    let initialQty = 1;
    if (item.dosageForm === "tablet" || item.dosageForm === "capsule") {
      initialQty = Math.max(10, (item.durationValue || 30) * 1);
    } else {
      initialQty = 1;
    }

    return {
      prescriptionItemId: item.id,
      medicineName: item.medicineName,
      inventoryItemId: item.inventoryItemId || inv?.id || null,
      stockQuantity: stock,
      unitPrice: price,
      quantity: initialQty,
      dispense: true,
      dosageForm: item.dosageForm,
      strength: item.strength,
      frequency: item.frequency,
      duration: `${item.durationValue} ${item.durationUnit}`,
    };
  });
}

export function PharmacyDispenseModal({
  entry,
  onClose,
  onSuccess,
}: {
  entry: QueueEntry;
  onClose: () => void;
  onSuccess: (result: { invoice?: any; optedOutAll?: boolean }) => void;
}) {
  const [currentEntry, setCurrentEntry] = useState<QueueEntry>(entry);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const consultation = currentEntry.consultation;
  const prescription = consultation?.prescription;
  const rxItems: PrescriptionItem[] = prescription?.items || [];

  // Initialize items from doctor's prescription
  const [items, setItems] = useState<DispenseItemState[]>(() => mapPrescriptionItems(rxItems));

  // Sync currentEntry if prop changes
  useEffect(() => {
    setCurrentEntry(entry);
    const newItems = entry.consultation?.prescription?.items || [];
    if (newItems.length > 0) {
      setItems(mapPrescriptionItems(newItems));
    }
  }, [entry]);

  // If entry lacks prescription items, hydrate from /pharmacy/queue
  useEffect(() => {
    const hasItems = (currentEntry.consultation?.prescription?.items?.length ?? 0) > 0;
    if (!hasItems) {
      setLoadingDetails(true);
      apiFetch<QueueEntry[]>("/pharmacy/queue")
        .then((queueList) => {
          const matched = queueList.find((q) => q.id === currentEntry.id);
          if (matched && matched.consultation?.prescription?.items?.length) {
            setCurrentEntry(matched);
            setItems(mapPrescriptionItems(matched.consultation.prescription.items));
          }
        })
        .catch((err) => {
          console.warn("Could not fetch hydrated pharmacy queue entry:", err);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [currentEntry.id]);

  const [discountAmount, setDiscountAmount] = useState("0");
  const [taxAmount, setTaxAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card" | "net_banking">("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculations
  const dispensedItems = items.filter((i) => i.dispense);
  const subtotal = dispensedItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discount = Math.max(0, parseFloat(discountAmount) || 0);
  const tax = Math.max(0, parseFloat(taxAmount) || 0);
  const netTotal = Math.max(0, subtotal - discount + tax);

  const toggleDispense = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, dispense: !item.dispense } : item))
    );
  };

  const updateQuantity = (index: number, qty: number) => {
    const validQty = Math.max(1, isNaN(qty) ? 1 : qty);
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: validQty } : item))
    );
  };

  const updateUnitPrice = (index: number, price: number) => {
    const validPrice = Math.max(0, isNaN(price) ? 0 : price);
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, unitPrice: validPrice } : item))
    );
  };

  const selectAll = (dispense: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, dispense })));
  };

  const handleDispenseAndBill = async () => {
    if (dispensedItems.length === 0) {
      setError("Please select at least one medicine to dispense, or choose 'Patient Buying Outside'.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const payload = {
        queueEntryId: currentEntry.id,
        patientId: currentEntry.patientId,
        consultationId: consultation?.id,
        prescriptionId: prescription?.id,
        optedOutAll: false,
        items: dispensedItems.map((item) => ({
          medicineName: `${item.medicineName} (${item.dosageForm})`,
          inventoryItemId: item.inventoryItemId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          dispense: true,
        })),
        discountAmount: discount,
        discountReason: discount > 0 ? "Pharmacy Counter Discount" : null,
        taxAmount: tax,
        paymentMethod,
        paymentNotes: paymentNotes.trim() || undefined,
      };

      const res = await apiFetch<{ message: string; invoice: any; queueEntry: any }>(
        "/pharmacy/dispense",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      onSuccess({ invoice: res.invoice });
    } catch (err: any) {
      setError(err.message || "Failed to dispense medicines and generate invoice");
    } finally {
      setProcessing(false);
    }
  };

  const handlePatientBuyingOutside = async () => {
    const confirmed = window.confirm(
      "Confirm: Patient is purchasing all prescribed medicines from an outside pharmacy. This will mark their clinic visit as complete without generating an in-house medicine bill."
    );
    if (!confirmed) return;

    setProcessing(true);
    setError(null);

    try {
      const payload = {
        queueEntryId: currentEntry.id,
        patientId: currentEntry.patientId,
        consultationId: consultation?.id,
        prescriptionId: prescription?.id,
        optedOutAll: true,
      };

      await apiFetch("/pharmacy/dispense", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess({ optedOutAll: true });
    } catch (err: any) {
      setError(err.message || "Failed to update queue status");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <TbPill className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-teal-600 px-2 py-0.5 font-mono text-xs font-bold text-white">
                  {currentEntry.tokenNumber}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Pharmacy Dispensing & Medicine Billing
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentEntry.patient?.firstName} {currentEntry.patient?.lastName}</span> • MRN: {currentEntry.patient?.mrn} • Doctor: {currentEntry.doctor?.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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

        {/* Clinical Summary Banner */}
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Primary Diagnosis
            </span>
            <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              {consultation?.diagnosis || (loadingDetails ? "Fetching diagnosis..." : "Consultation Completed")}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Prescription Number
            </span>
            <p className="mt-0.5 font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
              {prescription?.prescriptionNumber || (loadingDetails ? "Fetching..." : "RX-IN-HOUSE")}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Known Allergies
            </span>
            <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              {currentEntry.patient?.allergies && currentEntry.patient.allergies.length > 0 ? (
                <span className="rounded bg-rose-100 px-2 py-0.5 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {currentEntry.patient.allergies.join(", ")}
                </span>
              ) : (
                <span className="text-slate-400">None reported</span>
              )}
            </p>
          </div>
        </div>

        {/* Prescribed Medicines Selection */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Doctor's Prescribed Medicines ({items.length})
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => selectAll(true)}
                className="font-medium text-teal-600 hover:underline dark:text-teal-400"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => selectAll(false)}
                className="font-medium text-slate-500 hover:underline dark:text-slate-400"
              >
                Deselect All (Outside)
              </button>
            </div>
          </div>

          {loadingDetails ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-teal-200 bg-teal-50/20 p-8 text-center text-xs font-semibold text-teal-600 dark:border-teal-900/50">
              <TbLoader className="h-5 w-5 animate-spin" />
              Loading prescription medications...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
              No specific medications were entered in this prescription.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80">
                  <tr>
                    <th className="px-4 py-3">Dispense</th>
                    <th className="px-4 py-3">Medicine & Dosage</th>
                    <th className="px-4 py-3">Frequency / Duration</th>
                    <th className="px-4 py-3 text-center">Stock</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price (₹)</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      className={
                        item.dispense
                          ? "bg-white hover:bg-slate-50/50 dark:bg-slate-900"
                          : "bg-slate-50/60 opacity-60 dark:bg-slate-800/20"
                      }
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.dispense}
                          onChange={() => toggleDispense(idx)}
                          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>

                      {/* Medicine info */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {item.medicineName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.dosageForm} {item.strength ? `• ${item.strength}` : ""}
                        </p>
                      </td>

                      {/* Dosage details */}
                      <td className="px-4 py-3 font-mono">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.frequency}
                        </span>{" "}
                        <span className="text-[10px] text-slate-400">({item.duration})</span>
                      </td>

                      {/* Stock availability */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.stockQuantity > 10
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : item.stockQuantity > 0
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : "Out of stock"}
                        </span>
                      </td>

                      {/* Quantity Input */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="1"
                          disabled={!item.dispense}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(idx, parseInt(e.target.value, 10))}
                          className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center font-bold text-slate-900 focus:border-teal-500 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="10"
                          disabled={!item.dispense}
                          value={item.unitPrice}
                          onChange={(e) => updateUnitPrice(idx, parseFloat(e.target.value))}
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right font-semibold text-slate-900 focus:border-teal-500 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </td>

                      {/* Line Total */}
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {item.dispense ? `₹${(item.quantity * item.unitPrice).toLocaleString()}` : "Outside"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment & Invoice Summary */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Payment Method & Notes */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Payment & Dispensing Notes
            </h4>

            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Payment Mode *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="cash">Cash (Counter Collection)</option>
                  <option value="upi">UPI (GPay, PhonePe, QR Code)</option>
                  <option value="card">Debit / Credit Card (POS)</option>
                  <option value="net_banking">Net Banking / Direct Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Pharmacist Dispensing Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advised to take with lukewarm water, batch #2026-08"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4 dark:border-teal-900/50 dark:bg-teal-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Pharmacy Bill Calculation
            </h4>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Medicines Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-20 rounded border border-slate-200 bg-white px-2 py-0.5 text-right font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>GST / Tax (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  className="w-20 rounded border border-slate-200 bg-white px-2 py-0.5 text-right font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="border-t border-teal-200 pt-2 text-sm font-extrabold text-teal-900 dark:border-teal-800 dark:text-teal-200 flex justify-between">
                <span>Net Payable:</span>
                <span className="text-base text-teal-700 dark:text-teal-300">₹{netTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col justify-between sm:flex-row sm:items-center gap-3 border-t pt-4 dark:border-slate-800">
          <button
            type="button"
            disabled={processing}
            onClick={handlePatientBuyingOutside}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <TbShoppingBag className="h-4 w-4 text-slate-400" />
            Patient Buying All Medicines Outside (Discharge)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={processing || dispensedItems.length === 0}
              onClick={handleDispenseAndBill}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 disabled:opacity-50"
            >
              <TbReceipt className="h-4 w-4" />
              {processing ? "Processing..." : `Dispense & Bill (₹${netTotal.toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
