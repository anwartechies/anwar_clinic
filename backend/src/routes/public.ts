import { Router, Request, Response } from "express";
import { Op } from "sequelize";
import multer from "multer";
import { Service, Lead, Blog, Product, Job, JobApplication, Offer } from "../models";
import { LEAD_SOURCES, LeadSource } from "../models/Lead";
import { getGoogleReviews } from "../services/googleReviews";
import { storage } from "../services/storage";

// Open, credential-less API consumed by the landing page and ecommerce at build/revalidate
// time. Draft items are never exposed here.
const router = Router();

const PUBLIC_ATTRS = [
  "slug", "title", "cardDescription", "cardImage", "badge",
  "sortOrder", "seoTitle", "seoDescription", "sections", "hiddenSections",
] as const;

/**
 * @swagger
 * /public/services:
 *   get:
 *     summary: List all published services (card summary)
 *     tags: [Public - Services]
 *     responses:
 *       200:
 *         description: List of published service cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   slug:
 *                     type: string
 *                   title:
 *                     type: string
 *                   cardDescription:
 *                     type: string
 *                   cardImage:
 *                     type: string
 *                   badge:
 *                     type: string
 *                   sortOrder:
 *                     type: integer
 */
router.get("/services", async (_req: Request, res: Response) => {
  const services = await Service.findAll({
    where: { status: "published" },
    order: [["sortOrder", "ASC"], ["createdAt", "ASC"]],
    // Card data only — keeps the listing payload small.
    attributes: ["slug", "title", "cardDescription", "cardImage", "badge", "sortOrder"],
  });
  res.json(services);
});

/**
 * @swagger
 * /public/services/{slug}:
 *   get:
 *     summary: Get full details and rich content sections for a service by slug
 *     tags: [Public - Services]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: hair-transplant
 *     responses:
 *       200:
 *         description: Complete service details and content sections
 *       404:
 *         description: Service not found
 */
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

/**
 * @swagger
 * /public/blogs:
 *   get:
 *     summary: List published blogs for landing page
 *     tags: [Public - Blogs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by blog category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matching title or excerpt
 *     responses:
 *       200:
 *         description: List of published blog summaries
 */
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

/**
 * @swagger
 * /public/blogs/{slug}:
 *   get:
 *     summary: Get single published blog by slug and 3 related articles
 *     tags: [Public - Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog article details with related posts
 *       404:
 *         description: Blog not found
 */
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
    Blog.increment("views", { where: { id: blog.id } }).catch(() => { });

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

/**
 * @swagger
 * /public/products:
 *   get:
 *     summary: List published products for ecommerce catalog
 *     tags: [Public - Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: concern
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price-low, price-high, rating]
 *     responses:
 *       200:
 *         description: List of published products
 */
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

/**
 * @swagger
 * /public/products/{slug}:
 *   get:
 *     summary: Get single published product details with related recommendations
 *     tags: [Public - Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product detail object
 *       404:
 *         description: Product not found
 */
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

/**
 * @swagger
 * /public/google-reviews:
 *   get:
 *     summary: Get clinic Google rating, total reviews and top reviews
 *     tags: [Public - Reviews]
 *     responses:
 *       200:
 *         description: Google reviews data or configured=false if not yet configured
 *       502:
 *         description: Google reviews service temporarily unavailable
 */
router.get("/google-reviews", async (_req: Request, res: Response) => {
  try {
    const payload = await getGoogleReviews();
    res.set("Cache-Control", "public, max-age=300");
    res.json(payload);
  } catch {
    res.status(502).json({ message: "Google reviews are temporarily unavailable." });
  }
});

/**
 * @swagger
 * /public/leads:
 *   post:
 *     summary: Submit a consultation/enquiry lead from public website
 *     tags: [Public - Leads]
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
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               countryCode:
 *                 type: string
 *                 example: "+91"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               city:
 *                 type: string
 *                 example: Mumbai
 *               branch:
 *                 type: string
 *                 example: Bandra
 *               message:
 *                 type: string
 *                 example: Interested in hair transplant consultation
 *               whatsappOptIn:
 *                 type: boolean
 *                 example: true
 *               source:
 *                 type: string
 *                 example: consultation_modal
 *               pageUrl:
 *                 type: string
 *                 example: "https://anwarclinic.com/services/hair-transplant"
 *     responses:
 *       201:
 *         description: Lead received successfully
 *       400:
 *         description: Validation error - name and phone required
 *       429:
 *         description: Rate limited - too many submissions
 */
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

/**
 * @swagger
 * /public/jobs:
 *   get:
 *     summary: List published job openings for careers page
 *     tags: [Public - Jobs]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of published job openings
 */
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

/**
 * @swagger
 * /public/jobs/{slug}:
 *   get:
 *     summary: Get detailed published job opening by slug
 *     tags: [Public - Jobs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job opening details
 *       404:
 *         description: Job opening not found
 */
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

/**
 * @swagger
 * /public/jobs/{slug}/apply:
 *   post:
 *     summary: Submit a job application with resume upload
 *     tags: [Public - Jobs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - resume
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               experienceYears:
 *                 type: string
 *               currentCompany:
 *                 type: string
 *               noticePeriod:
 *                 type: string
 *               coverNote:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Missing fields or invalid resume file
 *       404:
 *         description: Job not found
 */
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
        await storage.removePrivate(stored.key).catch(() => { });
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

/**
 * @swagger
 * /public/offers/active:
 *   get:
 *     summary: Get current active website promotional offer banner
 *     tags: [Public - Offers]
 *     responses:
 *       200:
 *         description: Active offer details or isEnabled=false if no offer active
 */
router.get("/offers/active", async (_req: Request, res: Response) => {
  try {
    const offer = await Offer.findOne({
      where: { status: "active" },
    });

    if (!offer) {
      res.json({ isEnabled: false });
      return;
    }

    res.json({
      id: offer.id,
      isEnabled: true,
      badge: offer.badge || undefined,
      title: offer.title,
      highlightText: offer.highlightText || undefined,
      perks: Array.isArray(offer.perks) ? offer.perks : [],
      couponCode: offer.couponCode || undefined,
      ctaText: offer.ctaText || "Claim Consultation",
      link: offer.link || "/offer",
    });
  } catch (err: any) {
    console.error("Failed to fetch active offer:", err);
    res.status(500).json({ message: "Failed to fetch active offer", isEnabled: false });
  }
});

export default router;

