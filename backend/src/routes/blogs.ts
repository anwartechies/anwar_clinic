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

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: List all blog posts (including drafts)
 *     tags: [Admin - Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of blog posts
 */
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

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get single blog post by ID for editing
 *     tags: [Admin - Blogs]
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
 *         description: Complete blog post
 *       404:
 *         description: Blog not found
 */
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

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Admin - Blogs]
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
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               contentBlocks:
 *                 type: array
 *                 items:
 *                   type: object
 *               faqs:
 *                 type: array
 *                 items:
 *                   type: object
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               authorName:
 *                 type: string
 *               authorRole:
 *                 type: string
 *               authorAvatar:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               readTime:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               featured:
 *                 type: boolean
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog post created
 *       400:
 *         description: Validation error
 */
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

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: Update an existing blog post
 *     tags: [Admin - Blogs]
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
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               contentBlocks:
 *                 type: array
 *                 items:
 *                   type: object
 *               faqs:
 *                 type: array
 *                 items:
 *                   type: object
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Blog updated
 *       404:
 *         description: Blog not found
 */
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

/**
 * @swagger
 * /blogs/{id}/toggle-status:
 *   patch:
 *     summary: Quick toggle between draft and published status
 *     tags: [Admin - Blogs]
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
 *         description: Status toggled
 *       404:
 *         description: Blog not found
 */
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

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Admin - Blogs]
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
 *         description: Blog deleted
 *       404:
 *         description: Blog not found
 */
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
