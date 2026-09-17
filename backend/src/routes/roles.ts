import { Router, Response } from "express";
import { Role, Permission, User } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

// Readable by any signed-in user: the admin panel needs the role list to
// resolve a previewed role's permissions and to render the roles matrix.
/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List all roles with attached permissions and user counts
 *     tags: [Admin - Roles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 */
router.get("/", async (_req: AuthRequest, res: Response) => {
  const roles = await Role.findAll({ include: [Permission], order: [["createdAt", "ASC"]] });
  const counts = (await User.count({ group: ["roleId"] })) as unknown as {
    roleId: string;
    count: number;
  }[];
  const countMap = new Map(counts.map((c) => [c.roleId, Number(c.count)]));
  const withCounts = roles.map((role) => ({
    ...role.toJSON(),
    usersCount: countMap.get(role.id) ?? 0,
  }));
  res.json(withCounts);
});

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new custom role
 *     tags: [Admin - Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: Content Editor
 *               slug:
 *                 type: string
 *                 example: content-editor
 *               description:
 *                 type: string
 *                 example: Can manage blogs, products, and services
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid input or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - missing settings:write permission
 */
router.post("/", authorize("settings:write"), async (req: AuthRequest, res: Response) => {
  const { name, slug, description } = req.body;
  if (!name || !slug) {
    res.status(400).json({ message: "name and slug are required" });
    return;
  }
  const normalizedSlug = String(slug).trim().toLowerCase();
  // The slug becomes a URL segment (/:role/dashboard), so keep it URL-safe.
  if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
    res.status(400).json({ message: "slug may only contain lowercase letters, numbers and hyphens" });
    return;
  }
  const existing = await Role.findOne({ where: { slug: normalizedSlug } });
  if (existing) {
    res.status(400).json({ message: "A role with this slug already exists." });
    return;
  }
  const role = await Role.create({ name, slug: normalizedSlug, description: description ?? null });
  const created = await Role.findByPk(role.id, { include: [Permission] });
  res.status(201).json(created);
});

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update role details
 *     tags: [Admin - Roles]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Cannot rename superadmin
 *       404:
 *         description: Role not found
 */
router.put("/:id", authorize("settings:write"), async (req: AuthRequest, res: Response) => {
  const role = await Role.findByPk(req.params.id);
  if (!role) {
    res.status(404).json({ message: "Role not found" });
    return;
  }
  if (role.slug === "superadmin") {
    res.status(400).json({ message: "The Super Admin role cannot be renamed." });
    return;
  }
  const { name, description } = req.body;
  await role.update({
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
  });
  const updated = await Role.findByPk(role.id, { include: [Permission] });
  res.json(updated);
});

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Admin - Roles]
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
 *         description: Role deleted
 *       400:
 *         description: Cannot delete superadmin or role with assigned users
 *       404:
 *         description: Role not found
 */
router.delete("/:id", authorize("settings:write"), async (req: AuthRequest, res: Response) => {
  const role = await Role.findByPk(req.params.id);
  if (!role) {
    res.status(404).json({ message: "Role not found" });
    return;
  }
  if (role.slug === "superadmin") {
    res.status(400).json({ message: "The Super Admin role cannot be deleted." });
    return;
  }
  const memberCount = await User.count({ where: { roleId: role.id } });
  if (memberCount > 0) {
    res.status(400).json({
      message: `${memberCount} member(s) still have this role. Reassign them first.`,
    });
    return;
  }
  await role.destroy();
  res.json({ message: "Role deleted" });
});

// Replace a role's permission set — this is the whole dynamic-RBAC write path.
/**
 * @swagger
 * /roles/{id}/permissions:
 *   put:
 *     summary: Update assigned permissions for a role
 *     tags: [Admin - Roles]
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
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissions successfully updated
 *       400:
 *         description: Super Admin permissions cannot be modified
 *       404:
 *         description: Role not found
 */
router.put("/:id/permissions", authorize("settings:write"), async (req: AuthRequest, res: Response) => {
  const role = await Role.findByPk(req.params.id);
  if (!role) {
    res.status(404).json({ message: "Role not found" });
    return;
  }
  if (role.slug === "superadmin") {
    res.status(400).json({ message: "Super Admin always has every permission and cannot be edited." });
    return;
  }
  const { permissionIds } = req.body as { permissionIds: string[] };
  if (!Array.isArray(permissionIds)) {
    res.status(400).json({ message: "permissionIds must be an array" });
    return;
  }
  await (role as any).setPermissions(permissionIds);
  const updated = await Role.findByPk(req.params.id, { include: [Permission] });
  res.json(updated);
});

export default router;
