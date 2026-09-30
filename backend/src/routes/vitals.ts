import { Router, Response } from "express";
import { PatientVitals, Patient, QueueEntry, User } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * POST /vitals
 * Record vitals and triage info for a patient visit
 */
router.post("/", authorize("vitals:write"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      queueEntryId,
      appointmentId,
      bpSystolic,
      bpDiastolic,
      pulseRate,
      temperature,
      spO2,
      bloodSugar,
      sugarTestType,
      weightKg,
      heightCm,
      chiefComplaint,
      triageNotes,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Compute BMI if weight and height are provided: weight / (height/100)^2
    let bmi: number | null = null;
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const heightInMeters = h / 100;
      bmi = parseFloat((w / (heightInMeters * heightInMeters)).toFixed(1));
    }

    const vitals = await PatientVitals.create({
      patientId,
      queueEntryId: queueEntryId || null,
      appointmentId: appointmentId || null,
      bpSystolic: bpSystolic ? parseInt(bpSystolic, 10) : null,
      bpDiastolic: bpDiastolic ? parseInt(bpDiastolic, 10) : null,
      pulseRate: pulseRate ? parseInt(pulseRate, 10) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      spO2: spO2 ? parseInt(spO2, 10) : null,
      bloodSugar: bloodSugar ? parseInt(bloodSugar, 10) : null,
      sugarTestType: sugarTestType || "random",
      weightKg: !isNaN(w) ? w : null,
      heightCm: !isNaN(h) ? h : null,
      bmi,
      chiefComplaint: chiefComplaint ? chiefComplaint.trim() : null,
      triageNotes: triageNotes ? triageNotes.trim() : null,
      recordedById: req.user!.userId,
      recordedAt: new Date(),
    });

    const fullRecord = await PatientVitals.findByPk(vitals.id, {
      include: [
        {
          model: User,
          as: "recordedBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    res.status(201).json(fullRecord);
  } catch (err: any) {
    console.error("Failed to record vitals:", err);
    res.status(500).json({ message: err.message || "Failed to record vitals" });
  }
});

/**
 * GET /vitals/patient/:patientId
 * Get historical vitals for trending and charting
 */
router.get("/patient/:patientId", authorize("vitals:read"), async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;

    const vitalsList = await PatientVitals.findAll({
      where: { patientId },
      order: [["recordedAt", "DESC"]],
      include: [
        {
          model: User,
          as: "recordedBy",
          attributes: ["id", "fullName"],
        },
      ],
    });

    res.json(vitalsList);
  } catch (err: any) {
    console.error("Failed to get vitals:", err);
    res.status(500).json({ message: err.message || "Failed to get vitals" });
  }
});

export default router;
