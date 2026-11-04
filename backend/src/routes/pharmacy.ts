import { Router, Response } from "express";
import { Op } from "sequelize";
import {
  QueueEntry,
  Patient,
  User,
  Consultation,
  Prescription,
  PrescriptionItem,
  InventoryItem,
  InventoryLog,
  Invoice,
  InvoiceItem,
  sequelize,
} from "../models";
import { authenticate, authorizeAny, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

async function generateInvoiceNumber(): Promise<string> {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const prefix = `INV-${yearSuffix}-`;

  const latest = await Invoice.findOne({
    where: { invoiceNumber: { [Op.like]: `${prefix}%` } },
    order: [["createdAt", "DESC"]],
  });

  let nextSeq = 1;
  if (latest && latest.invoiceNumber) {
    const parts = latest.invoiceNumber.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }
  return `${prefix}${nextSeq.toString().padStart(5, "0")}`;
}

/**
 * GET /pharmacy/queue
 * List all patients waiting at the pharmacy counter for medicine dispensing
 */
router.get(
  "/queue",
  authorizeAny("prescriptions:read", "inventory:read", "billing:read", "queue:read"),
  async (req: AuthRequest, res: Response) => {
    try {
      const queueDate = (req.query.date as string) || new Date().toISOString().split("T")[0];

      const entries = await QueueEntry.findAll({
        where: {
          status: "pending_pharmacy",
          queueDate,
        },
        order: [["completedAt", "ASC"], ["queuedAt", "ASC"]],
        include: [
          {
            model: Patient,
            as: "patient",
            attributes: [
              "id",
              "mrn",
              "firstName",
              "lastName",
              "phone",
              "age",
              "gender",
              "bloodGroup",
              "allergies",
            ],
          },
          {
            model: User,
            as: "doctor",
            attributes: ["id", "fullName", "department", "designation"],
          },
          {
            model: Consultation,
            as: "consultation",
            include: [
              {
                model: Prescription,
                as: "prescription",
                include: [
                  {
                    model: PrescriptionItem,
                    as: "items",
                    include: [
                      {
                        model: InventoryItem,
                        as: "inventoryItem",
                        attributes: ["id", "name", "sku", "stockQuantity", "sellingPrice", "unit"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      res.json(entries);
    } catch (err: any) {
      console.error("Failed to fetch pharmacy queue:", err);
      res.status(500).json({ message: err.message || "Failed to fetch pharmacy queue" });
    }
  }
);

/**
 * GET /pharmacy/stats
 * Real-time pharmacy stats: queue count, dispensed count, today's pharmacy revenue
 */
router.get(
  "/stats",
  authorizeAny("prescriptions:read", "inventory:read", "billing:read"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const waitingCount = await QueueEntry.count({
        where: {
          status: "pending_pharmacy",
          queueDate: today,
        },
      });

      // Pharmacy invoices generated today (invoices with medicine items)
      const pharmacyInvoices = await Invoice.findAll({
        where: {
          billedAt: { [Op.gte]: startOfDay },
          paymentStatus: "paid",
        },
        include: [
          {
            model: InvoiceItem,
            as: "items",
            where: { itemType: "medicine" },
            required: true,
          },
        ],
      });

      const dispensedToday = pharmacyInvoices.length;
      const revenueToday = pharmacyInvoices.reduce(
        (sum, inv) => sum + Number(inv.netTotal || 0),
        0
      );

      const lowStockCount = await InventoryItem.count({
        where: {
          stockQuantity: {
            [Op.lte]: sequelize.col("minStockLevel"),
          },
        },
      });

      res.json({
        waitingAtPharmacy: waitingCount,
        dispensedToday,
        revenueToday,
        lowStockCount,
      });
    } catch (err: any) {
      console.error("Failed to fetch pharmacy stats:", err);
      res.status(500).json({ message: err.message || "Failed to fetch pharmacy stats" });
    }
  }
);

/**
 * POST /pharmacy/dispense
 * Dispense medicines, generate pharmacy invoice, deduct stock, and complete queue entry
 */
router.post(
  "/dispense",
  authorizeAny("prescriptions:write", "inventory:write", "billing:write"),
  async (req: AuthRequest, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        queueEntryId,
        patientId,
        consultationId,
        prescriptionId,
        optedOutAll,
        items, // array of { medicineName, inventoryItemId, quantity, unitPrice, dispense }
        discountAmount,
        discountReason,
        taxAmount,
        paymentMethod,
        paymentNotes,
      } = req.body;

      if (!queueEntryId) {
        await transaction.rollback();
        return res.status(400).json({ message: "Queue entry ID is required" });
      }

      const queueEntry = await QueueEntry.findByPk(queueEntryId, { transaction });
      if (!queueEntry) {
        await transaction.rollback();
        return res.status(404).json({ message: "Queue entry not found" });
      }

      // Case A: Patient decided to buy ALL medicines from outside
      if (optedOutAll) {
        await queueEntry.update(
          {
            status: "completed",
            completedAt: new Date(),
          },
          { transaction }
        );

        if (prescriptionId) {
          await Prescription.update(
            { status: "dispensed" },
            { where: { id: prescriptionId }, transaction }
          );
        }

        await transaction.commit();
        return res.json({
          message: "Patient opted to purchase medicines from outside. Queue entry completed.",
          queueEntry,
          optedOutAll: true,
        });
      }

      // Case B: Patient is purchasing medicines at clinic pharmacy
      const itemsToDispense = Array.isArray(items) ? items.filter((i) => i.dispense !== false) : [];

      if (itemsToDispense.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "No medicines selected for dispensing. Choose items to dispense or select 'Patient Buying Outside'.",
        });
      }

      let subtotal = 0;
      for (const item of itemsToDispense) {
        const qty = parseInt(item.quantity, 10) || 1;
        const price = parseFloat(item.unitPrice) || 0;
        subtotal += qty * price;
      }

      const disc = parseFloat(discountAmount) || 0;
      const tax = parseFloat(taxAmount) || 0;
      const netTotal = Math.max(0, subtotal - disc + tax);

      const invoiceNumber = await generateInvoiceNumber();

      const invoice = await Invoice.create(
        {
          invoiceNumber,
          patientId: patientId || queueEntry.patientId,
          consultationId: consultationId || null,
          subtotal,
          discountAmount: disc,
          discountReason: discountReason || null,
          taxAmount: tax,
          netTotal,
          paidAmount: netTotal,
          balanceDue: 0,
          paymentStatus: "paid",
          paymentMethod: paymentMethod || "cash",
          paymentNotes: paymentNotes || "Pharmacy medicine bill paid at pharmacy counter",
          billedById: req.user!.userId,
          billedAt: new Date(),
        },
        { transaction }
      );

      for (const item of itemsToDispense) {
        const qty = parseInt(item.quantity, 10) || 1;
        const unit = parseFloat(item.unitPrice) || 0;
        const total = qty * unit;

        await InvoiceItem.create(
          {
            invoiceId: invoice.id,
            itemType: "medicine",
            description: item.medicineName,
            quantity: qty,
            unitPrice: unit,
            totalPrice: total,
            inventoryItemId: item.inventoryItemId || null,
          },
          { transaction }
        );

        // Deduct inventory stock and record log if linked to InventoryItem
        if (item.inventoryItemId) {
          const inv = await InventoryItem.findByPk(item.inventoryItemId, { transaction });
          if (inv) {
            const currentStock = inv.stockQuantity || 0;
            const newStock = Math.max(0, currentStock - qty);
            await inv.update({ stockQuantity: newStock }, { transaction });

            await InventoryLog.create(
              {
                inventoryItemId: inv.id,
                action: "sold",
                quantity: qty,
                previousStock: currentStock,
                newStock,
                reason: `Dispensed via Pharmacy Invoice ${invoice.invoiceNumber}`,
                performedById: req.user!.userId,
              },
              { transaction }
            );
          }
        }
      }

      // Mark Queue Entry as completed (Patient fully processed and discharged from clinic)
      await queueEntry.update(
        {
          status: "completed",
          completedAt: new Date(),
        },
        { transaction }
      );

      // Mark Prescription as dispensed
      if (prescriptionId) {
        await Prescription.update(
          { status: "dispensed" },
          { where: { id: prescriptionId }, transaction }
        );
      }

      await transaction.commit();

      const fullInvoice = await Invoice.findByPk(invoice.id, {
        include: [
          { model: Patient, as: "patient" },
          { model: User, as: "billedBy", attributes: ["id", "fullName"] },
          { model: InvoiceItem, as: "items" },
        ],
      });

      res.status(201).json({
        message: "Medicines dispensed and payment collected successfully",
        invoice: fullInvoice,
        queueEntry,
      });
    } catch (err: any) {
      await transaction.rollback();
      console.error("Failed to dispense medicines:", err);
      res.status(500).json({ message: err.message || "Failed to dispense medicines" });
    }
  }
);

export default router;
