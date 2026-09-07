import { Router, Request, Response } from "express";
import { Op } from "sequelize";
import { Service, Lead, Blog } from "../models";
import { LEAD_SOURCES, LeadSource } from "../models/Lead";
import { SEED_SECTIONS_BY_SLUG } from "../config/serviceSeedData";

// Open, credential-less API consumed by the landing page at build/revalidate
// time. Draft services are never exposed here, so an unfinished page can't leak.
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

export default router;

