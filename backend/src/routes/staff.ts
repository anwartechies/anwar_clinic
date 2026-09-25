import { Router, Response } from "express";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { User, Role } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";
import { isPlatformAdmin } from "../config/platform";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: List clinic staff members
 *     tags: [Admin - Staff]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, department, or designation
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: string
 *         description: Filter by role ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *         description: Filter by account status
 *     responses:
 *       200:
 *         description: List of staff members
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - missing staff:read permission
 */
router.get("/", authorize("staff:read"), async (req: AuthRequest, res: Response) => {
  const { search, roleId, status } = req.query;

  const where: any = {};

  if (status && (status === "active" || status === "inactive")) {
    where.status = status;
  }

  if (roleId && typeof roleId === "string" && roleId !== "all") {
    where.roleId = roleId;
  }

  if (search && typeof search === "string" && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { fullName: { [Op.iLike]: term } },
      { email: { [Op.iLike]: term } },
      { department: { [Op.iLike]: term } },
      { designation: { [Op.iLike]: term } },
      { phone: { [Op.iLike]: term } },
    ];
  }

  const staff = await User.findAll({
    where,
    attributes: { exclude: ["passwordHash"] },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "name", "slug", "description"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json(staff);
});

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Add / invite a new staff member (initially inactive until first login)
 *     tags: [Admin - Staff]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - roleId
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Dr. Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@anwarclinic.com
 *               roleId:
 *                 type: string
 *                 format: uuid
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecretPass123!
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Staff member created with status inactive
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - missing staff:write permission
 */
router.post("/", authorize("staff:write"), async (req: AuthRequest, res: Response) => {
  const { fullName, email, roleId, password, phone, department, designation } = req.body;

  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    res.status(400).json({ message: "Full name is required" });
    return;
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({ message: "Please enter a valid email address" });
    return;
  }

  if (!roleId || typeof roleId !== "string") {
    res.status(400).json({ message: "Role is required" });
    return;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters long" });
    return;
  }

  // Check if email already registered
  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    res.status(400).json({ message: "A staff member with this email already exists" });
    return;
  }

  // Verify role exists
  const role = await Role.findByPk(roleId);
  if (!role) {
    res.status(400).json({ message: "Selected role does not exist" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // New staff members start with inactive status and lastLoginAt = null
  // Status will switch to active automatically upon their first successful login.
  const newUser = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    roleId,
    phone: phone ? String(phone).trim() : null,
    department: department ? String(department).trim() : null,
    designation: designation ? String(designation).trim() : null,
    status: "inactive",
    lastLoginAt: null,
  });

  const createdStaff = await User.findByPk(newUser.id, {
    attributes: { exclude: ["passwordHash"] },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "name", "slug", "description"],
      },
    ],
  });

  res.status(201).json(createdStaff);
});

/**
 * @swagger
 * /staff/{id}:
 *   put:
 *     summary: Update staff member details
 *     tags: [Admin - Staff]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               roleId:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       404:
 *         description: Staff member not found
 */
router.put("/:id", authorize("staff:write"), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { fullName, email, roleId, phone, department, designation, status } = req.body;

  const staff = await User.findByPk(id);
  if (!staff) {
    res.status(404).json({ message: "Staff member not found" });
    return;
  }

  // Prevent user from deactivating themselves
  if (req.user?.userId === staff.id && status === "inactive") {
    res.status(400).json({ message: "You cannot deactivate your own account" });
    return;
  }

  const updates: any = {};

  if (fullName && typeof fullName === "string" && fullName.trim()) {
    updates.fullName = fullName.trim();
  }

  if (email && typeof email === "string" && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== staff.email) {
      const existing = await User.findOne({ where: { email: normalizedEmail } });
      if (existing) {
        res.status(400).json({ message: "Email is already taken by another account" });
        return;
      }
      updates.email = normalizedEmail;
    }
  }

  if (roleId && typeof roleId === "string") {
    const role = await Role.findByPk(roleId);
    if (!role) {
      res.status(400).json({ message: "Selected role does not exist" });
      return;
    }
    updates.roleId = roleId;
  }

  if (phone !== undefined) {
    updates.phone = phone ? String(phone).trim() : null;
  }

  if (department !== undefined) {
    updates.department = department ? String(department).trim() : null;
  }

  if (designation !== undefined) {
    updates.designation = designation ? String(designation).trim() : null;
  }

  if (status && (status === "active" || status === "inactive")) {
    updates.status = status;
  }

  await staff.update(updates);

  const updatedStaff = await User.findByPk(id, {
    attributes: { exclude: ["passwordHash"] },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "name", "slug", "description"],
      },
    ],
  });

  res.json(updatedStaff);
});

/**
 * @swagger
 * /staff/{id}/reset-password:
 *   post:
 *     summary: Reset password for a staff member
 *     tags: [Admin - Staff]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               requireFirstLoginActivation:
 *                 type: boolean
 *                 description: If true, sets status to inactive and clears lastLoginAt so it activates on next login
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Staff member not found
 */
router.post("/:id/reset-password", authorize("staff:write"), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { password, requireFirstLoginActivation } = req.body;

  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters long" });
    return;
  }

  const staff = await User.findByPk(id);
  if (!staff) {
    res.status(404).json({ message: "Staff member not found" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const updates: any = { passwordHash };
  if (requireFirstLoginActivation) {
    updates.status = "inactive";
    updates.lastLoginAt = null;
  }

  await staff.update(updates);

  res.json({ message: "Password updated successfully" });
});

/**
 * @swagger
 * /staff/{id}/status:
 *   patch:
 *     summary: Toggle or set staff member status (active / inactive)
 *     tags: [Admin - Staff]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Cannot deactivate own account or invalid status
 *       404:
 *         description: Staff member not found
 */
router.patch("/:id/status", authorize("staff:write"), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "active" && status !== "inactive") {
    res.status(400).json({ message: "Status must be either active or inactive" });
    return;
  }

  const staff = await User.findByPk(id);
  if (!staff) {
    res.status(404).json({ message: "Staff member not found" });
    return;
  }

  if (req.user?.userId === staff.id && status === "inactive") {
    res.status(400).json({ message: "You cannot deactivate your own account" });
    return;
  }

  await staff.update({ status });

  const updatedStaff = await User.findByPk(id, {
    attributes: { exclude: ["passwordHash"] },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "name", "slug", "description"],
      },
    ],
  });

  res.json(updatedStaff);
});

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     summary: Delete or deactivate a staff member
 *     tags: [Admin - Staff]
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
 *         description: Staff member removed or deactivated
 *       400:
 *         description: Cannot delete own account
 *       403:
 *         description: Cannot delete platform admin
 *       404:
 *         description: Staff member not found
 */
router.delete("/:id", authorize("staff:write"), async (req: AuthRequest, res: Response) => {
  if (req.user?.roleSlug !== "superadmin") {
    res.status(403).json({ message: "Only superadmin can delete staff members" });
    return;
  }

  const { id } = req.params;

  const staff = await User.findByPk(id);
  if (!staff) {
    res.status(404).json({ message: "Staff member not found" });
    return;
  }

  if (req.user?.userId === staff.id) {
    res.status(400).json({ message: "You cannot delete your own account" });
    return;
  }

  if (isPlatformAdmin(staff.email)) {
    res.status(403).json({ message: "Platform admin account cannot be deleted" });
    return;
  }

  try {
    await staff.destroy();
    res.json({ message: "Staff member deleted successfully", action: "deleted" });
  } catch (err: any) {
    // If foreign key constraint prevents deletion (leads, logs, blogs created), deactivate instead
    await staff.update({ status: "inactive" });
    res.json({
      message: "Staff member has existing linked records and was deactivated instead of permanently deleted",
      action: "deactivated",
    });
  }
});

export default router;
