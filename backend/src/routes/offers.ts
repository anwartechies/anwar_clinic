import { Router, Response } from "express";
import { Op } from "sequelize";
import crypto from "crypto";
import { Offer, User } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";
import { OfferStatus, OfferTimelineEvent } from "../models/Offer";

const router = Router();

router.use(authenticate);

// GET /offers — list all offers (draft, active, completed)
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

// GET /offers/:id — single offer with details
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

// POST /offers — create a new offer
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

// PUT /offers/:id — update offer details and status
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

// DELETE /offers/:id — delete an offer (only allowed for drafts or completed, never active)
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
