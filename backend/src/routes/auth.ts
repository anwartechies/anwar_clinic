import { Router, Request, Response } from "express";
import { isPlatformAdmin } from "../config/platform";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role, Permission } from "../models";
import { env } from "../config/env";
import { authenticate, AuthRequest } from "../middleware/authenticate";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user & get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@anwarclinic.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 roleSlug:
 *                   type: string
 *                 roleName:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({
    where: { email: String(email).trim().toLowerCase(), status: "active" },
    include: [{ model: Role, as: "role", include: [{ model: Permission }] }],
  });

  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const role = (user as any).role as Role & { Permissions: Permission[] };
  const permissions = (role.Permissions || []).map((p: any) => `${p.resource}:${p.action}`);

  // roleSlug and permissions ride along in the token so the Next.js proxy can
  // route /:role/* without a round-trip; the server never trusts these claims
  // for authorization — authenticate() re-reads them from the DB every request.
  const token = jwt.sign(
    {
      userId: user.id,
      roleSlug: role.slug,
      permissions,
      fullName: user.fullName,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
  );

  await user.update({ lastLoginAt: new Date() });

  res.json({
    token,
    roleSlug: role.slug,
    roleName: role.name,
    permissions,
    fullName: user.fullName,
    email: user.email,
    isPlatformAdmin: isPlatformAdmin(user.email),
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Invalidate user session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out" });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile & permissions
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile with live permissions
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: User not found
 */
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(req.user!.userId, {
    include: [{ model: Role, as: "role" }],
    attributes: { exclude: ["passwordHash"] },
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  // permissions/roleSlug come from the middleware's live DB lookup (not the
  // frozen JWT claim) — this is what the client polls to stay in sync without
  // requiring a re-login after a permission or role change.
  res.json({
    ...user.toJSON(),
    permissions: req.user!.permissions,
    roleSlug: req.user!.roleSlug,
    isPlatformAdmin: req.user!.isPlatformAdmin,
  });
});

export default router;
