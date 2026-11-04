import { Router, Response } from "express";
import { Op } from "sequelize";
import {
  Invoice,
  InvoiceItem,
  Consultation,
  Prescription,
  QueueEntry,
  User,
  InventoryLog,
  InventoryItem,
  sequelize,
} from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * GET /reports/daily-cash
 * Revenue collection summary breakdown by payment method and cashier
 */
router.get("/daily-cash", authorize("reports:read"), async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startDate = (req.query.startDate as string) || today;
    const endDate = (req.query.endDate as string) || today;

    const invoices = await Invoice.findAll({
      where: {
        billedAt: {
          [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
          [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
        },
      },
      include: [
        {
          model: User,
          as: "billedBy",
          attributes: ["id", "fullName"],
        },
      ],
      order: [["billedAt", "DESC"]],
    });

    let totalCollected = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalNet = 0;
    let totalBalanceDue = 0;

    const methodBreakdown: Record<string, { count: number; total: number }> = {
      cash: { count: 0, total: 0 },
      upi: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      net_banking: { count: 0, total: 0 },
      split: { count: 0, total: 0 },
    };

    const cashierBreakdown: Record<string, { name: string; count: number; collected: number }> = {};

    for (const inv of invoices) {
      const paid = Number(inv.paidAmount) || 0;
      const disc = Number(inv.discountAmount) || 0;
      const tax = Number(inv.taxAmount) || 0;
      const net = Number(inv.netTotal) || 0;
      const due = Number(inv.balanceDue) || 0;

      totalCollected += paid;
      totalDiscount += disc;
      totalTax += tax;
      totalNet += net;
      totalBalanceDue += due;

      const m = inv.paymentMethod || "cash";
      if (!methodBreakdown[m]) {
        methodBreakdown[m] = { count: 0, total: 0 };
      }
      methodBreakdown[m].count++;
      methodBreakdown[m].total += paid;

      const cashierId = inv.billedById || "unknown";
      const billedByUser = (inv as any).billedBy;
      const cashierName = billedByUser ? billedByUser.fullName : "Unknown Cashier";
      if (!cashierBreakdown[cashierId]) {
        cashierBreakdown[cashierId] = { name: cashierName, count: 0, collected: 0 };
      }
      cashierBreakdown[cashierId].count++;
      cashierBreakdown[cashierId].collected += paid;
    }

    res.json({
      startDate,
      endDate,
      invoiceCount: invoices.length,
      totalCollected,
      totalDiscount,
      totalTax,
      totalNet,
      totalBalanceDue,
      methodBreakdown,
      cashierBreakdown: Object.values(cashierBreakdown),
      invoices,
    });
  } catch (err: any) {
    console.error("Failed to generate daily cash report:", err);
    res.status(500).json({ message: err.message || "Failed to generate daily cash report" });
  }
});

/**
 * GET /reports/doctor-productivity
 * Consultations, procedures, and revenue metrics per doctor
 */
router.get("/doctor-productivity", authorize("reports:read"), async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startDate = (req.query.startDate as string) || today;
    const endDate = (req.query.endDate as string) || today;

    const consultations = await Consultation.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
          [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
        },
      },
      include: [
        {
          model: User,
          as: "doctor",
          attributes: ["id", "fullName", "department"],
        },
      ],
    });

    const doctorsMap: Record<
      string,
      {
        doctorId: string;
        doctorName: string;
        department: string;
        consultationsCount: number;
        finalizedCount: number;
        totalFees: number;
        proceduresCount: number;
      }
    > = {};

    for (const c of consultations) {
      const docId = c.doctorId;
      const doc = (c as any).doctor;
      const docName = doc ? doc.fullName : "Unknown Doctor";
      const dept = doc?.department || "General";

      if (!doctorsMap[docId]) {
        doctorsMap[docId] = {
          doctorId: docId,
          doctorName: docName,
          department: dept,
          consultationsCount: 0,
          finalizedCount: 0,
          totalFees: 0,
          proceduresCount: 0,
        };
      }

      doctorsMap[docId].consultationsCount++;
      if (c.status === "finalized") {
        doctorsMap[docId].finalizedCount++;
      }
      doctorsMap[docId].totalFees += Number(c.consultationFee) || 0;
      if (Array.isArray(c.proceduresRecommended)) {
        doctorsMap[docId].proceduresCount += c.proceduresRecommended.length;
      }
    }

    res.json({
      startDate,
      endDate,
      doctors: Object.values(doctorsMap),
    });
  } catch (err: any) {
    console.error("Failed to generate doctor productivity report:", err);
    res.status(500).json({ message: err.message || "Failed to generate doctor productivity report" });
  }
});

/**
 * GET /reports/opd-wait-times
 * Queue wait times and throughput metrics
 */
router.get("/opd-wait-times", authorize("reports:read"), async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startDate = (req.query.startDate as string) || today;
    const endDate = (req.query.endDate as string) || today;

    const entries = await QueueEntry.findAll({
      where: {
        queueDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    });

    let totalWaitMs = 0;
    let waitSamples = 0;
    let totalConsultMs = 0;
    let consultSamples = 0;

    for (const e of entries) {
      if (e.queuedAt && e.calledAt) {
        const diff = new Date(e.calledAt).getTime() - new Date(e.queuedAt).getTime();
        if (diff > 0) {
          totalWaitMs += diff;
          waitSamples++;
        }
      }
      if (e.calledAt && e.completedAt) {
        const diff = new Date(e.completedAt).getTime() - new Date(e.calledAt).getTime();
        if (diff > 0) {
          totalConsultMs += diff;
          consultSamples++;
        }
      }
    }

    const avgWaitMinutes = waitSamples > 0 ? Math.round(totalWaitMs / waitSamples / 60000) : 0;
    const avgConsultMinutes =
      consultSamples > 0 ? Math.round(totalConsultMs / consultSamples / 60000) : 0;

    res.json({
      startDate,
      endDate,
      totalPatients: entries.length,
      avgWaitMinutes,
      avgConsultMinutes,
    });
  } catch (err: any) {
    console.error("Failed to generate wait times report:", err);
    res.status(500).json({ message: err.message || "Failed to generate wait times report" });
  }
});

export default router;
