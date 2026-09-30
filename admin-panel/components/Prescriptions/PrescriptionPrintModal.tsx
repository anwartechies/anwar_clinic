"use client";

import { useState } from "react";
import { Prescription } from "../Clinical/types";
import { TbPrinter, TbX, TbCheck, TbAlertTriangle } from "react-icons/tb";

export function PrescriptionPrintModal({
  prescription,
  onClose,
}: {
  prescription: Prescription;
  onClose: () => void;
}) {
  const [selectedDensity, setSelectedDensity] = useState<
    "auto" | "spacious" | "standard" | "compact" | "dense"
  >("auto");

  const patient = prescription.patient || prescription.consultation?.patient;
  const doctor = prescription.doctor || prescription.consultation?.doctor;
  const consultation = prescription.consultation;
  const items = prescription.items || [];
  const itemCount = items.length;

  const doctorRawName = doctor?.fullName?.trim() || "";
  const doctorName = doctorRawName
    ? doctorRawName.toLowerCase().startsWith("dr")
      ? doctorRawName
      : `Dr. ${doctorRawName}`
    : "Dr. Consulting Physician";

  const doctorDept = doctor?.department || "Aesthetic Dermatology & Trichology";
  const doctorDesignation = doctor?.designation || "Senior Consultant & Hair Specialist";

  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`.trim()
    : "—";

  const patientAge = patient?.age ? `${patient.age} Yrs` : "—";
  const patientGender = patient?.gender ? patient.gender.toUpperCase() : "—";
  const patientMrn = patient?.mrn || "—";
  const patientPhone = patient?.phone || "—";

  const issueDate = prescription.signedAt
    ? new Date(prescription.signedAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Calculate clinical content load score to dynamically adapt layout
  const extraBlocksCount =
    (consultation?.proceduresRecommended?.length ? 1 : 0) +
    (consultation?.investigationsAdvised?.length ? 1 : 0) +
    (prescription.generalAdvice ? 1 : 0) +
    (consultation?.secondaryDiagnosis ? 1 : 0);

  // Auto-calculated density tier based on number of medicines and extra clinical sections:
  // - 1 to 3 medicines: spacious (comfortable, fills single A4 sheet elegantly)
  // - 4 to 6 medicines: standard (balanced spacing)
  // - 7 to 9 medicines: compact (optimized padding and font size)
  // - 10+ medicines: dense (ultra-compact to guarantee 100% single A4 page fit)
  const autoDensity: "spacious" | "standard" | "compact" | "dense" = (() => {
    if (itemCount >= 10 || (itemCount >= 8 && extraBlocksCount >= 2)) return "dense";
    if (itemCount >= 7 || (itemCount >= 5 && extraBlocksCount >= 2)) return "compact";
    if (itemCount >= 4 || (itemCount >= 3 && extraBlocksCount >= 2)) return "standard";
    return "spacious";
  })();

  const density = selectedDensity === "auto" ? autoDensity : selectedDensity;

  // Dedicated iframe printer to guarantee 0% parent DOM interference and true (0, 0) A4 page alignment
  const handlePrint = () => {
    const rxElement = document.getElementById("printable-rx");
    if (!rxElement) {
      window.print();
      return;
    }

    // Create or reuse hidden print iframe
    let printFrame = document.getElementById("rx-isolated-print-frame") as HTMLIFrameElement;
    if (!printFrame) {
      printFrame = document.createElement("iframe");
      printFrame.id = "rx-isolated-print-frame";
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "none";
      printFrame.style.opacity = "0";
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    // Collect all stylesheets from head so Tailwind and custom fonts are preserved
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join("\n");

    const printPad =
      density === "dense"
        ? "4mm 6mm"
        : density === "compact"
          ? "6mm 8mm"
          : "8mm 10mm";

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${prescription.prescriptionNumber}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm 8mm 10mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              width: 100% !important;
              height: 100% !important;
            }
            #printable-rx {
              position: static !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: 275mm !important;
              height: auto !important;
              max-height: 278mm !important;
              margin: 0 !important;
              padding: ${printPad} !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              overflow: hidden !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
            }
          </style>
        </head>
        <body>
          ${rxElement.outerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    }, 250);
  };

  // Dynamic style tokens per density mode
  const s = {
    spacious: {
      wrapperPadding: "p-8 sm:p-10",
      headerPb: "pb-4",
      clinicTitle: "text-2xl font-black",
      clinicSub: "text-xs",
      clinicAddr: "text-[11px]",
      docName: "text-base font-extrabold",
      docDesig: "text-xs",
      docDept: "text-xs",
      docReg: "text-[10px]",
      demoBox: "my-4 p-3.5 text-xs",
      demoLabel: "text-[10px]",
      demoVal: "text-xs font-semibold",
      diagBox: "mb-4 p-3 text-xs",
      diagTitle: "text-[11px]",
      rxHeader: "mb-2.5",
      rxSymbol: "text-2xl",
      rxTitle: "text-xs",
      thPad: "py-2.5 text-[11px]",
      tdPad: "py-2.5",
      medName: "text-sm font-bold text-slate-900",
      medDetails: "text-[11px] text-slate-500",
      badge: "text-xs px-2 py-0.5",
      duration: "text-xs font-semibold",
      timing: "text-xs font-semibold",
      notes: "text-[11px] italic text-slate-500",
      sectionMargin: "mt-4 pt-3 text-xs gap-4",
      sectionTitle: "text-[10px]",
      adviceBox: "mt-4 pt-3 text-xs space-y-2",
      followUpBadge: "px-3 py-1 text-xs",
      footerMargin: "mt-6 pt-4",
      disclaimer: "text-[9px] space-y-1 max-w-xs",
      sigBadge: "px-2.5 py-0.5 text-[10px]",
      sigName: "text-lg font-serif",
      sigDesig: "text-[10px]",
      sigRole: "text-[9px]",
      sigReg: "text-[9px]",
    },
    standard: {
      wrapperPadding: "p-6 sm:p-8",
      headerPb: "pb-3",
      clinicTitle: "text-xl font-black",
      clinicSub: "text-[11px]",
      clinicAddr: "text-[10px]",
      docName: "text-sm font-extrabold",
      docDesig: "text-[11px]",
      docDept: "text-[11px]",
      docReg: "text-[9px]",
      demoBox: "my-2.5 p-2.5 text-xs",
      demoLabel: "text-[9.5px]",
      demoVal: "text-xs font-semibold",
      diagBox: "mb-2.5 p-2 text-xs",
      diagTitle: "text-[10.5px]",
      rxHeader: "mb-2",
      rxSymbol: "text-xl",
      rxTitle: "text-xs",
      thPad: "py-2 text-[10.5px]",
      tdPad: "py-1.5",
      medName: "text-xs font-bold text-slate-900",
      medDetails: "text-[10px] text-slate-500",
      badge: "text-[11px] px-1.5 py-0.5",
      duration: "text-[11px] font-semibold",
      timing: "text-[11px] font-semibold",
      notes: "text-[10px] italic text-slate-500",
      sectionMargin: "mt-3 pt-2 text-xs gap-3",
      sectionTitle: "text-[9.5px]",
      adviceBox: "mt-3 pt-2 text-xs space-y-1.5",
      followUpBadge: "px-2.5 py-0.5 text-[11px]",
      footerMargin: "mt-4 pt-3",
      disclaimer: "text-[8.5px] space-y-0.5 max-w-xs",
      sigBadge: "px-2 py-0.5 text-[9px]",
      sigName: "text-base font-serif",
      sigDesig: "text-[9.5px]",
      sigRole: "text-[8.5px]",
      sigReg: "text-[8.5px]",
    },
    compact: {
      wrapperPadding: "p-5 sm:p-6",
      headerPb: "pb-2",
      clinicTitle: "text-lg font-black",
      clinicSub: "text-[10px]",
      clinicAddr: "text-[9px]",
      docName: "text-xs font-extrabold",
      docDesig: "text-[10px]",
      docDept: "text-[10px]",
      docReg: "text-[8.5px]",
      demoBox: "my-2 p-2 text-[11px]",
      demoLabel: "text-[9px]",
      demoVal: "text-[11px] font-semibold",
      diagBox: "mb-2 p-1.5 text-[11px]",
      diagTitle: "text-[10px]",
      rxHeader: "mb-1",
      rxSymbol: "text-lg",
      rxTitle: "text-[11px]",
      thPad: "py-1 text-[10px]",
      tdPad: "py-1",
      medName: "text-[11px] font-bold text-slate-900",
      medDetails: "text-[9px] text-slate-500",
      badge: "text-[10px] px-1.5 py-0",
      duration: "text-[10px] font-semibold",
      timing: "text-[10px] font-semibold",
      notes: "text-[9px] italic text-slate-500",
      sectionMargin: "mt-2 pt-1.5 text-[10.5px] gap-2",
      sectionTitle: "text-[9px]",
      adviceBox: "mt-2 pt-1.5 text-[10.5px] space-y-1",
      followUpBadge: "px-2 py-0.5 text-[10px]",
      footerMargin: "mt-2.5 pt-2",
      disclaimer: "text-[8px] space-y-0.5 max-w-xs",
      sigBadge: "px-1.5 py-0 text-[8.5px]",
      sigName: "text-sm font-serif",
      sigDesig: "text-[9px]",
      sigRole: "text-[8px]",
      sigReg: "text-[8px]",
    },
    dense: {
      wrapperPadding: "p-3.5 sm:p-4",
      headerPb: "pb-1.5",
      clinicTitle: "text-base font-black",
      clinicSub: "text-[9px]",
      clinicAddr: "text-[8px]",
      docName: "text-[11px] font-extrabold",
      docDesig: "text-[9px]",
      docDept: "text-[9px]",
      docReg: "text-[7.5px]",
      demoBox: "my-1.5 p-1.5 text-[10px]",
      demoLabel: "text-[8px]",
      demoVal: "text-[10px] font-semibold",
      diagBox: "mb-1.5 p-1 text-[10px]",
      diagTitle: "text-[9px]",
      rxHeader: "mb-0.5",
      rxSymbol: "text-base",
      rxTitle: "text-[10px]",
      thPad: "py-0.5 text-[9px]",
      tdPad: "py-0.5",
      medName: "text-[10px] font-bold text-slate-900 leading-tight",
      medDetails: "text-[8px] text-slate-500 leading-tight",
      badge: "text-[9px] px-1 py-0",
      duration: "text-[9px] font-semibold",
      timing: "text-[9px] font-semibold leading-tight",
      notes: "text-[8px] italic text-slate-500 leading-tight",
      sectionMargin: "mt-1.5 pt-1 text-[9.5px] gap-2",
      sectionTitle: "text-[8.5px]",
      adviceBox: "mt-1.5 pt-1 text-[9.5px] space-y-0.5",
      followUpBadge: "px-1.5 py-0 text-[9px]",
      footerMargin: "mt-1.5 pt-1",
      disclaimer: "text-[7.5px] space-y-0 max-w-xs leading-tight",
      sigBadge: "px-1.5 py-0 text-[8px]",
      sigName: "text-xs font-serif leading-tight",
      sigDesig: "text-[8px] leading-tight",
      sigRole: "text-[7.5px] leading-tight",
      sigReg: "text-[7.5px]",
    },
  }[density];

  return (
    <div
      id="rx-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 print:static print:block print:p-0 print:m-0 print:bg-white print:z-auto"
    >
      {/* Dynamic Print CSS fallback for native browser Ctrl+P */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                height: 100% !important;
                overflow: hidden !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-rx, #printable-rx * {
                visibility: visible !important;
              }
              #printable-rx {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                right: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                max-height: 278mm !important;
                min-height: 275mm !important;
                padding: ${density === "dense"
              ? "4mm 6mm"
              : density === "compact"
                ? "6mm 8mm"
                : "8mm 10mm"
            } !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                background: #ffffff !important;
                z-index: 9999999 !important;
              }
            }
          `,
        }}
      />

      <div
        id="rx-dialog-card"
        className="relative flex max-h-[96vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 print:static print:block print:w-full print:max-w-none print:max-h-none print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none"
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3 sm:p-4 print:hidden dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Prescription Preview
            </span>
            <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
              ({prescription.prescriptionNumber})
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
              A4 Format • {itemCount} {itemCount === 1 ? "Medicine" : "Medicines"} (
              {density})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Density Selector */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 text-[11px] dark:bg-slate-800">
              {(["auto", "spacious", "standard", "compact", "dense"] as const).map(
                (mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedDensity(mode)}
                    className={`rounded-lg px-2 py-1 font-medium capitalize transition-all ${selectedDensity === mode
                      ? "bg-white text-teal-800 shadow-xs dark:bg-slate-700 dark:text-teal-300 font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                  >
                    {mode === "auto" ? "Auto" : mode}
                  </button>
                )
              )}
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <TbPrinter className="h-4 w-4" />
              Print Prescription
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <TbX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body (Styled as genuine A4 sheet) */}
        <div
          id="rx-scroll-viewport"
          className="flex-1 overflow-y-auto p-3 sm:p-6 text-slate-800 bg-slate-100/70 dark:bg-slate-950/40 print:static print:block print:p-0 print:m-0 print:overflow-visible print:bg-white"
        >
          <div
            id="printable-rx"
            className={`mx-auto w-full max-w-[210mm] min-h-[265mm] ${s.wrapperPadding} flex flex-col justify-between rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-md print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none print:min-h-0 print:h-auto`}
          >
            {/* Top Clinical Flow Container */}
            <div className="flex-1 flex flex-col">
              {/* Clinic Header & Doctor Block */}
              <div
                className={`flex items-start justify-between border-b-2 border-teal-600 ${s.headerPb}`}
              >
                <div>
                  <h1 className={`tracking-tight text-teal-800 ${s.clinicTitle}`}>
                    NEXGEN CLINIC
                  </h1>
                  <p
                    className={`font-semibold tracking-wide text-slate-600 uppercase ${s.clinicSub}`}
                  >
                    Advanced Hair Transplant & Aesthetic Medicine
                  </p>
                  <p className={`mt-0.5 text-slate-500 ${s.clinicAddr}`}>
                    104-105 Medical Enclave, Linking Road, Bandra West, Mumbai •
                    Tel: +91 98765 43210
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-slate-900 ${s.docName}`}>{doctorName}</p>
                  <p className={`font-semibold text-teal-700 ${s.docDesig}`}>
                    {doctorDesignation}
                  </p>
                  <p className={`text-slate-600 ${s.docDept}`}>{doctorDept}</p>
                  <p className={`font-mono text-slate-400 ${s.docReg}`}>
                    Reg No: MMC-2018-09412
                  </p>
                </div>
              </div>

              {/* Patient Demographic Bar */}
              <div
                className={`grid grid-cols-4 gap-2 rounded-xl bg-slate-50 ${s.demoBox}`}
              >
                <div>
                  <span
                    className={`font-bold uppercase tracking-wider text-slate-400 ${s.demoLabel}`}
                  >
                    Patient Name:
                  </span>
                  <p className={`font-extrabold text-slate-900 ${s.demoVal}`}>
                    {patientName}
                  </p>
                </div>
                <div>
                  <span
                    className={`font-bold uppercase tracking-wider text-slate-400 ${s.demoLabel}`}
                  >
                    Age / Gender:
                  </span>
                  <p className={`text-slate-800 ${s.demoVal}`}>
                    {patientAge} / {patientGender}
                  </p>
                </div>
                <div>
                  <span
                    className={`font-bold uppercase tracking-wider text-slate-400 ${s.demoLabel}`}
                  >
                    MRN:
                  </span>
                  <p className={`font-mono font-bold text-teal-800 ${s.demoVal}`}>
                    {patientMrn}
                  </p>
                  {patientPhone && patientPhone !== "—" && (
                    <p className={`font-mono text-slate-500 ${s.demoLabel}`}>
                      {patientPhone}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold uppercase tracking-wider text-slate-400 ${s.demoLabel}`}
                  >
                    Date:
                  </span>
                  <p className={`text-slate-800 ${s.demoVal}`}>{issueDate}</p>
                  <p className={`font-mono font-bold text-teal-600 ${s.demoLabel}`}>
                    {prescription.prescriptionNumber}
                  </p>
                </div>
              </div>

              {/* Allergies Alert (if any) */}
              {patient?.allergies && patient.allergies.length > 0 && (
                <div
                  className={`mb-2 flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 font-bold text-rose-700 border border-rose-200 ${s.demoLabel}`}
                >
                  <TbAlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Known Allergies: {patient.allergies.join(", ")}</span>
                </div>
              )}

              {/* Diagnosis */}
              {consultation && consultation.diagnosis && (
                <div
                  className={`rounded-xl border border-teal-100 bg-teal-50/60 text-teal-950 ${s.diagBox}`}
                >
                  <span
                    className={`font-bold uppercase tracking-wider text-teal-800 ${s.diagTitle}`}
                  >
                    Primary Clinical Diagnosis:{" "}
                  </span>
                  <span className="font-semibold">{consultation.diagnosis}</span>
                  {consultation.secondaryDiagnosis && (
                    <p className={`mt-0.5 text-teal-800 ${s.demoLabel}`}>
                      <span className="font-medium">Secondary: </span>
                      {consultation.secondaryDiagnosis}
                    </p>
                  )}
                </div>
              )}

              {/* Rx Symbol & Medication Table */}
              <div className={s.rxHeader}>
                <div className="mb-1 flex items-center gap-1.5">
                  <span
                    className={`font-serif italic font-black text-teal-700 leading-none ${s.rxSymbol}`}
                  >
                    ℞
                  </span>
                  <span
                    className={`font-bold uppercase tracking-wider text-slate-600 ${s.rxTitle}`}
                  >
                    Prescribed Medications ({itemCount})
                  </span>
                </div>

                <table className="w-full text-left">
                  <thead
                    className={`border-b border-slate-200 font-bold uppercase text-slate-500 ${s.thPad}`}
                  >
                    <tr>
                      <th className="pr-1 w-6">#</th>
                      <th>Medicine Name & Formulation</th>
                      <th className="text-center w-20">Frequency</th>
                      <th className="text-center w-20">Duration</th>
                      <th className="w-[35%]">Timing & Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 text-center text-xs text-slate-400 italic"
                        >
                          No medications entered in this prescription.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className={s.tdPad}>
                          <td
                            className={`pr-1 text-slate-400 font-mono align-top ${s.tdPad}`}
                          >
                            {idx + 1}
                          </td>
                          <td className={`align-top ${s.tdPad}`}>
                            <p className={s.medName}>{item.medicineName}</p>
                            <p className={`${s.medDetails} capitalize`}>
                              {item.dosageForm}{" "}
                              {item.strength ? `• ${item.strength}` : ""}{" "}
                              {item.genericName ? `(${item.genericName})` : ""}
                            </p>
                          </td>
                          <td className={`text-center align-top ${s.tdPad}`}>
                            <span
                              className={`inline-block rounded-md bg-teal-50 font-bold font-mono text-teal-800 border border-teal-100 ${s.badge}`}
                            >
                              {item.frequency}
                            </span>
                          </td>
                          <td
                            className={`text-center font-semibold text-slate-700 align-top ${s.duration} ${s.tdPad}`}
                          >
                            {item.durationValue} {item.durationUnit}
                          </td>
                          <td className={`align-top ${s.tdPad}`}>
                            <p
                              className={`font-semibold text-slate-800 capitalize ${s.timing}`}
                            >
                              {item.timing?.replace("_", " ")}
                            </p>
                            {item.instructions && (
                              <p className={s.notes}>{item.instructions}</p>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Investigations & Procedures */}
              {consultation &&
                (consultation.proceduresRecommended?.length ||
                  consultation.investigationsAdvised?.length) ? (
                <div
                  className={`border-t border-slate-200 grid grid-cols-2 ${s.sectionMargin}`}
                >
                  {consultation.proceduresRecommended &&
                    consultation.proceduresRecommended.length > 0 && (
                      <div>
                        <span
                          className={`font-bold uppercase tracking-wider text-slate-700 ${s.sectionTitle}`}
                        >
                          Advised In-Clinic Procedures:
                        </span>
                        <ul className="mt-0.5 list-disc pl-4 text-slate-600 space-y-0.5">
                          {consultation.proceduresRecommended.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {consultation.investigationsAdvised &&
                    consultation.investigationsAdvised.length > 0 && (
                      <div>
                        <span
                          className={`font-bold uppercase tracking-wider text-slate-700 ${s.sectionTitle}`}
                        >
                          Diagnostic Tests Recommended:
                        </span>
                        <ul className="mt-0.5 list-disc pl-4 text-slate-600 space-y-0.5">
                          {consultation.investigationsAdvised.map((test, i) => (
                            <li key={i}>{test}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ) : null}

              {/* General Advice & Follow-up */}
              {(prescription.generalAdvice || consultation?.followUpDate) && (
                <div className={`border-t border-slate-200 ${s.adviceBox}`}>
                  {prescription.generalAdvice && (
                    <div>
                      <span className="font-bold text-slate-700">
                        General Physician Advice:{" "}
                      </span>
                      <span className="text-slate-600">
                        {prescription.generalAdvice}
                      </span>
                    </div>
                  )}
                  {consultation?.followUpDate && (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-lg bg-teal-50 font-semibold text-teal-800 border border-teal-200 ${s.followUpBadge}`}
                    >
                      <span>Scheduled Follow-Up Review:</span>
                      <span className="font-bold">
                        {consultation.followUpDate}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Digital Signature & Disclaimer Footer */}
            <div
              className={`mt-auto flex items-end justify-between border-t-2 border-slate-200 ${s.footerMargin}`}
            >
              <div className={`text-slate-400 ${s.disclaimer}`}>
                <p>• Valid for 30 days from date of issue.</p>
                <p>
                  • Keep out of reach of children. Store medications in a cool,
                  dry place.
                </p>
                <p className="text-[7.5px] text-slate-400">
                  Computer generated official prescription issued by Nexgen
                  Clinic Electronic Medical Records.
                </p>
              </div>

              {/* Verified Digital Signature Stamp */}
              <div className="text-center min-w-[170px]">
                <div
                  className={`mb-1 inline-flex items-center gap-1 rounded-full bg-teal-50 font-bold text-teal-700 border border-teal-200 ${s.sigBadge}`}
                >
                  <TbCheck className="h-3 w-3 text-teal-600" />
                  <span>Digitally Signed & Verified</span>
                </div>

                <div
                  className={`font-extrabold text-teal-900 tracking-wider ${s.sigName}`}
                >
                  {doctorName}
                </div>
                <p className={`font-semibold text-slate-600 ${s.sigDesig}`}>
                  {doctorDesignation}
                </p>

                <div
                  className={`mt-1 border-t border-slate-300 pt-0.5 font-bold uppercase tracking-widest text-slate-500 ${s.sigRole}`}
                >
                  Authorized Medical Practitioner
                </div>
                <p className={`font-mono text-slate-400 ${s.sigReg}`}>
                  Reg No: MMC-2018-09412
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
