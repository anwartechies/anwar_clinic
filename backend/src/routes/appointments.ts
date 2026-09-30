import { Router, Response } from "express";
import { Op } from "sequelize";
import {
  Appointment,
  Patient,
  User,
  QueueEntry,
  PatientVitals,
  sequelize,
} from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * Generate sequential appointment number: APT-{YYMM}-{4-digit seq}
 * e.g. APT-2609-0001
 */
async function generateAppointmentNumber(): Promise<string> {
  const now = new Date();
  const yearSuffix = now.getFullYear().toString().slice(-2);
  const monthStr = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `APT-${yearSuffix}${monthStr}-`;

  const latest = await Appointment.findOne({
    where: {
      appointmentNumber: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["createdAt", "DESC"]],
  });

  let nextSeq = 1;
  if (latest && latest.appointmentNumber) {
    const parts = latest.appointmentNumber.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
}

/**
 * GET /appointments
 * Retrieve appointments with optional doctor, date range, and status filters
 */
router.get("/", authorize("appointments:read"), async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, startDate, endDate, status } = req.query;

    const where: any = {};

    if (req.user?.roleSlug === "doctor") {
      where.doctorId = req.user.userId;
    } else if (doctorId) {
      where.doctorId = doctorId;
    }
    if (status) {
      where.status = status;
    }

    if (date) {
      where.appointmentDate = date;
    } else if (startDate && endDate) {
      where.appointmentDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const appointments = await Appointment.findAll({
      where,
      order: [
        ["appointmentDate", "ASC"],
        ["timeSlot", "ASC"],
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
            "email",
            "age",
            "gender",
            "bloodGroup",
          ],
        },
        {
          model: User,
          as: "doctor",
          attributes: ["id", "fullName", "department", "designation"],
        },
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
      ],
    });

    res.json(appointments);
  } catch (err: any) {
    console.error("Failed to fetch appointments:", err);
    res.status(500).json({ message: err.message || "Failed to fetch appointments" });
  }
});

/**
 * POST /appointments
 * Book a new appointment slot
 */
router.post("/", authorize("appointments:write"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      type,
      channel,
      reason,
    } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        message: "Patient ID, Doctor ID, appointment date, and time slot are required",
      });
    }

    // Verify patient and doctor exist
    const [patient, doctor] = await Promise.all([
      Patient.findByPk(patientId),
      User.findByPk(doctorId),
    ]);

    if (!patient) return res.status(404).json({ message: "Patient not found" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Check slot collision for this doctor on this date/slot
    const existingSlot = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        timeSlot,
        status: { [Op.in]: ["scheduled", "checked_in"] },
      },
    });

    if (existingSlot) {
      return res.status(409).json({
        message: `Doctor ${doctor.fullName} already has an appointment booked for ${timeSlot} on ${appointmentDate}`,
      });
    }

    const appointmentNumber = await generateAppointmentNumber();

    const appointment = await Appointment.create({
      appointmentNumber,
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      type: type || "new_consultation",
      channel: channel || "walk_in",
      status: "scheduled",
      reason: reason ? reason.trim() : null,
      createdById: req.user?.userId || null,
    });

    const fullRecord = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Patient, as: "patient" },
        { model: User, as: "doctor", attributes: ["id", "fullName", "department"] },
      ],
    });

    res.status(201).json(fullRecord);
  } catch (err: any) {
    console.error("Failed to book appointment:", err);
    res.status(500).json({ message: err.message || "Failed to book appointment" });
  }
});

/**
 * PATCH /appointments/:id/reschedule
 * Reschedule an appointment slot
 */
router.patch("/:id/reschedule", authorize("appointments:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { appointmentDate, timeSlot, doctorId } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const targetDoctorId = doctorId || appointment.doctorId;
    const targetDate = appointmentDate || appointment.appointmentDate;
    const targetSlot = timeSlot || appointment.timeSlot;

    // Check collision
    const existing = await Appointment.findOne({
      where: {
        id: { [Op.ne]: id },
        doctorId: targetDoctorId,
        appointmentDate: targetDate,
        timeSlot: targetSlot,
        status: { [Op.in]: ["scheduled", "checked_in"] },
      },
    });

    if (existing) {
      return res.status(409).json({
        message: `Selected slot ${targetSlot} is already booked for that doctor`,
      });
    }

    await appointment.update({
      doctorId: targetDoctorId,
      appointmentDate: targetDate,
      timeSlot: targetSlot,
      status: "scheduled",
    });

    res.json(appointment);
  } catch (err: any) {
    console.error("Failed to reschedule appointment:", err);
    res.status(500).json({ message: err.message || "Failed to reschedule appointment" });
  }
});

/**
 * PATCH /appointments/:id/cancel
 * Cancel an appointment with mandatory cancellation reason
 */
router.patch("/:id/cancel", authorize("appointments:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await appointment.update({
      status: "cancelled",
      cancellationReason: cancellationReason ? cancellationReason.trim() : null,
    });

    res.json(appointment);
  } catch (err: any) {
    console.error("Failed to cancel appointment:", err);
    res.status(500).json({ message: err.message || "Failed to cancel appointment" });
  }
});

/**
 * POST /appointments/:id/checkin
 * Direct check-in of a booked appointment, moving it into today's queue
 */
router.post("/:id/checkin", authorize("appointments:write"), async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id, { transaction });

    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({ message: "Appointment not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in or active
    const countToday = await QueueEntry.count({
      where: { queueDate: today },
      transaction,
    });
    const tokenNumber = `TK-${(countToday + 1).toString().padStart(3, "0")}`;

    const queueEntry = await QueueEntry.create(
      {
        tokenNumber,
        queueDate: today,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: appointment.id,
        priority: appointment.type === "follow_up" ? "follow_up" : "normal",
        status: "waiting",
        queuedAt: new Date(),
        createdById: req.user?.userId || null,
      },
      { transaction }
    );

    await appointment.update({ status: "checked_in" }, { transaction });

    await transaction.commit();

    const fullRecord = await QueueEntry.findByPk(queueEntry.id, {
      include: [
        { model: Patient, as: "patient" },
        { model: User, as: "doctor", attributes: ["id", "fullName", "department"] },
        { model: Appointment, as: "appointment" },
      ],
    });

    res.status(201).json(fullRecord);
  } catch (err: any) {
    await transaction.rollback();
    console.error("Failed to check-in appointment:", err);
    res.status(500).json({ message: err.message || "Failed to check-in appointment" });
  }
});

export default router;
