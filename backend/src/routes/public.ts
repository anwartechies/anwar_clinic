import { Router, Request, Response } from "express";
import { Op } from "sequelize";
import multer from "multer";
import { Service, Lead, Blog, Product, Job, JobApplication } from "../models";
import { LEAD_SOURCES, LeadSource } from "../models/Lead";
import { SEED_SECTIONS_BY_SLUG } from "../config/serviceSeedData";
import { getGoogleReviews } from "../services/googleReviews";
import { storage } from "../services/storage";

// Open, credential-less API consumed by the landing page and ecommerce at build/revalidate
// time. Draft items are never exposed here.
const router = Router();

const PUBLIC_ATTRS = [
  "slug", "title", "cardDescription", "cardImage", "badge",
  "sortOrder", "seoTitle", "seoDescription", "sections", "hiddenSections",
] as const;

router.get("/services", async (_req: Request, res: Response) => {
  const services = await Service.findAll({
    where: { status: "published" },
    order: [["sortOrder", "ASC"], ["createdAt", "ASC"]],
    // Card data only — keeps the listing payload small.
    attributes: ["slug", "title", "cardDescription", "cardImage", "badge", "sortOrder"],
  });
  res.json(services);
});

router.get("/services/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const service = await Service.findOne({
    where: { slug, status: "published" },
    attributes: PUBLIC_ATTRS as unknown as string[],
  });
  if (!service) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  // If seed data has richer sections than DB, update DB automatically
  if (SEED_SECTIONS_BY_SLUG[slug]) {
    const seedSections = SEED_SECTIONS_BY_SLUG[slug];
    const currentSections = (service.sections as Record<string, any>) || {};
    const needsUpdate = Object.keys(seedSections).some(
      (k) => !currentSections[k] || Object.keys(currentSections[k] || {}).length === 0
    );
    if (needsUpdate) {
      await Service.update(
        {
          sections: {
            ...currentSections,
            ...seedSections,
          },
        },
        { where: { slug } }
      );
      const updated = await Service.findOne({
        where: { slug, status: "published" },
        attributes: PUBLIC_ATTRS as unknown as string[],
      });
      res.json(updated);
      return;
    }
  }

  res.json(service);
});

/* ----------------------------- PUBLIC BLOGS ----------------------------- */

const PUBLIC_BLOG_LIST_FIELDS = [
  "id", "slug", "title", "excerpt", "category", "tags",
  "authorName", "authorRole", "authorAvatar", "coverImage",
  "readTime", "publishedAt", "featured",
] as const;

const PUBLIC_BLOG_DETAIL_FIELDS = [
  ...PUBLIC_BLOG_LIST_FIELDS,
  "content", "contentBlocks", "faqs", "metaTitle", "metaDescription", "views",
] as const;

// GET /public/blogs — published blogs for landing page
router.get("/blogs", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const where: any = { status: "published" };

    if (category && typeof category === "string" && category.trim() && category.trim().toLowerCase() !== "all") {
      where.category = { [Op.iLike]: category.trim() };
    }
    if (search && typeof search === "string" && search.trim()) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { excerpt: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const blogs = await Blog.findAll({
      where,
      attributes: PUBLIC_BLOG_LIST_FIELDS as unknown as string[],
      order: [
        ["featured", "DESC"],
        ["publishedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json(blogs);
  } catch (err: any) {
    console.error("Failed to fetch public blogs:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

// GET /public/blogs/:slug — single published blog + related posts
router.get("/blogs/:slug", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({
      where: { slug: req.params.slug, status: "published" },
      attributes: PUBLIC_BLOG_DETAIL_FIELDS as unknown as string[],
    });
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    // Increment views in background
    Blog.increment("views", { where: { id: blog.id } }).catch(() => {});

    // Fetch related blogs (same category or recent, excluding this blog)
    const related = await Blog.findAll({
      where: {
        status: "published",
        id: { [Op.ne]: blog.id },
        ...(blog.category ? { category: blog.category } : {}),
      },
      attributes: PUBLIC_BLOG_LIST_FIELDS as unknown as string[],
      order: [["publishedAt", "DESC"]],
      limit: 3,
    });

    res.json({
      ...blog.toJSON(),
      related,
    });
  } catch (err: any) {
    console.error("Failed to fetch public blog:", err);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Public Ecommerce Products API
// ─────────────────────────────────────────────────────────────────────────────

const PUBLIC_PRODUCT_CARD_ATTRS = [
  "id",
  "slug",
  "name",
  "category",
  "concern",
  "price",
  "originalPrice",
  "isSale",
  "badge",
  "rating",
  "reviewsCount",
  "image",
  "description",
  "inStock",
  "stockQuantity",
  "isKit",
  "sortOrder",
] as const;

// GET /public/products — list all published products
router.get("/products", async (req: Request, res: Response) => {
  try {
    const { category, concern, search, sortBy } = req.query;
    const where: any = { status: "published" };

    if (category && typeof category === "string" && category.trim() && category.trim().toLowerCase() !== "all") {
      where.category = { [Op.iLike]: category.trim() };
    }
    if (concern && typeof concern === "string" && concern.trim() && concern.trim().toLowerCase() !== "all") {
      where.concern = { [Op.iLike]: concern.trim() };
    }
    if (search && typeof search === "string" && search.trim()) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
        { category: { [Op.iLike]: `%${search.trim()}%` } },
        { concern: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    let order: any[] = [["sortOrder", "ASC"], ["createdAt", "ASC"]];
    if (sortBy === "price-low") {
      order = [["price", "ASC"]];
    } else if (sortBy === "price-high") {
      order = [["price", "DESC"]];
    } else if (sortBy === "rating") {
      order = [["rating", "DESC"], ["reviewsCount", "DESC"]];
    }

    const products = await Product.findAll({
      where,
      attributes: PUBLIC_PRODUCT_CARD_ATTRS as unknown as string[],
      order,
    });

    res.json(products);
  } catch (err: any) {
    console.error("Failed to fetch public products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /public/products/:slug — single published product with full sections
router.get("/products/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({
      where: { slug, status: "published" },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Related products in the same category or concern (up to 4 items)
    const related = await Product.findAll({
      where: {
        status: "published",
        id: { [Op.ne]: product.id },
        [Op.or]: [
          { category: product.category },
          { concern: product.concern },
        ],
      },
      attributes: PUBLIC_PRODUCT_CARD_ATTRS as unknown as string[],
      order: [["rating", "DESC"]],
      limit: 4,
    });

    res.json({
      ...product.toJSON(),
      related,
    });
  } catch (err: any) {
    console.error("Failed to fetch public product:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});


// Naive in-memory throttle: one IP can file a handful of enquiries a minute.
// Enough to blunt an accidental double-submit or a trivial bot; a real WAF or
// captcha belongs in front of this if abuse ever becomes a problem.
const SUBMIT_WINDOW_MS = 60_000;
const SUBMIT_MAX = 5;
const recentSubmits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const hits = (recentSubmits.get(ip) || []).filter((t) => now - t < SUBMIT_WINDOW_MS);
  hits.push(now);
  recentSubmits.set(ip, hits);
  // The map only ever holds active IPs — prune anything that aged out.
  if (recentSubmits.size > 5000) {
    for (const [key, times] of recentSubmits) {
      if (times.every((t) => now - t >= SUBMIT_WINDOW_MS)) recentSubmits.delete(key);
    }
  }
  return hits.length > SUBMIT_MAX;
}

const trim = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

// Lead capture for every public form on the landing page. Deliberately open and
// credential-less — the response carries no data back, only an acknowledgement.
// Live Google rating + reviews for the clinic. `configured: false` (HTTP 200)
// means the key/place aren't set yet — the landing page hides the section.
router.get("/google-reviews", async (_req: Request, res: Response) => {
  try {
    const payload = await getGoogleReviews();
    res.set("Cache-Control", "public, max-age=300");
    res.json(payload);
  } catch {
    res.status(502).json({ message: "Google reviews are temporarily unavailable." });
  }
});

router.post("/leads", async (req: Request, res: Response) => {
  if (isRateLimited(req.ip || "unknown")) {
    res.status(429).json({ message: "Too many requests — please try again in a minute." });
    return;
  }

  const fullName = trim(req.body?.fullName, 120);
  const phone = trim(req.body?.phone, 20)?.replace(/[^\d]/g, "") || null;

  if (!fullName || !phone || phone.length < 7) {
    res.status(400).json({ message: "A name and a valid phone number are required." });
    return;
  }

  const source = req.body?.source as LeadSource;

  await Lead.create({
    fullName,
    countryCode: trim(req.body?.countryCode, 8) || "+91",
    phone,
    email: trim(req.body?.email, 160),
    city: trim(req.body?.city, 80),
    branch: trim(req.body?.branch, 80),
    message: trim(req.body?.message, 2000),
    whatsappOptIn: Boolean(req.body?.whatsappOptIn),
    source: LEAD_SOURCES.includes(source) && source !== "manual" ? source : "consultation_modal",
    pageUrl: trim(req.body?.pageUrl, 500),
    status: "new",
  });

  res.status(201).json({ message: "Thanks — our team will reach out shortly." });
});

// ---------------------------------------------------------------------------
// Careers: Public Jobs & Application Submission
// ---------------------------------------------------------------------------

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const ALLOWED_RESUME_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
];

// List published jobs for /career page
router.get("/jobs", async (req: Request, res: Response) => {
  try {
    const { department, employmentType, search } = req.query;
    const where: any = { status: "published" };

    if (department && typeof department === "string" && department !== "All") {
      where.department = department;
    }
    if (employmentType && typeof employmentType === "string" && employmentType !== "All") {
      where.employmentType = employmentType;
    }
    if (search && typeof search === "string") {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const jobs = await Job.findAll({
      where,
      order: [
        ["sortOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
      attributes: [
        "id",
        "title",
        "slug",
        "department",
        "location",
        "employmentType",
        "experience",
        "salaryRange",
        "openings",
        "description",
        "requirements",
        "responsibilities",
        "benefits",
        "createdAt",
      ],
    });

    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch jobs" });
  }
});

// Get detailed job opening for /career/[slug]
router.get("/jobs/:slug", async (req: Request, res: Response) => {
  try {
    const job = await Job.findOne({
      where: { slug: req.params.slug, status: "published" },
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

// Submit candidate application for a job
router.post(
  "/jobs/:slug/apply",
  resumeUpload.single("resume"),
  async (req: Request, res: Response) => {
    try {
      const job = await Job.findOne({
        where: { slug: req.params.slug, status: "published" },
      });

      if (!job) {
        res.status(404).json({ message: "Job opening not found" });
        return;
      }

      const fullName = (req.body?.fullName || "").trim();
      const email = (req.body?.email || "").trim();
      const phone = (req.body?.phone || "").trim();
      const experienceYears = (req.body?.experienceYears || "").trim();
      const currentCompany = (req.body?.currentCompany || "").trim();
      const noticePeriod = (req.body?.noticePeriod || "").trim();
      const coverNote = (req.body?.coverNote || "").trim();

      if (!fullName || !email || !phone) {
        res.status(400).json({ message: "Full name, email, and phone number are required." });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ message: "Please upload your resume (PDF or Word document)." });
        return;
      }

      if (!ALLOWED_RESUME_MIME.includes(file.mimetype) && !file.originalname.match(/\.(pdf|doc|docx)$/i)) {
        res.status(400).json({ message: "Unsupported file type. Please upload a PDF, DOC, or DOCX document." });
        return;
      }

      // CVs hold personal data, so they're stored privately (never under the
      // publicly readable media/ prefix) and only streamed to logged-in staff.
      const stored = await storage.putPrivate(
        { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype },
        "resumes"
      );

      let application;
      try {
        application = await JobApplication.create({
          jobId: job.id,
          fullName,
          email,
          phone,
          experienceYears: experienceYears || "0",
          currentCompany: currentCompany || null,
          noticePeriod: noticePeriod || null,
          resumeKey: stored.key,
          resumeFileName: file.originalname,
          coverNote: coverNote || null,
          status: "new",
        });
      } catch (err) {
        // Don't leave an orphaned CV behind if the application wasn't saved.
        await storage.removePrivate(stored.key).catch(() => {});
        throw err;
      }

      res.status(201).json({
        message: "Application submitted successfully! Our HR team will review your profile.",
        applicationId: application.id,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to submit application" });
    }
  }
);

export default router;

