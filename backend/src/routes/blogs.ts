import { Router, Response } from "express";
import { Op } from "sequelize";
import { Blog } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

function slugify(input: string): string {
  return (input || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "untitled-post";
  let candidate = root;
  let n = 2;
  while (true) {
    const where: any = { slug: candidate };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const clash = await Blog.findOne({ where });
    if (!clash) return candidate;
    candidate = `${root}-${n++}`;
  }
}

// GET /blogs — list all blogs (drafts included)
router.get("/", authorize("blogs:read"), async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, search } = req.query;
    const where: any = {};

    if (status && (status === "draft" || status === "published")) {
      where.status = status;
    }
    if (category && typeof category === "string" && category.trim()) {
      where.category = category.trim();
    }
    if (search && typeof search === "string" && search.trim()) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { excerpt: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const blogs = await Blog.findAll({
      where,
      order: [
        ["featured", "DESC"],
        ["publishedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
      // Content can be heavy; omit from list
      attributes: { exclude: ["content", "contentBlocks"] },
    });
    res.json(blogs);
  } catch (err: any) {
    console.error("Failed to list blogs:", err);
    res.status(500).json({ message: err.message || "Failed to list blogs" });
  }
});

// GET /blogs/:id — single blog for the editor
router.get("/:id", authorize("blogs:read"), async (req: AuthRequest, res: Response) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.json(blog);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch blog" });
  }
});

// POST /blogs — create a new blog
router.post("/", authorize("blogs:write"), async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    const hasBlocks = Array.isArray(b.contentBlocks) && b.contentBlocks.length > 0;
    if (!b.title || (!b.content && !hasBlocks)) {
      res.status(400).json({ message: "Title and blog content are required" });
      return;
    }

    const slug = await uniqueSlug(b.slug || b.title);
    const blog = await Blog.create({
      ...b,
      slug,
      excerpt: b.excerpt || "",
      content: b.content || "",
      contentBlocks: Array.isArray(b.contentBlocks) ? b.contentBlocks : [],
      faqs: Array.isArray(b.faqs) ? b.faqs : [],
      category: b.category || "Hair Transplant",
      tags: Array.isArray(b.tags) ? b.tags : [],
      authorName: b.authorName || "Dr. Anwar",
      authorRole: b.authorRole || "Lead Surgeon & Hair Specialist",
      authorAvatar: b.authorAvatar || null,
      coverImage: b.coverImage || null,
      readTime: b.readTime || "5 min read",
      publishedAt: b.publishedAt ? new Date(b.publishedAt) : new Date(),
      status: b.status === "published" ? "published" : "draft",
      featured: Boolean(b.featured),
      metaTitle: b.metaTitle || null,
      metaDescription: b.metaDescription || null,
      createdById: req.user?.userId || null,
    });
    res.status(201).json(blog);
  } catch (err: any) {
    console.error("Failed to create blog:", err);
    res.status(400).json({ message: err.message || "Failed to create blog" });
  }
});

// PUT /blogs/:id — update a blog
router.put("/:id", authorize("blogs:write"), async (req: AuthRequest, res: Response) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    const b = { ...req.body };
    delete b.id;
    delete b.createdById;

    // Handle slug change
    if (b.slug && b.slug !== blog.slug) {
      b.slug = await uniqueSlug(b.slug, blog.id);
    } else {
      delete b.slug;
    }

    if (b.status !== undefined) {
      b.status = b.status === "published" ? "published" : "draft";
    }
    if (b.publishedAt) {
      b.publishedAt = new Date(b.publishedAt);
    }

    await blog.update(b);
    res.json(blog);
  } catch (err: any) {
    console.error("Failed to update blog:", err);
    res.status(400).json({ message: err.message || "Failed to update blog" });
  }
});

// PATCH /blogs/:id/toggle-status — quick publish/unpublish
router.patch("/:id/toggle-status", authorize("blogs:write"), async (req: AuthRequest, res: Response) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    const nextStatus = blog.status === "published" ? "draft" : "published";
    await blog.update({ status: nextStatus });
    res.json({ status: nextStatus, message: `Blog is now ${nextStatus}` });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to toggle status" });
  }
});

// DELETE /blogs/:id — delete a blog
router.delete("/:id", authorize("blogs:write"), async (req: AuthRequest, res: Response) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    await blog.destroy();
    res.json({ message: "Blog deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to delete blog" });
  }
});

export default router;
