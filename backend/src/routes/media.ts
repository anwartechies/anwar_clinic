import { Router, Response } from "express";
import multer from "multer";
import { MediaAsset, User } from "../models";
import { env } from "../config/env";
import { storage } from "../services/storage";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

// Memory storage: the driver decides where bytes actually land, so nothing is
// written to disk when the S3 driver is active.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes },
});

const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "application/pdf",
];

router.use(authenticate);

// Lets the UI label which backend is live without hardcoding it.
/**
 * @swagger
 * /media/config:
 *   get:
 *     summary: Get media storage configuration (storage driver, max upload size, allowed types)
 *     tags: [Admin - Media]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Storage configuration
 */
router.get("/config", authorize("media:read"), (_req: AuthRequest, res: Response) => {
  res.json({
    driver: storage.name,
    maxUploadBytes: env.maxUploadBytes,
    allowedMimeTypes: ALLOWED_MIME,
  });
});

/**
 * @swagger
 * /media:
 *   get:
 *     summary: List all uploaded media assets
 *     tags: [Admin - Media]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of media assets
 */
router.get("/", authorize("media:read"), async (_req: AuthRequest, res: Response) => {
  const assets = await MediaAsset.findAll({
    include: [{ model: User, as: "uploadedBy", attributes: ["id", "fullName"] }],
    order: [["createdAt", "DESC"]],
  });
  res.json(assets);
});

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload a media asset (image/document)
 *     tags: [Admin - Media]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Uploaded media asset record
 *       400:
 *         description: Unsupported file type or file too large
 */
router.post(
  "/upload",
  authorize("media:write"),
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      res.status(400).json({ message: `Unsupported file type: ${file.mimetype}` });
      return;
    }

    try {
      const stored = await storage.put({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      });

      const asset = await MediaAsset.create({
        key: stored.key,
        url: stored.url,
        originalName: file.originalname,
        mimeType: stored.contentType,
        size: stored.size,
        driver: storage.name,
        uploadedById: req.user!.userId,
      });

      res.status(201).json(asset);
    } catch (err: any) {
      console.error("[Media] Upload failed:", err.message);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

/**
 * @swagger
 * /media/{id}:
 *   put:
 *     summary: Update media asset metadata (e.g. alt text)
 *     tags: [Admin - Media]
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
 *               altText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset updated
 *       404:
 *         description: Asset not found
 */
router.put("/:id", authorize("media:write"), async (req: AuthRequest, res: Response) => {
  const asset = await MediaAsset.findByPk(req.params.id);
  if (!asset) {
    res.status(404).json({ message: "Asset not found" });
    return;
  }
  const { altText } = req.body as { altText?: string };
  if (altText !== undefined) await asset.update({ altText });
  res.json(asset);
});

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Delete a media asset from library and storage
 *     tags: [Admin - Media]
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
 *         description: Asset deleted
 *       404:
 *         description: Asset not found
 */
router.delete("/:id", authorize("media:write"), async (req: AuthRequest, res: Response) => {
  const asset = await MediaAsset.findByPk(req.params.id);
  if (!asset) {
    res.status(404).json({ message: "Asset not found" });
    return;
  }
  try {
    await storage.remove(asset.key);
  } catch (err: any) {
    // The row is the source of truth for the library; a missing object
    // shouldn't strand an undeletable entry.
    console.warn(`[Media] Could not remove object ${asset.key}: ${err.message}`);
  }
  await asset.destroy();
  res.json({ message: "Asset deleted" });
});

// Surfaces multer's own errors (notably file-size) as clean JSON.
router.use((err: any, _req: AuthRequest, res: Response, next: (e?: any) => void) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `File is larger than the ${Math.round(env.maxUploadBytes / 1024 / 1024)}MB limit`
        : err.message;
    res.status(400).json({ message });
    return;
  }
  next(err);
});

export default router;
