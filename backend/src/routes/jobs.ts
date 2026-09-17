import { Router, Response } from "express";
import { Op } from "sequelize";
import { Job, JobApplication, User } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";
import { storage } from "../services/storage";

const router = Router();
router.use(authenticate);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// 1. Job Openings CRUD
// ---------------------------------------------------------------------------

// List all jobs (for admin table)
/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: List all job openings with applicant counts
 *     tags: [Admin - Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of jobs with applicant counts
 */
router.get("/", authorize("careers:read"), async (req: AuthRequest, res: Response) => {
  try {
    const { status, department, search } = req.query;
    const where: any = {};

    if (status && typeof status === "string") {
      where.status = status;
    }
    if (department && typeof department === "string") {
      where.department = department;
    }
    if (search && typeof search === "string") {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const jobs = await Job.findAll({
      where,
      include: [
        {
          model: JobApplication,
          as: "applications",
          attributes: ["id", "status"],
        },
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
      order: [
        ["sortOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    const result = jobs.map((j) => {
      const plain = j.toJSON() as any;
      const applications = plain.applications || [];
      return {
        ...plain,
        applicantCount: applications.length,
        newApplicantCount: applications.filter((a: any) => a.status === "new").length,
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch jobs" });
  }
});

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get single job opening with attached applications
 *     tags: [Admin - Jobs]
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
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get("/:id", authorize("careers:read"), async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: JobApplication,
          as: "applications",
          order: [["createdAt", "DESC"]],
        },
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if (!job) {
      res.status(404).json({ message: "Job opening not found" });
      return;
    }

    res.json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch job" });
  }
});

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job opening
 *     tags: [Admin - Jobs]
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
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               location:
 *                 type: string
 *               employmentType:
 *                 type: string
 *               experience:
 *                 type: string
 *               salaryRange:
 *                 type: string
 *               openings:
 *                 type: integer
 *               description:
 *                 type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, closed]
 *     responses:
 *       201:
 *         description: Job opening created
 *       400:
 *         description: Missing required fields
 */
router.post("/", authorize("careers:write"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      department,
      location,
      employmentType,
      experience,
      salaryRange,
      openings,
      description,
      responsibilities,
      requirements,
      benefits,
      status,
      sortOrder,
    } = req.body;

    if (!title || !description) {
      res.status(400).json({ message: "Job title and description are required" });
      return;
    }

    let baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Job.findOne({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const job = await Job.create({
      title,
      slug: finalSlug,
      department: department || "Medical / Surgical",
      location: location || "Patna Clinic (Razabazar)",
      employmentType: employmentType || "Full-time",
      experience: experience || "1-3 Years",
      salaryRange: salaryRange || null,
      openings: typeof openings === "number" ? openings : 1,
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      status: status || "published",
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      createdById: req.user?.userId || null,
    });

    res.status(201).json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to create job" });
  }
});

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: Update an existing job opening
 *     tags: [Admin - Jobs]
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
 *               department:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, closed]
 *     responses:
 *       200:
 *         description: Job updated
 *       404:
 *         description: Job not found
 */
router.put("/:id", authorize("careers:write"), async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      res.status(404).json({ message: "Job opening not found" });
      return;
    }

    const {
      title,
      department,
      location,
      employmentType,
      experience,
      salaryRange,
      openings,
      description,
      responsibilities,
      requirements,
      benefits,
      status,
      sortOrder,
    } = req.body;

    await job.update({
      ...(title !== undefined ? { title } : {}),
      ...(department !== undefined ? { department } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(employmentType !== undefined ? { employmentType } : {}),
      ...(experience !== undefined ? { experience } : {}),
      ...(salaryRange !== undefined ? { salaryRange } : {}),
      ...(openings !== undefined ? { openings: Number(openings) } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(responsibilities !== undefined ? { responsibilities } : {}),
      ...(requirements !== undefined ? { requirements } : {}),
      ...(benefits !== undefined ? { benefits } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
    });

    res.json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update job" });
  }
});

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job opening
 *     tags: [Admin - Jobs]
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
 *         description: Job deleted
 *       404:
 *         description: Job not found
 */
router.delete("/:id", authorize("careers:write"), async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      res.status(404).json({ message: "Job opening not found" });
      return;
    }

    await job.destroy();
    res.json({ message: "Job opening deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to delete job" });
  }
});

// ---------------------------------------------------------------------------
// 2. Candidate Applications Management
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /jobs/admin/applications:
 *   get:
 *     summary: List candidate job applications with filtering
 *     tags: [Admin - Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, reviewing, shortlisted, interviewed, hired, rejected]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get("/admin/applications", authorize("careers:read"), async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, status, search } = req.query;
    const where: any = {};

    if (jobId && typeof jobId === "string") {
      where.jobId = jobId;
    }
    if (status && typeof status === "string") {
      where.status = status;
    }
    if (search && typeof search === "string") {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const applications = await JobApplication.findAll({
      where,
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "slug", "department", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(applications);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch applications" });
  }
});

/**
 * @swagger
 * /jobs/admin/applications/{id}/resume:
 *   get:
 *     summary: Stream private resume file for an applicant
 *     tags: [Admin - Jobs]
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
 *         description: Resume file stream
 *       404:
 *         description: Application or resume not found
 */
router.get(
  "/admin/applications/:id/resume",
  authorize("careers:read"),
  async (req: AuthRequest, res: Response) => {
    try {
      const application = await JobApplication.findByPk(req.params.id);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      if (!application.resumeKey) {
        // Only applications saved before CVs became private have a URL instead.
        if (application.resumeUrl) {
          res.redirect(application.resumeUrl);
          return;
        }
        res.status(404).json({ message: "No resume on file" });
        return;
      }

      const file = await storage.getPrivate(application.resumeKey);
      const safeName = (application.resumeFileName || "resume").replace(/[^\w.\- ]+/g, "_");
      res.setHeader("Content-Type", file.contentType || "application/octet-stream");
      if (file.contentLength) res.setHeader("Content-Length", String(file.contentLength));
      res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      file.body.on("error", () => res.destroy());
      file.body.pipe(res);
    } catch (err: any) {
      console.error("[Careers] Resume read failed:", err?.message);
      res.status(500).json({ message: "Could not load the resume" });
    }
  }
);

/**
 * @swagger
 * /jobs/admin/applications/{id}/status:
 *   patch:
 *     summary: Update candidate application review status & notes
 *     tags: [Admin - Jobs]
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
 *                 enum: [new, reviewing, shortlisted, interviewed, hired, rejected]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Application not found
 */
router.patch(
  "/admin/applications/:id/status",
  authorize("careers:write"),
  async (req: AuthRequest, res: Response) => {
    try {
      const application = await JobApplication.findByPk(req.params.id);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      const { status, adminNotes } = req.body;
      await application.update({
        ...(status !== undefined ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      });

      res.json(application);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to update application status" });
    }
  }
);

/**
 * @swagger
 * /jobs/admin/applications/{id}:
 *   delete:
 *     summary: Delete a job application and its private resume
 *     tags: [Admin - Jobs]
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
 *         description: Application deleted
 *       404:
 *         description: Application not found
 */
router.delete(
  "/admin/applications/:id",
  authorize("careers:write"),
  async (req: AuthRequest, res: Response) => {
    try {
      const application = await JobApplication.findByPk(req.params.id);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      const resumeKey = application.resumeKey;
      await application.destroy();
      // Deleting an applicant removes their CV too, not just the database row.
      if (resumeKey) {
        await storage.removePrivate(resumeKey).catch((err) =>
          console.warn(`[Careers] Could not remove resume ${resumeKey}: ${err.message}`)
        );
      }
      res.json({ message: "Application deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to delete application" });
    }
  }
);

export default router;
