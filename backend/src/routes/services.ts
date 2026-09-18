import { Router, Response } from "express";
import { Op } from "sequelize";
import { Service } from "../models";
import { SERVICE_SECTIONS, isKnownSection } from "../config/serviceSections";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

// The admin panel builds every section form from this — see config/serviceSections.ts.
/**
 * @swagger
 * /services/schema:
 *   get:
 *     summary: Get dynamic section schemas for building admin service forms
 *     tags: [Admin - Services]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of section form schemas
 */
router.get("/schema", authorize("services:read"), (_req: AuthRequest, res: Response) => {
  res.json(SERVICE_SECTIONS);
});

/**
 * @swagger
 * /services:
 *   get:
 *     summary: List all services (card fields only)
 *     tags: [Admin - Services]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all services
 */
router.get("/", authorize("services:read"), async (_req: AuthRequest, res: Response) => {
  const services = await Service.findAll({
    order: [["sortOrder", "ASC"], ["createdAt", "ASC"]],
    // The sections blob can be large; the list view doesn't need it.
    attributes: { exclude: ["sections"] },
  });
  res.json(services);
});

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get single service by ID with full content sections
 *     tags: [Admin - Services]
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
 *         description: Complete service record
 *       404:
 *         description: Service not found
 */
router.get("/:id", authorize("services:read"), async (req: AuthRequest, res: Response) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) {
    res.status(404).json({ message: "Service not found" });
    return;
  }
  res.json(service);
});

function normalizeSlug(raw: string) {
  return String(raw).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Unknown keys are dropped rather than stored — keeps the blob aligned with the
// schema so a renamed/removed section can't leave orphaned data behind.
function sanitizeSections(input: unknown): Record<string, Record<string, unknown>> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, Record<string, unknown>> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!isKnownSection(key) || !value || typeof value !== "object") continue;
    const allowed = SERVICE_SECTIONS.find((s) => s.key === key)!.fields.map((f) => f.name);
    const clean: Record<string, unknown> = {};
    for (const [field, v] of Object.entries(value as Record<string, unknown>)) {
      // Empty strings/arrays mean "use the component default", so don't persist them.
      if (!allowed.includes(field)) continue;
      if (v === "" || v === null || v === undefined) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      clean[field] = v;
    }
    if (Object.keys(clean).length > 0) out[key] = clean;
  }
  return out;
}

function sanitizeHidden(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((k): k is string => typeof k === "string" && isKnownSection(k));
}

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Admin - Services]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               cardDescription:
 *                 type: string
 *               cardImage:
 *                 type: string
 *               badge:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               sections:
 *                 type: object
 *               hiddenSections:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Service created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - missing services:write permission
 */
router.post("/", authorize("services:write"), async (req: AuthRequest, res: Response) => {
  const { title, slug, cardDescription, cardImage, badge, status, seoTitle, seoDescription } = req.body;
  if (!title) {
    res.status(400).json({ message: "title is required" });
    return;
  }
  const finalSlug = normalizeSlug(slug || title);
  if (!finalSlug) {
    res.status(400).json({ message: "Could not derive a valid slug — provide one explicitly." });
    return;
  }
  if (await Service.findOne({ where: { slug: finalSlug } })) {
    res.status(400).json({ message: `A service with the slug "${finalSlug}" already exists.` });
    return;
  }

  const max = (await Service.max("sortOrder")) as number | null;
  const service = await Service.create({
    title,
    slug: finalSlug,
    cardDescription: cardDescription ?? "",
    cardImage: cardImage ?? null,
    badge: badge ?? null,
    status: status === "published" ? "published" : "draft",
    seoTitle: seoTitle ?? null,
    seoDescription: seoDescription ?? null,
    sortOrder: (typeof max === "number" ? max : 0) + 1,
    sections: sanitizeSections(req.body.sections),
    hiddenSections: sanitizeHidden(req.body.hiddenSections),
  });
  res.status(201).json(service);
});

/**
 * @swagger
 * /services/reorder:
 *   put:
 *     summary: Bulk update sort order for services
 *     tags: [Admin - Services]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderedIds
 *             properties:
 *               orderedIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Order updated
 */
router.put("/reorder", authorize("services:write"), async (req: AuthRequest, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ message: "orderedIds must be an array" });
    return;
  }
  await Promise.all(
    orderedIds.map((id, index) => Service.update({ sortOrder: index }, { where: { id } }))
  );
  res.json({ message: "Order updated" });
});

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update an existing service and its sections
 *     tags: [Admin - Services]
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
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               cardDescription:
 *                 type: string
 *               cardImage:
 *                 type: string
 *               badge:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               sections:
 *                 type: object
 *               hiddenSections:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Service updated
 *       404:
 *         description: Service not found
 */
router.put("/:id", authorize("services:write"), async (req: AuthRequest, res: Response) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  const update: Record<string, unknown> = {};
  for (const key of ["title", "cardDescription", "cardImage", "badge", "seoTitle", "seoDescription"]) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  if (req.body.status !== undefined) {
    update.status = req.body.status === "published" ? "published" : "draft";
  }
  if (req.body.slug !== undefined) {
    const finalSlug = normalizeSlug(req.body.slug);
    if (!finalSlug) {
      res.status(400).json({ message: "Slug cannot be empty." });
      return;
    }
    const clash = await Service.findOne({
      where: { slug: finalSlug, id: { [Op.ne]: service.id } },
    });
    if (clash) {
      res.status(400).json({ message: `A service with the slug "${finalSlug}" already exists.` });
      return;
    }
    update.slug = finalSlug;
  }
  if (req.body.sections !== undefined) update.sections = sanitizeSections(req.body.sections);
  if (req.body.hiddenSections !== undefined) {
    update.hiddenSections = sanitizeHidden(req.body.hiddenSections);
  }

  await service.update(update);
  res.json(service);
});

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Admin - Services]
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
 *         description: Service deleted
 *       404:
 *         description: Service not found
 */
router.delete("/:id", authorize("services:write"), async (req: AuthRequest, res: Response) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) {
    res.status(404).json({ message: "Service not found" });
    return;
  }
  await service.destroy();
  res.json({ message: "Service deleted" });
});

export default router;
