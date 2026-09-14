import { Router, Response } from "express";
import { Op } from "sequelize";
import { Job, JobApplication, User } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

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

// Get single job details
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

// Create job opening
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

// Update job opening
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

// Delete job opening
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

// List all applications with filtering & search
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

// Update application status & admin notes
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

// Delete an application
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

      await application.destroy();
      res.json({ message: "Application deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to delete application" });
    }
  }
);

export default router;
