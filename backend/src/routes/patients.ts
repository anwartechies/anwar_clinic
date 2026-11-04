import { Router, Response } from "express";
import { Op } from "sequelize";
import {
  Patient,
  PatientVitals,
  Appointment,
  QueueEntry,
  Consultation,
  Prescription,
  PrescriptionItem,
  Invoice,
  User,
  sequelize,
} from "../models";
import { authenticate, authorize, authorizeAny, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * Helper to generate sequential MRN: ANW-{YY}-{5-digit sequence}
 * e.g. ANW-26-00001
 */
async function generateMrn(): Promise<string> {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const prefix = `ANW-${yearSuffix}-`;

  const latest = await Patient.findOne({
    where: {
      mrn: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["createdAt", "DESC"]],
  });

  let nextSeq = 1;
  if (latest && latest.mrn) {
    const parts = latest.mrn.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  return `${prefix}${nextSeq.toString().padStart(5, "0")}`;
}

/**
 * GET /patients
 * Paginated list of patients with search (name, phone, MRN)
 */
router.get("/", authorize("patients:read"), async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
    const offset = (page - 1) * limit;
    const search = ((req.query.search as string) || "").trim();
    const gender = req.query.gender as string;
    const bloodGroup = req.query.bloodGroup as string;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { mrn: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (gender) {
      where.gender = gender;
    }
    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    const { count, rows } = await Patient.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    res.json({
      patients: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err: any) {
    console.error("Failed to list patients:", err);
    res.status(500).json({ message: err.message || "Failed to list patients" });
  }
});

/**
 * POST /patients
 * Register a new patient
 */
router.post("/", authorize("patients:write"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      gender,
      dob,
      age,
      bloodGroup,
      allergies,
      chronicConditions,
      emergencyContactName,
      emergencyContactPhone,
      address,
      city,
      notes,
    } = req.body;

    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ message: "First name, last name, and phone are required" });
    }

    // Check for existing patient with exact same phone number
    const existing = await Patient.findOne({ where: { phone: phone.trim() } });
    if (existing) {
      return res.status(409).json({
        message: `A patient with phone ${phone} already exists (${existing.firstName} ${existing.lastName}, MRN: ${existing.mrn})`,
        patient: existing,
      });
    }

    const mrn = await generateMrn();

    const patient = await Patient.create({
      mrn,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      gender: gender || "male",
      dob: dob || null,
      age: age ? parseInt(age, 10) : null,
      bloodGroup: bloodGroup || null,
      allergies: Array.isArray(allergies) ? allergies : [],
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : [],
      emergencyContactName: emergencyContactName ? emergencyContactName.trim() : null,
      emergencyContactPhone: emergencyContactPhone ? emergencyContactPhone.trim() : null,
      address: address ? address.trim() : null,
      city: city ? city.trim() : null,
      notes: notes ? notes.trim() : null,
      createdById: req.user?.userId || null,
    });

    res.status(201).json(patient);
  } catch (err: any) {
    console.error("Failed to create patient:", err);
    res.status(500).json({ message: err.message || "Failed to create patient" });
  }
});

/**
 * GET /patients/:id
 * Full details of a patient with latest vitals and active queue entry
 */
router.get("/:id", authorize("patients:read"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get today's queue entry if any
    const today = new Date().toISOString().split("T")[0];
    const activeQueue = await QueueEntry.findOne({
      where: {
        patientId: id,
        queueDate: today,
        status: { [Op.ne]: "cancelled" },
      },
      include: [
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
      order: [["createdAt", "DESC"]],
    });

    // Get latest vitals recorded ever
    const latestVitals = await PatientVitals.findOne({
      where: { patientId: id },
      order: [["recordedAt", "DESC"]],
      include: [
        {
          model: User,
          as: "recordedBy",
          attributes: ["id", "fullName"],
        },
      ],
    });

    res.json({
      patient,
      activeQueue,
      latestVitals,
    });
  } catch (err: any) {
    console.error("Failed to fetch patient:", err);
    res.status(500).json({ message: err.message || "Failed to fetch patient" });
  }
});

/**
 * PUT /patients/:id
 * Update patient record
 */
router.put("/:id", authorize("patients:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      gender,
      dob,
      age,
      bloodGroup,
      allergies,
      chronicConditions,
      emergencyContactName,
      emergencyContactPhone,
      address,
      city,
      notes,
    } = req.body;

    await patient.update({
      firstName: firstName !== undefined ? firstName.trim() : patient.firstName,
      lastName: lastName !== undefined ? lastName.trim() : patient.lastName,
      phone: phone !== undefined ? phone.trim() : patient.phone,
      email: email !== undefined ? (email ? email.trim() : null) : patient.email,
      gender: gender !== undefined ? gender : patient.gender,
      dob: dob !== undefined ? dob : patient.dob,
      age: age !== undefined ? (age ? parseInt(age, 10) : null) : patient.age,
      bloodGroup: bloodGroup !== undefined ? bloodGroup : patient.bloodGroup,
      allergies: allergies !== undefined ? allergies : patient.allergies,
      chronicConditions:
        chronicConditions !== undefined ? chronicConditions : patient.chronicConditions,
      emergencyContactName:
        emergencyContactName !== undefined ? emergencyContactName : patient.emergencyContactName,
      emergencyContactPhone:
        emergencyContactPhone !== undefined ? emergencyContactPhone : patient.emergencyContactPhone,
      address: address !== undefined ? address : patient.address,
      city: city !== undefined ? city : patient.city,
      notes: notes !== undefined ? notes : patient.notes,
    });

    res.json(patient);
  } catch (err: any) {
    console.error("Failed to update patient:", err);
    res.status(500).json({ message: err.message || "Failed to update patient" });
  }
});

/**
 * GET /patients/:id/timeline
 * Complete historical chronological feed: vitals, consultations, prescriptions, invoices, past visits
 */
router.get(
  "/:id/timeline",
  authorizeAny("patients:read", "consultation:write", "doctors:read", "queue:read"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [vitals, consultations, prescriptions, invoices, appointments, queueVisits] = await Promise.all([
        PatientVitals.findAll({
          where: { patientId: id },
          order: [["recordedAt", "DESC"]],
          include: [{ model: User, as: "recordedBy", attributes: ["id", "fullName"] }],
        }),
        Consultation.findAll({
          where: { patientId: id },
          order: [["createdAt", "DESC"]],
          include: [
            { model: User, as: "doctor", attributes: ["id", "fullName", "department", "designation"] },
            {
              model: Prescription,
              as: "prescription",
              include: [{ model: PrescriptionItem, as: "items" }],
            },
            {
              model: QueueEntry,
              as: "queueEntry",
              include: [{ model: PatientVitals, as: "vitals" }],
            },
          ],
        }),
        Prescription.findAll({
          where: { patientId: id },
          order: [["createdAt", "DESC"]],
          include: [
            { model: User, as: "doctor", attributes: ["id", "fullName", "department"] },
            { model: PrescriptionItem, as: "items" },
          ],
        }),
        Invoice.findAll({
          where: { patientId: id },
          order: [["billedAt", "DESC"]],
          include: [
            { model: User, as: "billedBy", attributes: ["id", "fullName"] },
            { association: "items" },
          ],
        }),
        Appointment.findAll({
          where: { patientId: id },
          order: [["appointmentDate", "DESC"]],
          include: [{ model: User, as: "doctor", attributes: ["id", "fullName"] }],
        }),
        QueueEntry.findAll({
          where: { patientId: id },
          order: [["queueDate", "DESC"], ["queuedAt", "DESC"]],
          include: [
            { model: User, as: "doctor", attributes: ["id", "fullName", "department"] },
            { model: PatientVitals, as: "vitals" },
          ],
        }),
      ]);

      const totalVisits = Math.max(queueVisits.length, consultations.length);
      const pastDoctors = Array.from(
        new Map(
          consultations
            .filter((c: any) => c.doctor)
            .map((c: any) => [c.doctor.id, { id: c.doctor.id, fullName: c.doctor.fullName, department: c.doctor.department }])
        ).values()
      );

      res.json({
        summary: {
          totalVisits,
          firstVisitDate: queueVisits.length > 0 ? queueVisits[queueVisits.length - 1].queueDate : null,
          lastVisitDate: queueVisits.length > 0 ? queueVisits[0].queueDate : null,
          pastDoctors,
        },
        vitals,
        consultations,
        prescriptions,
        invoices,
        appointments,
        queueVisits,
      });
    } catch (err: any) {
      console.error("Failed to fetch patient timeline:", err);
      res.status(500).json({ message: err.message || "Failed to fetch patient timeline" });
    }
  }
);

export default router;
