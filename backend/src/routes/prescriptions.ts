import { Router, Response } from "express";
import { Op } from "sequelize";
import {
  Prescription,
  PrescriptionItem,
  Consultation,
  Patient,
  PatientVitals,
  User,
  InventoryItem,
} from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * GET /prescriptions
 * List prescriptions with search, doctor, and status filters
 */
router.get("/", authorize("prescriptions:read"), async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
    const offset = (page - 1) * limit;
    const search = ((req.query.search as string) || "").trim();
    const doctorId = req.query.doctorId as string;
    const status = req.query.status as string;

    const where: any = {};
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { prescriptionNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Prescription.findAndCountAll({
      where,
      limit,
      offset,
      order: [["signedAt", "DESC"]],
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "mrn", "firstName", "lastName", "phone", "age", "gender"],
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
          as: "doctor",
          attributes: ["id", "fullName", "department", "designation"],
        },
        {
          model: Consultation,
          as: "consultation",
          attributes: ["id", "consultationNumber", "diagnosis", "followUpDate"],
        },
        {
          model: PrescriptionItem,
          as: "items",
        },
      ],
    });

    res.json({
      prescriptions: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err: any) {
    console.error("Failed to list prescriptions:", err);
    res.status(500).json({ message: err.message || "Failed to list prescriptions" });
  }
});

/**
 * GET /prescriptions/:id
 * Full printable prescription details
 */
router.get("/:id", authorize("prescriptions:read"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
          include: [
            {
              model: PatientVitals,
              as: "vitals",
              limit: 1,
              order: [["recordedAt", "DESC"]],
            },
          ],
        },
        {
          model: User,
          as: "doctor",
          attributes: ["id", "fullName", "department", "designation", "phone"],
        },
        {
          model: Consultation,
          as: "consultation",
        },
        {
          model: PrescriptionItem,
          as: "items",
          include: [
            {
              model: InventoryItem,
              as: "inventoryItem",
              attributes: ["id", "name", "sku", "sellingPrice", "stockQuantity"],
            },
          ],
        },
      ],
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (err: any) {
    console.error("Failed to fetch prescription:", err);
    res.status(500).json({ message: err.message || "Failed to fetch prescription" });
  }
});

export default router;
