import { Router, Response } from "express";
import { Op } from "sequelize";
import {
  Invoice,
  InvoiceItem,
  QueueEntry,
  Consultation,
  Patient,
  PatientVitals,
  User,
  InventoryItem,
  InventoryLog,
  sequelize,
} from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

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
 * GET /billing/pending
 * List all visits currently waiting for payment at the cashier counter
 */
router.get("/pending", authorize("billing:read"), async (_req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const pendingQueue = await QueueEntry.findAll({
      where: {
        status: "pending_billing",
        queueDate: today,
      },
      order: [["completedAt", "ASC"]],
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "mrn", "firstName", "lastName", "phone", "gender", "age"],
        },
        {
          model: User,
          as: "doctor",
          attributes: ["id", "fullName", "department"],
        },
        {
          model: Consultation,
          as: "consultation",
          include: [
            {
              model: Invoice,
              as: "invoice",
              include: [{ model: InvoiceItem, as: "items" }],
            },
          ],
        },
      ],
    });

    res.json(pendingQueue);
  } catch (err: any) {
    console.error("Failed to fetch pending bills:", err);
    res.status(500).json({ message: err.message || "Failed to fetch pending bills" });
  }
});

/**
 * GET /billing/invoices
 * Paginated invoice history
 */
router.get("/invoices", authorize("billing:read"), async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
    const offset = (page - 1) * limit;
    const search = ((req.query.search as string) || "").trim();
    const paymentStatus = req.query.paymentStatus as string;
    const paymentMethod = req.query.paymentMethod as string;

    const where: any = {};
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      limit,
      offset,
      order: [["billedAt", "DESC"]],
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "mrn", "firstName", "lastName", "phone"],
          ...(search
            ? {
                where: {
                  [Op.or]: [
                    { firstName: { [Op.iLike]: `%${search}%` } },
                    { lastName: { [Op.iLike]: `%${search}%` } },
                    { phone: { [Op.iLike]: `%${search}%` } },
                    { mrn: { [Op.iLike]: `%${search}%` } },
                  ],
                },
                required: false,
              }
            : {}),
        },
        {
          model: User,
          as: "billedBy",
          attributes: ["id", "fullName"],
        },
        {
          model: InvoiceItem,
          as: "items",
        },
      ],
    });

    res.json({
      invoices: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err: any) {
    console.error("Failed to list invoices:", err);
    res.status(500).json({ message: err.message || "Failed to list invoices" });
  }
});

/**
 * GET /billing/invoices/:id
 * Retrieve single invoice details
 */
router.get("/invoices/:id", authorize("billing:read"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
        },
        {
          model: User,
          as: "billedBy",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: Consultation,
          as: "consultation",
          include: [
            {
              model: User,
              as: "doctor",
              attributes: ["id", "fullName", "department"],
            },
          ],
        },
        {
          model: InvoiceItem,
          as: "items",
          include: [
            {
              model: InventoryItem,
              as: "inventoryItem",
              attributes: ["id", "name", "sku"],
            },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err: any) {
    console.error("Failed to fetch invoice:", err);
    res.status(500).json({ message: err.message || "Failed to fetch invoice" });
  }
});

/**
 * POST /billing/invoices
 * Create or save an invoice
 */
router.post("/invoices", authorize("billing:write"), async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      patientId,
      consultationId,
      subtotal,
      discountAmount,
      discountReason,
      taxAmount,
      items, // array of { itemType, description, quantity, unitPrice, inventoryItemId }
    } = req.body;

    if (!patientId || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Patient ID and at least one item are required" });
    }

    const invoiceNumber = await generateInvoiceNumber();
    const sub = parseFloat(subtotal) || 0;
    const disc = parseFloat(discountAmount) || 0;
    const tax = parseFloat(taxAmount) || 0;
    const net = Math.max(0, sub - disc + tax);

    const invoice = await Invoice.create(
      {
        invoiceNumber,
        patientId,
        consultationId: consultationId || null,
        subtotal: sub,
        discountAmount: disc,
        discountReason: discountReason || null,
        taxAmount: tax,
        netTotal: net,
        paidAmount: 0,
        balanceDue: net,
        paymentStatus: "pending",
        paymentMethod: "cash",
        billedById: req.user!.userId,
        billedAt: new Date(),
      },
      { transaction }
    );

    for (const item of items) {
      const qty = parseInt(item.quantity, 10) || 1;
      const unit = parseFloat(item.unitPrice) || 0;
      await InvoiceItem.create(
        {
          invoiceId: invoice.id,
          itemType: item.itemType || "consultation",
          description: item.description,
          quantity: qty,
          unitPrice: unit,
          totalPrice: qty * unit,
          inventoryItemId: item.inventoryItemId || null,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Patient, as: "patient" },
        { model: InvoiceItem, as: "items" },
      ],
    });

    res.status(201).json(fullInvoice);
  } catch (err: any) {
    await transaction.rollback();
    console.error("Failed to create invoice:", err);
    res.status(500).json({ message: err.message || "Failed to create invoice" });
  }
});

/**
 * POST /billing/invoices/:id/collect-payment
 * Record payment, adjust inventory for sold medicines, and mark queue entry as completed (Discharged)
 */
router.post("/invoices/:id/collect-payment", authorize("billing:write"), async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      paidAmount,
      paymentMethod,
      discountAmount,
      discountReason,
      taxAmount,
      paymentNotes,
    } = req.body;

    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: InvoiceItem, as: "items" },
        {
          model: Consultation,
          as: "consultation",
        },
      ],
      transaction,
    });

    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ message: "Invoice not found" });
    }

    const sub = Number(invoice.subtotal);
    const disc = discountAmount !== undefined ? parseFloat(discountAmount) : Number(invoice.discountAmount);
    const tax = taxAmount !== undefined ? parseFloat(taxAmount) : Number(invoice.taxAmount);
    const net = Math.max(0, sub - disc + tax);

    const paymentReceived = parseFloat(paidAmount) || 0;
    const newPaidAmount = Number(invoice.paidAmount) + paymentReceived;
    const balanceDue = Math.max(0, net - newPaidAmount);

    let paymentStatus: "paid" | "partial" | "pending" = "pending";
    if (balanceDue === 0) {
      paymentStatus = "paid";
    } else if (newPaidAmount > 0) {
      paymentStatus = "partial";
    }

    await invoice.update(
      {
        discountAmount: disc,
        discountReason: discountReason !== undefined ? discountReason : invoice.discountReason,
        taxAmount: tax,
        netTotal: net,
        paidAmount: newPaidAmount,
        balanceDue,
        paymentStatus,
        paymentMethod: paymentMethod || invoice.paymentMethod,
        paymentNotes: paymentNotes || invoice.paymentNotes,
        billedById: req.user!.userId,
      },
      { transaction }
    );

    const invAny = invoice as any;

    // If fully paid or settling and linked to consultation queue entry, transition queue to "completed"
    if (invAny.consultation && invAny.consultation.queueEntryId) {
      await QueueEntry.update(
        {
          status: "completed",
          completedAt: new Date(),
        },
        {
          where: { id: invAny.consultation.queueEntryId },
          transaction,
        }
      );
    }

    // Deduct inventory items if items include medicines with inventoryItemId
    if (invAny.items) {
      for (const item of invAny.items) {
        if (item.inventoryItemId) {
          const invItem = await InventoryItem.findByPk(item.inventoryItemId, { transaction });
          if (invItem) {
            const currentStock = invItem.stockQuantity || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            await invItem.update({ stockQuantity: newStock }, { transaction });

            await InventoryLog.create(
              {
                inventoryItemId: invItem.id,
                action: "sold",
                quantity: item.quantity,
                previousStock: currentStock,
                newStock,
                reason: `Dispensed via Invoice ${invoice.invoiceNumber}`,
                performedById: req.user!.userId,
              },
              { transaction }
            );
          }
        }
      }
    }

    await transaction.commit();

    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Patient, as: "patient" },
        { model: User, as: "billedBy", attributes: ["id", "fullName"] },
        { model: InvoiceItem, as: "items" },
        {
          model: Consultation,
          as: "consultation",
          include: [{ model: User, as: "doctor", attributes: ["id", "fullName", "department"] }],
        },
      ],
    });

    res.json({
      message: "Payment collected successfully",
      invoice: updatedInvoice,
    });
  } catch (err: any) {
    await transaction.rollback();
    console.error("Failed to collect payment:", err);
    res.status(500).json({ message: err.message || "Failed to collect payment" });
  }
});

export default router;
