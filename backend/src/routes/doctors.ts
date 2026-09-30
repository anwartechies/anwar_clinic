import { Router, Response } from "express";
import { Op } from "sequelize";
import { User, Role } from "../models";
import { authenticate, authorizeAny, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: List all active consulting doctors (accessible to receptionists, doctors, and staff)
 *     tags: [Clinical - Doctors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search doctor by name, department, or designation
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by clinical department
 *     responses:
 *       200:
 *         description: List of active doctors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - missing clinical read permissions
 */
router.get(
  "/",
  authorizeAny(
    "doctors:read",
    "appointments:read",
    "appointments:write",
    "vitals:read",
    "vitals:write",
    "queue:read",
    "queue:write",
    "patients:read"
  ),
  async (req: AuthRequest, res: Response) => {
    try {
      const { search, department } = req.query;

      const where: any = {
        status: "active",
      };

      if (department && typeof department === "string" && department.trim()) {
        where.department = { [Op.iLike]: `%${department.trim()}%` };
      }

      if (search && typeof search === "string" && search.trim()) {
        const term = `%${search.trim()}%`;
        where[Op.or] = [
          { fullName: { [Op.iLike]: term } },
          { department: { [Op.iLike]: term } },
          { designation: { [Op.iLike]: term } },
        ];
      }

      const allActiveStaff = await User.findAll({
        where,
        attributes: ["id", "fullName", "email", "phone", "department", "designation", "roleId"],
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "name", "slug", "description"],
          },
        ],
        order: [["fullName", "ASC"]],
      });

      // Filter specifically for doctor role or medical designations
      const doctorsOnly = allActiveStaff.filter((u: any) => {
        const roleSlug = u.role?.slug?.toLowerCase() || "";
        const roleName = u.role?.name?.toLowerCase() || "";
        const dept = u.department?.toLowerCase() || "";
        const desig = u.designation?.toLowerCase() || "";
        const name = u.fullName?.toLowerCase() || "";

        return (
          roleSlug === "doctor" ||
          roleName.includes("doctor") ||
          roleName.includes("physician") ||
          roleName.includes("surgeon") ||
          dept.includes("doctor") ||
          dept.includes("dermatol") ||
          dept.includes("trichol") ||
          dept.includes("clinic") ||
          desig.includes("doctor") ||
          desig.includes("surgeon") ||
          desig.includes("physician") ||
          desig.includes("consultant") ||
          name.startsWith("dr.") ||
          name.startsWith("dr ")
        );
      });

      // If doctors found, return doctors. If clinic hasn't tagged any doctor specifically yet,
      // fallback to active staff so receptionists are not blocked from assigning walk-ins.
      const result = doctorsOnly.length > 0 ? doctorsOnly : allActiveStaff;

      res.json(result);
    } catch (err: any) {
      console.error("[Doctors] Error fetching doctors list:", err);
      res.status(500).json({ message: "Failed to fetch doctors list" });
    }
  }
);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor details by ID
 *     tags: [Clinical - Doctors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 */
router.get(
  "/:id",
  authorizeAny(
    "doctors:read",
    "appointments:read",
    "appointments:write",
    "vitals:read",
    "vitals:write",
    "queue:read",
    "queue:write",
    "patients:read"
  ),
  async (req: AuthRequest, res: Response) => {
    try {
      const doctor = await User.findOne({
        where: { id: req.params.id, status: "active" },
        attributes: ["id", "fullName", "email", "phone", "department", "designation", "roleId"],
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "name", "slug", "description"],
          },
        ],
      });

      if (!doctor) {
        res.status(404).json({ message: "Doctor not found" });
        return;
      }

      res.json(doctor);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch doctor details" });
    }
  }
);

export default router;
