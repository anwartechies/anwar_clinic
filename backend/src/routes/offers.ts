import { Router, Response } from "express";
import { Op } from "sequelize";
import crypto from "crypto";
import { Offer, User } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";
import { OfferStatus, OfferTimelineEvent } from "../models/Offer";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /offers:
 *   get:
 *     summary: List all banner offers (active, draft, completed)
 *     tags: [Admin - Offers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of offers sorted with active first
 */
router.get("/", authorize("offers:read"), async (_req: AuthRequest, res: Response) => {
  try {
    const offers = await Offer.findAll({
      order: [
        ["status", "ASC"], // active first if alphabetical or custom sort below
        ["createdAt", "DESC"],
      ],
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    // Custom sorting: active first, then draft, then completed
    const statusPriority: Record<OfferStatus, number> = {
      active: 0,
      draft: 1,
      completed: 2,
    };
    const sorted = [...offers].sort((a, b) => {
      const pA = statusPriority[a.status] ?? 3;
      const pB = statusPriority[b.status] ?? 3;
      if (pA !== pB) return pA - pB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json(sorted);
  } catch (err: any) {
    console.error("Failed to list offers:", err);
    res.status(500).json({ message: err.message || "Failed to list offers" });
  }
});

/**
 * @swagger
 * /offers/{id}:
 *   get:
 *     summary: Get single offer details with creator info
 *     tags: [Admin - Offers]
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
 *         description: Offer details
 *       404:
 *         description: Offer not found
 */
router.get("/:id", authorize("offers:read"), async (req: AuthRequest, res: Response) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    res.json(offer);
  } catch (err: any) {
    console.error("Failed to fetch offer:", err);
    res.status(500).json({ message: err.message || "Failed to fetch offer" });
  }
});

/**
 * @swagger
 * /offers:
 *   post:
 *     summary: Create a new promotional banner offer
 *     tags: [Admin - Offers]
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
 *               badge:
 *                 type: string
 *                 default: "Special Offer"
 *               title:
 *                 type: string
 *               highlightText:
 *                 type: string
 *               perks:
 *                 type: array
 *                 items:
 *                   type: string
 *               couponCode:
 *                 type: string
 *               ctaText:
 *                 type: string
 *                 default: "Claim Consultation"
 *               link:
 *                 type: string
 *                 default: "/offer"
 *               status:
 *                 type: string
 *                 enum: [draft, active]
 *     responses:
 *       201:
 *         description: Offer created
 *       400:
 *         description: Validation error or another offer is already active
 */
router.post("/", authorize("offers:write"), async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.title || !body.title.trim()) {
      res.status(400).json({ message: "Offer title is required" });
      return;
    }

    const targetStatus: OfferStatus = body.status === "active" ? "active" : "draft";

    // If attempting to create directly as active, check if another offer is already active
    if (targetStatus === "active") {
      const currentActive = await Offer.findOne({ where: { status: "active" } });
      if (currentActive) {
        res.status(400).json({
          message: `Another offer "${currentActive.title}" is currently active. You cannot activate multiple offers at the same time. Please mark the currently active offer as completed first.`,
          activeOffer: { id: currentActive.id, title: currentActive.title },
        });
        return;
      }
    }

    const initialEvent: OfferTimelineEvent = {
      id: crypto.randomUUID(),
      status: targetStatus,
      timestamp: new Date().toISOString(),
      userId: req.user?.userId || null,
      userName: req.user?.fullName || "Admin",
      note: targetStatus === "active" ? "Offer created and activated" : "Offer created as draft",
    };

    const offer = await Offer.create({
      badge: body.badge?.trim() || "Special Offer",
      title: body.title.trim(),
      highlightText: body.highlightText?.trim() || null,
      perks: Array.isArray(body.perks)
        ? body.perks.map((p: any) => String(p).trim()).filter(Boolean)
        : [],
      couponCode: body.couponCode?.trim() || null,
      ctaText: body.ctaText?.trim() || "Claim Consultation",
      link: body.link?.trim() || "/offer",
      status: targetStatus,
      activatedAt: targetStatus === "active" ? new Date() : null,
      completedAt: null,
      timeline: [initialEvent],
      createdById: req.user?.userId || null,
    });

    const created = await Offer.findByPk(offer.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error("Failed to create offer:", err);
    res.status(500).json({ message: err.message || "Failed to create offer" });
  }
});

/**
 * @swagger
 * /offers/{id}:
 *   put:
 *     summary: Update offer details or transition status (draft -> active -> completed)
 *     tags: [Admin - Offers]
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
 *               badge:
 *                 type: string
 *               highlightText:
 *                 type: string
 *               perks:
 *                 type: array
 *                 items:
 *                   type: string
 *               couponCode:
 *                 type: string
 *               ctaText:
 *                 type: string
 *               link:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed]
 *               statusNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offer updated
 *       400:
 *         description: Cannot modify completed offer or multiple active offers collision
 *       404:
 *         description: Offer not found
 */
router.put("/:id", authorize("offers:write"), async (req: AuthRequest, res: Response) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    // IMMUTABILITY RULE: once an offer is completed, it cannot be modified or reactivated
    if (offer.status === "completed") {
      res.status(400).json({
        message: "Completed offers are finalized and cannot be modified or re-activated.",
      });
      return;
    }

    const body = req.body || {};
    const newStatus: OfferStatus | undefined = body.status;
    const isStatusChange = newStatus && newStatus !== offer.status;

    let activatedAt = offer.activatedAt;
    let completedAt = offer.completedAt;
    const currentTimeline: OfferTimelineEvent[] = Array.isArray(offer.timeline)
      ? [...offer.timeline]
      : [];

    if (isStatusChange) {
      if (newStatus === "active") {
        // Enforce single active offer: check if another offer is already active
        const existingActive = await Offer.findOne({
          where: {
            status: "active",
            id: { [Op.ne]: offer.id },
          },
        });

        if (existingActive) {
          res.status(400).json({
            message: `Another offer "${existingActive.title}" is currently active. You cannot activate multiple offers at the same time. Please mark the currently active offer as completed first.`,
            activeOffer: { id: existingActive.id, title: existingActive.title },
          });
          return;
        }

        activatedAt = new Date();
        currentTimeline.push({
          id: crypto.randomUUID(),
          status: "active",
          timestamp: new Date().toISOString(),
          userId: req.user?.userId || null,
          userName: req.user?.fullName || "Admin",
          note: body.statusNote || "Offer activated",
        });
      } else if (newStatus === "completed") {
        completedAt = new Date();
        currentTimeline.push({
          id: crypto.randomUUID(),
          status: "completed",
          timestamp: new Date().toISOString(),
          userId: req.user?.userId || null,
          userName: req.user?.fullName || "Admin",
          note: body.statusNote || "Offer marked as completed",
        });
      } else if (newStatus === "draft") {
        currentTimeline.push({
          id: crypto.randomUUID(),
          status: "draft",
          timestamp: new Date().toISOString(),
          userId: req.user?.userId || null,
          userName: req.user?.fullName || "Admin",
          note: body.statusNote || "Offer moved back to draft",
        });
      }
    }

    await offer.update({
      badge: body.badge !== undefined ? body.badge?.trim() || "Special Offer" : offer.badge,
      title: body.title !== undefined ? body.title?.trim() || offer.title : offer.title,
      highlightText:
        body.highlightText !== undefined ? body.highlightText?.trim() || null : offer.highlightText,
      perks: Array.isArray(body.perks)
        ? body.perks.map((p: any) => String(p).trim()).filter(Boolean)
        : offer.perks,
      couponCode:
        body.couponCode !== undefined ? body.couponCode?.trim() || null : offer.couponCode,
      ctaText: body.ctaText !== undefined ? body.ctaText?.trim() || offer.ctaText : offer.ctaText,
      link: body.link !== undefined ? body.link?.trim() || "/offer" : offer.link,
      status: isStatusChange ? newStatus : offer.status,
      activatedAt,
      completedAt,
      timeline: currentTimeline,
    });

    const updated = await Offer.findByPk(offer.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    res.json(updated);
  } catch (err: any) {
    console.error("Failed to update offer:", err);
    res.status(500).json({ message: err.message || "Failed to update offer" });
  }
});

/**
 * @swagger
 * /offers/{id}:
 *   delete:
 *     summary: Delete an offer (only draft or completed offers can be deleted)
 *     tags: [Admin - Offers]
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
 *         description: Offer deleted
 *       400:
 *         description: Active offers cannot be deleted while live
 *       404:
 *         description: Offer not found
 */
router.delete("/:id", authorize("offers:write"), async (req: AuthRequest, res: Response) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    if (offer.status === "active") {
      res.status(400).json({
        message: "Active offers cannot be deleted while live. Please complete it first.",
      });
      return;
    }

    await offer.destroy();
    res.json({ message: "Offer deleted successfully" });
  } catch (err: any) {
    console.error("Failed to delete offer:", err);
    res.status(500).json({ message: err.message || "Failed to delete offer" });
  }
});

export default router;
