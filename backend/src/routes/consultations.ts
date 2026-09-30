import { Router, Response } from "express";
import { Op } from "sequelize";
import {
  Consultation,
  Prescription,
  PrescriptionItem,
  QueueEntry,
  Patient,
  PatientVitals,
  Invoice,
  InvoiceItem,
  InventoryItem,
  User,
  sequelize,
} from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

async function generateConsultationNumber(): Promise<string> {
  const now = new Date();
  const yearSuffix = now.getFullYear().toString().slice(-2);
  const monthStr = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `CNS-${yearSuffix}${monthStr}-`;

  const latest = await Consultation.findOne({
    where: { consultationNumber: { [Op.like]: `${prefix}%` } },
    order: [["createdAt", "DESC"]],
  });

  let nextSeq = 1;
  if (latest && latest.consultationNumber) {
    const parts = latest.consultationNumber.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }
  return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
}

async function generatePrescriptionNumber(): Promise<string> {
  const now = new Date();
  const yearSuffix = now.getFullYear().toString().slice(-2);
  const monthStr = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `RX-${yearSuffix}${monthStr}-`;

  const latest = await Prescription.findOne({
    where: { prescriptionNumber: { [Op.like]: `${prefix}%` } },
    order: [["createdAt", "DESC"]],
  });

  let nextSeq = 1;
  if (latest && latest.prescriptionNumber) {
    const parts = latest.prescriptionNumber.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }
  return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
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
 * GET /consultations/:id
 * Retrieve a consultation with patient, vitals, prescription, and invoice
 */
router.get("/:id", authorize("consultation:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
        },
        {
          model: User,
          as: "doctor",
          attributes: ["id", "fullName", "department", "designation"],
        },
        {
          model: QueueEntry,
          as: "queueEntry",
          include: [{ model: PatientVitals, as: "vitals" }],
        },
        {
          model: Prescription,
          as: "prescription",
          include: [
            { model: PrescriptionItem, as: "items" },
            { model: Patient, as: "patient" },
            { model: User, as: "doctor", attributes: ["id", "fullName", "department", "designation"] },
          ],
        },
        {
          model: Invoice,
          as: "invoice",
          include: [{ model: InvoiceItem, as: "items" }],
        },
      ],
    });

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.json(consultation);
  } catch (err: any) {
    console.error("Failed to fetch consultation:", err);
    res.status(500).json({ message: err.message || "Failed to fetch consultation" });
  }
});

/**
 * POST /consultations
 * Initialize or save draft consultation
 */
router.post("/", authorize("consultation:write"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      queueEntryId,
      symptoms,
      examinationFindings,
      diagnosis,
      secondaryDiagnosis,
      clinicalNotes,
      proceduresRecommended,
      investigationsAdvised,
      followUpDate,
      followUpInstructions,
      consultationFee,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    // If queueEntryId is given, verify that only the assigned doctor (or superadmin) can proceed
    let consultation: Consultation | null = null;
    if (queueEntryId) {
      const queueEntry = await QueueEntry.findByPk(queueEntryId, {
        include: [{ model: User, as: "doctor", attributes: ["id", "fullName"] }],
      });

      if (!queueEntry) {
        return res.status(404).json({ message: "Queue entry not found" });
      }

      if (req.user?.roleSlug === "doctor" && queueEntry.doctorId !== req.user.userId) {
        const assignedName = (queueEntry as any).doctor?.fullName || "another doctor";
        return res.status(403).json({
          message: `This patient is assigned to ${assignedName}. Only the assigned doctor can proceed with this patient.`,
        });
      }

      consultation = await Consultation.findOne({
        where: { queueEntryId, status: "draft" },
      });
    }

    if (consultation) {
      await consultation.update({
        symptoms: symptoms !== undefined ? symptoms : consultation.symptoms,
        examinationFindings:
          examinationFindings !== undefined
            ? examinationFindings
            : consultation.examinationFindings,
        diagnosis: diagnosis !== undefined ? diagnosis : consultation.diagnosis,
        secondaryDiagnosis:
          secondaryDiagnosis !== undefined
            ? secondaryDiagnosis
            : consultation.secondaryDiagnosis,
        clinicalNotes:
          clinicalNotes !== undefined ? clinicalNotes : consultation.clinicalNotes,
        proceduresRecommended:
          proceduresRecommended !== undefined
            ? proceduresRecommended
            : consultation.proceduresRecommended,
        investigationsAdvised:
          investigationsAdvised !== undefined
            ? investigationsAdvised
            : consultation.investigationsAdvised,
        followUpDate: followUpDate !== undefined ? followUpDate : consultation.followUpDate,
        followUpInstructions:
          followUpInstructions !== undefined
            ? followUpInstructions
            : consultation.followUpInstructions,
        consultationFee:
          consultationFee !== undefined ? parseFloat(consultationFee) : consultation.consultationFee,
      });
    } else {
      const consultationNumber = await generateConsultationNumber();
      consultation = await Consultation.create({
        consultationNumber,
        patientId,
        doctorId: req.user!.userId,
        queueEntryId: queueEntryId || null,
        symptoms: symptoms || null,
        examinationFindings: examinationFindings || null,
        diagnosis: diagnosis || "Pending evaluation",
        secondaryDiagnosis: secondaryDiagnosis || null,
        clinicalNotes: clinicalNotes || null,
        proceduresRecommended: Array.isArray(proceduresRecommended) ? proceduresRecommended : [],
        investigationsAdvised: Array.isArray(investigationsAdvised) ? investigationsAdvised : [],
        followUpDate: followUpDate || null,
        followUpInstructions: followUpInstructions || null,
        consultationFee: consultationFee ? parseFloat(consultationFee) : 0,
        status: "draft",
        startedAt: new Date(),
      });
    }

    res.json(consultation);
  } catch (err: any) {
    console.error("Failed to save draft consultation:", err);
    res.status(500).json({ message: err.message || "Failed to save draft consultation" });
  }
});

/**
 * POST /consultations/:id/finalize
 * Finalize consultation: creates prescription, advances queue to pending_billing, creates invoice
 */
router.post("/:id/finalize", authorize("consultation:write"), async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      diagnosis,
      secondaryDiagnosis,
      symptoms,
      examinationFindings,
      clinicalNotes,
      proceduresRecommended,
      investigationsAdvised,
      followUpDate,
      followUpInstructions,
      consultationFee,
      generalAdvice,
      medicines, // Array of { medicineName, genericName, dosageForm, strength, frequency, durationValue, durationUnit, timing, instructions, inventoryItemId }
    } = req.body;

    const consultation = await Consultation.findByPk(id, {
      include: [{ model: User, as: "doctor", attributes: ["id", "fullName"] }],
      transaction,
    });
    if (!consultation) {
      await transaction.rollback();
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Only the assigned doctor (or superadmin) can finalize the consultation
    if (req.user?.roleSlug === "doctor" && consultation.doctorId !== req.user.userId) {
      await transaction.rollback();
      const assignedName = (consultation as any).doctor?.fullName || "another doctor";
      return res.status(403).json({
        message: `This consultation belongs to ${assignedName}. Only the assigned doctor can finalize it.`,
      });
    }

    if (!diagnosis) {
      await transaction.rollback();
      return res.status(400).json({ message: "A primary diagnosis is required to finalize consultation" });
    }

    const feeAmount = consultationFee ? parseFloat(consultationFee) : Number(consultation.consultationFee) || 0;

    // 1. Update Consultation status to finalized
    await consultation.update(
      {
        diagnosis,
        secondaryDiagnosis: secondaryDiagnosis || null,
        symptoms: symptoms || consultation.symptoms,
        examinationFindings: examinationFindings || consultation.examinationFindings,
        clinicalNotes: clinicalNotes || consultation.clinicalNotes,
        proceduresRecommended: Array.isArray(proceduresRecommended) ? proceduresRecommended : consultation.proceduresRecommended,
        investigationsAdvised: Array.isArray(investigationsAdvised) ? investigationsAdvised : consultation.investigationsAdvised,
        followUpDate: followUpDate || null,
        followUpInstructions: followUpInstructions || null,
        consultationFee: feeAmount,
        status: "finalized",
        finalizedAt: new Date(),
      },
      { transaction }
    );

    // 2. Create Prescription if medicines or advice provided
    let prescription: Prescription | null = null;
    if (Array.isArray(medicines) && medicines.length > 0) {
      const prescriptionNumber = await generatePrescriptionNumber();
      prescription = await Prescription.create(
        {
          prescriptionNumber,
          consultationId: consultation.id,
          patientId: consultation.patientId,
          doctorId: consultation.doctorId,
          generalAdvice: generalAdvice || null,
          status: "active",
          signedAt: new Date(),
        },
        { transaction }
      );

      for (const item of medicines) {
        if (!item.medicineName) continue;
        await PrescriptionItem.create(
          {
            prescriptionId: prescription.id,
            medicineName: item.medicineName,
            genericName: item.genericName || null,
            dosageForm: item.dosageForm || "tablet",
            strength: item.strength || null,
            frequency: item.frequency || "1-0-1",
            durationValue: item.durationValue ? parseInt(item.durationValue, 10) : 30,
            durationUnit: item.durationUnit || "days",
            timing: item.timing || "after_food",
            instructions: item.instructions || null,
            inventoryItemId: item.inventoryItemId || null,
          },
          { transaction }
        );
      }
    }

    // 3. Update Queue Entry status:
    // If medicines prescribed -> pending_pharmacy (sent to pharmacist queue)
    // If no medicines -> completed (consultation finished)
    const hasMedicines = Boolean(prescription && Array.isArray(medicines) && medicines.length > 0);
    const nextStatus = hasMedicines ? "pending_pharmacy" : "completed";

    if (consultation.queueEntryId) {
      await QueueEntry.update(
        {
          status: nextStatus,
          completedAt: new Date(),
        },
        { where: { id: consultation.queueEntryId }, transaction }
      );
    }

    await transaction.commit();

    const finalizedConsultation = await Consultation.findByPk(consultation.id, {
      include: [
        { model: Patient, as: "patient" },
        { model: User, as: "doctor", attributes: ["id", "fullName", "department", "designation"] },
        {
          model: Prescription,
          as: "prescription",
          include: [
            { model: PrescriptionItem, as: "items" },
            { model: Patient, as: "patient" },
            { model: User, as: "doctor", attributes: ["id", "fullName", "department", "designation"] },
          ],
        },
        {
          model: Invoice,
          as: "invoice",
          include: [{ model: InvoiceItem, as: "items" }],
        },
      ],
    });

    res.json({
      message: "Consultation finalized successfully",
      consultation: finalizedConsultation,
    });
  } catch (err: any) {
    await transaction.rollback();
    console.error("Failed to finalize consultation:", err);
    res.status(500).json({ message: err.message || "Failed to finalize consultation" });
  }
});

export default router;
