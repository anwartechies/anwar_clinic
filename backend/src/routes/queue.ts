import { Router, Response } from "express";
import { Op } from "sequelize";
import {
  QueueEntry,
  Patient,
  PatientVitals,
  Appointment,
  User,
  Consultation,
  Prescription,
  PrescriptionItem,
  InventoryItem,
  Invoice,
  InvoiceItem,
  sequelize,
} from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * Helper to generate sequential token number for today
 * Format: TK-001, TK-002, etc.
 */
async function generateDailyToken(queueDate: string): Promise<string> {
  const countToday = await QueueEntry.count({
    where: { queueDate },
  });
  const tokenSeq = countToday + 1;
  return `TK-${tokenSeq.toString().padStart(3, "0")}`;
}

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
 * GET /queue/today
 * Retrieve active queue for today or a specific date with filters and stats
 */
router.get("/today", authorize("queue:read"), async (req: AuthRequest, res: Response) => {
  try {
    const queueDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const requestedDoctorId = req.query.doctorId as string;
    const status = req.query.status as string;

    const where: any = { queueDate };

    // Scoping rule:
    // If the logged-in user is a doctor, they must ONLY see patients assigned to their chamber.
    // Superadmin, receptionist, and pharmacist can view all or filter by requestedDoctorId.
    if (req.user?.roleSlug === "doctor") {
      where.doctorId = req.user.userId;
    } else if (requestedDoctorId) {
      where.doctorId = requestedDoctorId;
    }

    if (status) {
      where.status = status;
    } else {
      // By default exclude cancelled tokens unless explicitly requested
      where.status = { [Op.ne]: "cancelled" };
    }

    const entries = await QueueEntry.findAll({
      where,
      order: [
        // Priority order: emergency first, then vip, then others, then queued time
        [
          sequelize.literal(
            `CASE WHEN priority = 'emergency' THEN 1 WHEN priority = 'vip' THEN 2 WHEN priority = 'follow_up' THEN 3 ELSE 4 END`
          ),
          "ASC",
        ],
        ["queuedAt", "ASC"],
      ],
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
          model: PatientVitals,
          as: "vitals",
        },
        {
          model: Appointment,
          as: "appointment",
          attributes: ["id", "appointmentNumber", "timeSlot", "type"],
        },
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
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

    // Summary counters for today (scoped to doctor if doctor role)
    const statsWhere: any = { queueDate };
    if (req.user?.roleSlug === "doctor") {
      statsWhere.doctorId = req.user.userId;
    } else if (requestedDoctorId) {
      statsWhere.doctorId = requestedDoctorId;
    }

    const allToday = await QueueEntry.findAll({
      where: statsWhere,
      attributes: ["status"],
    });

    const stats = {
      total: allToday.length,
      waiting: allToday.filter((e) => e.status === "waiting").length,
      inConsultation: allToday.filter((e) => e.status === "in_consultation").length,
      inProcedure: allToday.filter((e) => e.status === "in_procedure").length,
      pendingBilling: allToday.filter((e) => e.status === "pending_billing").length,
      pendingPharmacy: allToday.filter((e) => e.status === "pending_pharmacy").length,
      completed: allToday.filter((e) => e.status === "completed").length,
      cancelled: allToday.filter((e) => e.status === "cancelled").length,
    };

    res.json({
      date: queueDate,
      stats,
      queue: entries,
    });
  } catch (err: any) {
    console.error("Failed to fetch queue:", err);
    res.status(500).json({ message: err.message || "Failed to fetch queue" });
  }
});

/**
 * POST /queue/checkin
 * Check in a patient, assign token, and optionally record vitals in one step
 */
router.post("/checkin", authorize("queue:write"), async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      priority,
      vitals: vitalsData,
      consultationFee,
      paymentMethod,
      paymentNotes,
      waiveFee,
    } = req.body;

    if (!patientId || !doctorId) {
      await transaction.rollback();
      return res.status(400).json({ message: "Patient ID and Doctor ID are required" });
    }

    const patient = await Patient.findByPk(patientId, { transaction });
    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ message: "Patient not found" });
    }

    const doctor = await User.findByPk(doctorId, { transaction });
    if (!doctor) {
      await transaction.rollback();
      return res.status(404).json({ message: "Doctor not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if patient already has an active waiting or in_consultation token today with this doctor
    const existing = await QueueEntry.findOne({
      where: {
        patientId,
        doctorId,
        queueDate: today,
        status: ["waiting", "in_consultation", "pending_billing", "pending_pharmacy"],
      },
      transaction,
    });

    if (existing) {
      await transaction.rollback();
      return res.status(409).json({
        message: `Patient already has active token ${existing.tokenNumber} today (Status: ${existing.status})`,
        queueEntry: existing,
      });
    }

    const tokenNumber = await generateDailyToken(today);

    const queueEntry = await QueueEntry.create(
      {
        tokenNumber,
        queueDate: today,
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        priority: priority || "normal",
        status: "waiting",
        queuedAt: new Date(),
        createdById: req.user?.userId || null,
      },
      { transaction }
    );

    // If appointment is linked, update its status to checked_in
    if (appointmentId) {
      await Appointment.update(
        { status: "checked_in" },
        { where: { id: appointmentId }, transaction }
      );
    }

    // Upfront Consultation Fee Billing by Receptionist
    let consultationInvoice: any = null;
    const fee = consultationFee !== undefined ? parseFloat(consultationFee) : 500;
    if (!waiveFee && fee > 0) {
      const invNumber = await generateInvoiceNumber();
      const invoice = await Invoice.create(
        {
          invoiceNumber: invNumber,
          patientId,
          consultationId: null,
          subtotal: fee,
          discountAmount: 0,
          discountReason: null,
          taxAmount: 0,
          netTotal: fee,
          paidAmount: fee,
          balanceDue: 0,
          paymentStatus: "paid",
          paymentMethod: paymentMethod || "cash",
          paymentNotes: paymentNotes || "Consultation fee paid at reception",
          billedById: req.user!.userId,
          billedAt: new Date(),
        },
        { transaction }
      );

      await InvoiceItem.create(
        {
          invoiceId: invoice.id,
          itemType: "consultation",
          description: `Doctor Consultation Fee (${doctor.fullName})`,
          quantity: 1,
          unitPrice: fee,
          totalPrice: fee,
        },
        { transaction }
      );

      consultationInvoice = invoice;
    }

    // If vitals data was provided during check-in, record it
    if (vitalsData) {
      let bmi: number | null = null;
      const w = parseFloat(vitalsData.weightKg);
      const h = parseFloat(vitalsData.heightCm);
      if (!isNaN(w) && !isNaN(h) && h > 0) {
        const heightInMeters = h / 100;
        bmi = parseFloat((w / (heightInMeters * heightInMeters)).toFixed(1));
      }

      await PatientVitals.create(
        {
          patientId,
          queueEntryId: queueEntry.id,
          appointmentId: appointmentId || null,
          bpSystolic: vitalsData.bpSystolic ? parseInt(vitalsData.bpSystolic, 10) : null,
          bpDiastolic: vitalsData.bpDiastolic ? parseInt(vitalsData.bpDiastolic, 10) : null,
          pulseRate: vitalsData.pulseRate ? parseInt(vitalsData.pulseRate, 10) : null,
          temperature: vitalsData.temperature ? parseFloat(vitalsData.temperature) : null,
          spO2: vitalsData.spO2 ? parseInt(vitalsData.spO2, 10) : null,
          bloodSugar: vitalsData.bloodSugar ? parseInt(vitalsData.bloodSugar, 10) : null,
          sugarTestType: vitalsData.sugarTestType || "random",
          weightKg: !isNaN(w) ? w : null,
          heightCm: !isNaN(h) ? h : null,
          bmi,
          chiefComplaint: vitalsData.chiefComplaint ? vitalsData.chiefComplaint.trim() : null,
          triageNotes: vitalsData.triageNotes ? vitalsData.triageNotes.trim() : null,
          recordedById: req.user!.userId,
          recordedAt: new Date(),
        },
        { transaction }
      );
    }

    await transaction.commit();

    const fullRecord = await QueueEntry.findByPk(queueEntry.id, {
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "mrn", "firstName", "lastName", "phone", "age", "gender"],
        },
        {
          model: User,
          as: "doctor",
          attributes: ["id", "fullName", "department"],
        },
        {
          model: PatientVitals,
          as: "vitals",
        },
      ],
    });

    const responseData = {
      ...(fullRecord ? fullRecord.toJSON() : {}),
      consultationInvoice: consultationInvoice ? consultationInvoice.toJSON() : null,
    };

    res.status(201).json(responseData);
  } catch (err: any) {
    await transaction.rollback();
    console.error("Failed to check in patient to queue:", err);
    res.status(500).json({ message: err.message || "Failed to check in patient" });
  }
});

/**
 * PATCH /queue/:id/call
 * Doctor calls patient into consultation room
 */
router.patch("/:id/call", authorize("queue:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const queueEntry = await QueueEntry.findByPk(id, {
      include: [{ model: User, as: "doctor", attributes: ["id", "fullName"] }],
    });

    if (!queueEntry) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    // Only the assigned doctor (or superadmin) can call the patient into consultation
    if (req.user?.roleSlug === "doctor" && queueEntry.doctorId !== req.user.userId) {
      const assignedName = (queueEntry as any).doctor?.fullName || "another doctor";
      return res.status(403).json({
        message: `This patient is assigned to ${assignedName}. Only the assigned doctor can proceed with this patient.`,
      });
    }

    await queueEntry.update({
      status: "in_consultation",
      calledAt: new Date(),
    });

    res.json(queueEntry);
  } catch (err: any) {
    console.error("Failed to call patient:", err);
    res.status(500).json({ message: err.message || "Failed to call patient" });
  }
});

/**
 * PATCH /queue/:id/reassign
 * Reassign patient to a different doctor
 */
router.patch("/:id/reassign", authorize("queue:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: "Target Doctor ID is required" });
    }

    const queueEntry = await QueueEntry.findByPk(id, {
      include: [{ model: User, as: "doctor", attributes: ["id", "fullName"] }],
    });
    if (!queueEntry) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    // A doctor can only reassign patients who were assigned to them
    if (req.user?.roleSlug === "doctor" && queueEntry.doctorId !== req.user.userId) {
      const assignedName = (queueEntry as any).doctor?.fullName || "another doctor";
      return res.status(403).json({
        message: `This patient is assigned to ${assignedName}. You cannot reassign this patient.`,
      });
    }

    const doctor = await User.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Target doctor not found" });
    }

    await queueEntry.update({
      doctorId,
    });

    res.json({ message: `Reassigned to ${doctor.fullName}`, queueEntry });
  } catch (err: any) {
    console.error("Failed to reassign doctor:", err);
    res.status(500).json({ message: err.message || "Failed to reassign doctor" });
  }
});

/**
 * PATCH /queue/:id/cancel
 * Cancel a queue token (e.g. patient left before consultation)
 */
router.patch("/:id/cancel", authorize("queue:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const queueEntry = await QueueEntry.findByPk(id, {
      include: [{ model: User, as: "doctor", attributes: ["id", "fullName"] }],
    });

    if (!queueEntry) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    // A doctor can only cancel tokens assigned to them
    if (req.user?.roleSlug === "doctor" && queueEntry.doctorId !== req.user.userId) {
      return res.status(403).json({
        message: "You can only cancel queue tokens assigned to you.",
      });
    }

    await queueEntry.update({
      status: "cancelled",
    });

    res.json({ message: "Token cancelled", queueEntry });
  } catch (err: any) {
    console.error("Failed to cancel token:", err);
    res.status(500).json({ message: err.message || "Failed to cancel token" });
  }
});

export default router;
