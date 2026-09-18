import { Router, Response } from "express";
import { Op, fn, col } from "sequelize";
import { Lead, User } from "../models";
import { LEAD_STATUSES, LEAD_SOURCES, LeadStatus } from "../models/Lead";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

// Owner is joined on every read so the table can show "assigned to" without
// a second round trip per row.
const ASSIGNEE_INCLUDE = [
  { model: User, as: "assignedTo", attributes: ["id", "fullName", "email"] },
];

/**
 * @swagger
 * /leads/stats:
 *   get:
 *     summary: Get lead counts grouped by status
 *     tags: [Admin - Leads]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Total leads and counts per status
 */
router.get("/stats", authorize("leads:read"), async (_req: AuthRequest, res: Response) => {
  const rows = (await Lead.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true,
  })) as unknown as { status: LeadStatus; count: string }[];

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const row of rows) byStatus[row.status] = Number(row.count);

  res.json({ total: Object.values(byStatus).reduce((a, b) => a + b, 0), byStatus });
});

/**
 * @swagger
 * /leads/assignees:
 *   get:
 *     summary: List active staff members available for lead assignment
 *     tags: [Admin - Leads]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active users
 */
router.get("/assignees", authorize("leads:write"), async (_req: AuthRequest, res: Response) => {
  const users = await User.findAll({
    where: { status: "active" },
    attributes: ["id", "fullName", "email"],
    order: [["fullName", "ASC"]],
  });
  res.json(users);
});

/**
 * @swagger
 * /leads:
 *   get:
 *     summary: List leads with pagination, filtering & search
 *     tags: [Admin - Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *     responses:
 *       200:
 *         description: Paginated leads array with totals
 */
router.get("/", authorize("leads:read"), async (req: AuthRequest, res: Response) => {
  const { status, source, search } = req.query as Record<string, string | undefined>;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "25"), 10) || 25));

  const where: Record<string, unknown> = {};
  if (status && LEAD_STATUSES.includes(status as LeadStatus)) where.status = status;
  if (source && (LEAD_SOURCES as string[]).includes(source)) where.source = source;
  if (search?.trim()) {
    // iLike is Postgres-only, which is what this project runs on (see config/database.ts).
    const term = `%${search.trim()}%`;
    where[Op.or as unknown as string] = [
      { fullName: { [Op.iLike]: term } },
      { phone: { [Op.iLike]: term } },
      { email: { [Op.iLike]: term } },
      { city: { [Op.iLike]: term } },
    ];
  }

  const { rows, count } = await Lead.findAndCountAll({
    where,
    include: ASSIGNEE_INCLUDE,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  res.json({ leads: rows, total: count, page, limit, pages: Math.ceil(count / limit) || 1 });
});

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     summary: Get single lead details by ID
 *     tags: [Admin - Leads]
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
 *         description: Lead object
 *       404:
 *         description: Lead not found
 */
router.get("/:id", authorize("leads:read"), async (req: AuthRequest, res: Response) => {
  const lead = await Lead.findByPk(req.params.id, { include: ASSIGNEE_INCLUDE });
  if (!lead) {
    res.status(404).json({ message: "Lead not found" });
    return;
  }
  res.json(lead);
});

// Manual entry — for a walk-in or a phone enquiry typed in by reception.
/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Manually create a new lead (walk-in or phone call)
 *     tags: [Admin - Leads]
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
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               countryCode:
 *                 type: string
 *                 default: "+91"
 *               email:
 *                 type: string
 *               city:
 *                 type: string
 *               branch:
 *                 type: string
 *               message:
 *                 type: string
 *               whatsappOptIn:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [new, contacted, consultation_scheduled, won, lost]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created
 *       400:
 *         description: Validation error
 */
router.post("/", authorize("leads:write"), async (req: AuthRequest, res: Response) => {
  const { fullName, phone } = req.body;
  if (!String(fullName ?? "").trim() || !String(phone ?? "").trim()) {
    res.status(400).json({ message: "fullName and phone are required" });
    return;
  }

  const lead = await Lead.create({
    fullName: String(fullName).trim(),
    countryCode: String(req.body.countryCode ?? "+91").trim(),
    phone: String(phone).trim(),
    email: req.body.email?.trim() || null,
    city: req.body.city?.trim() || null,
    branch: req.body.branch?.trim() || null,
    message: req.body.message?.trim() || null,
    whatsappOptIn: Boolean(req.body.whatsappOptIn),
    source: "manual",
    status: LEAD_STATUSES.includes(req.body.status) ? req.body.status : "new",
    notes: req.body.notes?.trim() || null,
  });

  res.status(201).json(lead);
});

/**
 * @swagger
 * /leads/{id}:
 *   put:
 *     summary: Update lead status, notes, assignment or contact details
 *     tags: [Admin - Leads]
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
 *               status:
 *                 type: string
 *                 enum: [new, contacted, consultation_scheduled, won, lost]
 *               notes:
 *                 type: string
 *               assignedToId:
 *                 type: string
 *               branch:
 *                 type: string
 *               city:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead updated
 *       400:
 *         description: Invalid status or assignedToId
 *       404:
 *         description: Lead not found
 */
router.put("/:id", authorize("leads:write"), async (req: AuthRequest, res: Response) => {
  const lead = await Lead.findByPk(req.params.id);
  if (!lead) {
    res.status(404).json({ message: "Lead not found" });
    return;
  }

  const update: Record<string, unknown> = {};
  // The enquiry itself is what the visitor typed — only the follow-up fields
  // below are editable, so a lead can't be quietly rewritten after the fact.
  for (const key of ["notes", "branch", "city", "email"]) {
    if (req.body[key] !== undefined) update[key] = req.body[key] || null;
  }
  if (req.body.status !== undefined) {
    if (!LEAD_STATUSES.includes(req.body.status)) {
      res.status(400).json({ message: `status must be one of: ${LEAD_STATUSES.join(", ")}` });
      return;
    }
    update.status = req.body.status;
  }
  if (req.body.assignedToId !== undefined) {
    const assignedToId = req.body.assignedToId || null;
    if (assignedToId && !(await User.findByPk(assignedToId))) {
      res.status(400).json({ message: "assignedToId does not match a user" });
      return;
    }
    update.assignedToId = assignedToId;
  }

  await lead.update(update);
  const fresh = await Lead.findByPk(lead.id, { include: ASSIGNEE_INCLUDE });
  res.json(fresh);
});

/**
 * @swagger
 * /leads/{id}:
 *   delete:
 *     summary: Delete a lead
 *     tags: [Admin - Leads]
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
 *         description: Lead deleted
 *       404:
 *         description: Lead not found
 */
router.delete("/:id", authorize("leads:write"), async (req: AuthRequest, res: Response) => {
  const lead = await Lead.findByPk(req.params.id);
  if (!lead) {
    res.status(404).json({ message: "Lead not found" });
    return;
  }
  await lead.destroy();
  res.json({ message: "Lead deleted" });
});

export default router;
