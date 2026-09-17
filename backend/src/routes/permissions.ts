import { Router, Response } from "express";
import { Permission } from "../models";
import { authenticate, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: List all catalog permissions
 *     tags: [Admin - Permissions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions sorted by resource and action
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   resource:
 *                     type: string
 *                   action:
 *                     type: string
 *                   description:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/", async (_req: AuthRequest, res: Response) => {
  const permissions = await Permission.findAll({ order: [["resource", "ASC"], ["action", "ASC"]] });
  res.json(permissions);
});

export default router;
