import { Router, Response } from "express";
import { Op } from "sequelize";
import { Product } from "../models";
import { PRODUCT_SECTIONS } from "../config/productSections";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

// Returns dynamic section schema for the product editor
router.get("/schema", authorize("products:read"), (_req: AuthRequest, res: Response) => {
  res.json(PRODUCT_SECTIONS);
});

// List all products for the admin panel
router.get("/", authorize("products:read"), async (req: AuthRequest, res: Response) => {
  const { search, category, concern, status } = req.query;

  const where: any = {};
  if (status && (status === "draft" || status === "published")) {
    where.status = status;
  }
  if (category && typeof category === "string") {
    where.category = category;
  }
  if (concern && typeof concern === "string") {
    where.concern = concern;
  }
  if (search && typeof search === "string") {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { category: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const products = await Product.findAll({
    where,
    order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    attributes: { exclude: ["sections"] },
  });

  res.json(products);
});

// Get single product for editing
router.get("/:id", authorize("products:read"), async (req: AuthRequest, res: Response) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json(product);
});

function normalizeSlug(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
  let slug = baseSlug || "product";
  let count = 1;

  while (true) {
    const existing = await Product.findOne({
      where: {
        slug,
        ...(currentId ? { id: { [Op.ne]: currentId } } : {}),
      },
    });

    if (!existing) return slug;
    slug = `${baseSlug}-${count++}`;
  }
}

// Create new product
router.post("/", authorize("products:write"), async (req: AuthRequest, res: Response) => {
  const {
    name,
    slug: rawSlug,
    category,
    concern,
    price,
    originalPrice,
    isSale,
    badge,
    rating,
    reviewsCount,
    image,
    description,
    inStock,
    stockQuantity,
    isKit,
    status,
    sortOrder,
    seoTitle,
    seoDescription,
    sections,
    hiddenSections,
  } = req.body;

  if (!name || typeof name !== "string") {
    res.status(400).json({ message: "Product name is required" });
    return;
  }

  const baseSlug = normalizeSlug(rawSlug || name);
  const slug = await resolveUniqueSlug(baseSlug);

  const product = await Product.create({
    slug,
    name: name.trim(),
    category: category || "Kits & Combos",
    concern: concern || "Daily Maintenance",
    price: Number(price) || 0,
    originalPrice: originalPrice ? Number(originalPrice) : null,
    isSale: Boolean(isSale),
    badge: badge ? String(badge).trim() : null,
    rating: rating ? Number(rating) : 4.8,
    reviewsCount: reviewsCount ? Number(reviewsCount) : 10,
    image: image ? String(image).trim() : "",
    description: description ? String(description).trim() : "",
    inStock: inStock !== undefined ? Boolean(inStock) : true,
    stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 100,
    isKit: isKit !== undefined ? Boolean(isKit) : category === "Kits & Combos",
    status: status === "published" ? "published" : "draft",
    sortOrder: Number(sortOrder) || 0,
    seoTitle: seoTitle ? String(seoTitle).trim() : null,
    seoDescription: seoDescription ? String(seoDescription).trim() : null,
    sections: sections && typeof sections === "object" ? sections : {},
    hiddenSections: Array.isArray(hiddenSections) ? hiddenSections : [],
    createdById: req.user?.userId || null,
  });

  res.status(201).json(product);
});

// Update product
router.put("/:id", authorize("products:write"), async (req: AuthRequest, res: Response) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const {
    name,
    slug: rawSlug,
    category,
    concern,
    price,
    originalPrice,
    isSale,
    badge,
    rating,
    reviewsCount,
    image,
    description,
    inStock,
    stockQuantity,
    isKit,
    status,
    sortOrder,
    seoTitle,
    seoDescription,
    sections,
    hiddenSections,
  } = req.body;

  let slug = product.slug;
  if (rawSlug && normalizeSlug(rawSlug) !== product.slug) {
    slug = await resolveUniqueSlug(normalizeSlug(rawSlug), product.id);
  }

  await product.update({
    slug,
    name: name !== undefined ? String(name).trim() : product.name,
    category: category !== undefined ? String(category).trim() : product.category,
    concern: concern !== undefined ? String(concern).trim() : product.concern,
    price: price !== undefined ? Number(price) : product.price,
    originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : product.originalPrice,
    isSale: isSale !== undefined ? Boolean(isSale) : product.isSale,
    badge: badge !== undefined ? (badge ? String(badge).trim() : null) : product.badge,
    rating: rating !== undefined ? Number(rating) : product.rating,
    reviewsCount: reviewsCount !== undefined ? Number(reviewsCount) : product.reviewsCount,
    image: image !== undefined ? String(image).trim() : product.image,
    description: description !== undefined ? String(description).trim() : product.description,
    inStock: inStock !== undefined ? Boolean(inStock) : product.inStock,
    stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : product.stockQuantity,
    isKit: isKit !== undefined ? Boolean(isKit) : product.isKit,
    status: status !== undefined ? (status === "published" ? "published" : "draft") : product.status,
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : product.sortOrder,
    seoTitle: seoTitle !== undefined ? (seoTitle ? String(seoTitle).trim() : null) : product.seoTitle,
    seoDescription: seoDescription !== undefined ? (seoDescription ? String(seoDescription).trim() : null) : product.seoDescription,
    sections: sections !== undefined && typeof sections === "object" ? sections : product.sections,
    hiddenSections: hiddenSections !== undefined && Array.isArray(hiddenSections) ? hiddenSections : product.hiddenSections,
  });

  res.json(product);
});

// Quick toggle status
router.patch("/:id/toggle-status", authorize("products:write"), async (req: AuthRequest, res: Response) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const newStatus = product.status === "published" ? "draft" : "published";
  await product.update({ status: newStatus });
  res.json({ id: product.id, status: newStatus });
});

// Delete product
router.delete("/:id", authorize("products:write"), async (req: AuthRequest, res: Response) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  await product.destroy();
  res.json({ message: "Product deleted successfully", id: req.params.id });
});

export default router;
