// PDF / Excel / CSV rendering for invoices and reports.
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const config = require('../config');

const NAVY = '#0A1633';
const COBALT = '#2747F5';
const MUTED = '#5D6785';
// Built-in PDF fonts have no ₹ glyph, so PDFs print "Rs.".
const rs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function collect(doc) {
  return new Promise((resolve) => {
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

function header(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 86).fill(NAVY);
  doc.circle(doc.page.width - 40, 10, 60).fill(COBALT);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20).text(config.clinic.name, 40, 26);
  doc.font('Helvetica').fontSize(10).fillColor('#C9D1EA').text(`${config.clinic.city} · GSTIN ${config.clinic.gstin}`, 40, 52);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(16).text(title, 40, 110);
  if (subtitle) doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(subtitle, 40, 132);
  doc.moveDown(2);
}

async function invoicePdf(inv) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const issued = new Date(inv.issuedAt).toLocaleString('en-IN', { timeZone: config.clinic.timezone, dateStyle: 'medium', timeStyle: 'short' });
  header(doc, `Tax invoice ${inv.invNo}`, `${issued} · ${inv.status.replace('_', ' ').toUpperCase()}`);
  let y = 160;
  doc.fontSize(10).fillColor(MUTED).text('Billed to', 40, y).text('Reference', 320, y);
  doc.fillColor(NAVY).font('Helvetica-Bold').text(inv.patient ? inv.patient.name : 'Walk-in', 40, y + 14)
    .text(inv.prescription ? inv.prescription.rxNo : '—', 320, y + 14);
  doc.font('Helvetica').fillColor(MUTED).text(inv.patient ? inv.patient.code : '', 40, y + 28).text(inv.dispense ? inv.dispense.code : '', 320, y + 28);

  y += 64;
  const cols = [40, 250, 330, 400, 470];
  doc.rect(40, y, 515, 22).fill('#F2F4F9');
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9);
  ['Item', 'Batch', 'Qty', 'Rate', 'Amount'].forEach((h, i) => doc.text(h, cols[i] + 6, y + 7));
  y += 28;
  doc.font('Helvetica').fontSize(9.5);
  for (const it of inv.items) {
    doc.fillColor(NAVY).text(it.product ? it.product.name : '', cols[0] + 6, y, { width: 200 });
    doc.fillColor(MUTED).text(it.batch ? it.batch.batchNo : '', cols[1] + 6, y)
      .text(String(it.qty), cols[2] + 6, y).text(rs(it.unitPrice), cols[3] + 6, y);
    doc.fillColor(NAVY).text(rs(it.amount), cols[4] + 6, y);
    y += 20;
  }
  y += 10;
  doc.moveTo(320, y).lineTo(555, y).strokeColor('#E3E7F0').stroke();
  y += 10;
  const half = Number(inv.gstAmount) / 2;
  [['Subtotal', rs(inv.subtotal)], ['CGST', rs(half)], ['SGST', rs(half)], ['Round off', rs(inv.roundOff)]].forEach(([k, v]) => {
    doc.fillColor(MUTED).text(k, 330, y).fillColor(NAVY).text(v, 470, y);
    y += 16;
  });
  doc.font('Helvetica-Bold').fontSize(13).text('Total', 330, y + 6).text(rs(inv.total), 450, y + 6);
  y += 36;
  doc.font('Helvetica').fontSize(9.5).fillColor(MUTED);
  (inv.payments || []).forEach((p) => {
    doc.text(`Paid ${rs(p.amount)} · ${p.method.toUpperCase()}${p.ref ? ` · ref ${p.ref}` : ''}`, 40, y);
    y += 14;
  });
  if (Number(inv.total) > Number(inv.paidAmount)) doc.fillColor('#C93216').text(`Balance due ${rs(inv.total - inv.paidAmount)}`, 40, y + 4);
  doc.fillColor(MUTED).fontSize(8.5).text('Computer-generated invoice. Medicines once sold are returnable only if sealed, within policy.', 40, 780, { width: 515, align: 'center' });
  return collect(doc);
}

// report = { title, subtitle, columns: [{key,label,width?,money?}], rows: [...] }
async function reportPdf(report) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36 });
  header(doc, report.title, report.subtitle);
  const usable = doc.page.width - 72;
  const totalW = report.columns.reduce((s, c) => s + (c.width || 1), 0);
  const widths = report.columns.map((c) => ((c.width || 1) / totalW) * usable);
  let y = 160;
  const drawHead = () => {
    doc.rect(36, y, usable, 20).fill('#F2F4F9');
    let x = 36;
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8.5);
    report.columns.forEach((c, i) => { doc.text(c.label, x + 4, y + 6, { width: widths[i] - 8 }); x += widths[i]; });
    y += 24;
    doc.font('Helvetica').fontSize(8.5);
  };
  drawHead();
  for (const row of report.rows) {
    if (y > doc.page.height - 50) { doc.addPage(); y = 40; drawHead(); }
    let x = 36;
    report.columns.forEach((c, i) => {
      const v = row[c.key];
      doc.fillColor(NAVY).text(c.money ? rs(v) : v === null || v === undefined ? '' : String(v), x + 4, y, { width: widths[i] - 8, height: 12, ellipsis: true });
      x += widths[i];
    });
    y += 16;
  }
  if (!report.rows.length) doc.fillColor(MUTED).text('No records in this period.', 40, y);
  return collect(doc);
}

async function reportXlsx(report) {
  const wb = new ExcelJS.Workbook();
  wb.creator = config.clinic.name;
  const ws = wb.addWorksheet(report.title.slice(0, 30));
  ws.addRow([report.title]).font = { bold: true, size: 14 };
  if (report.subtitle) ws.addRow([report.subtitle]);
  ws.addRow([]);
  const head = ws.addRow(report.columns.map((c) => c.label));
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A1633' } }; });
  report.rows.forEach((r) => ws.addRow(report.columns.map((c) => r[c.key])));
  report.columns.forEach((c, i) => {
    ws.getColumn(i + 1).width = Math.max(12, (c.width || 1) * 14);
    if (c.money) ws.getColumn(i + 1).numFmt = '₹#,##,##0.00';
  });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

function reportCsv(report) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [report.columns.map((c) => esc(c.label)).join(',')];
  report.rows.forEach((r) => lines.push(report.columns.map((c) => esc(r[c.key])).join(',')));
  return Buffer.from(`﻿${lines.join('\n')}`, 'utf8');
}

module.exports = { invoicePdf, reportPdf, reportXlsx, reportCsv };
