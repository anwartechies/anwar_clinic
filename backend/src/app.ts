import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import authRoutes from "./routes/auth";
import rolesRoutes from "./routes/roles";
import permissionsRoutes from "./routes/permissions";
import mediaRoutes from "./routes/media";
import servicesRoutes from "./routes/services";
import leadsRoutes from "./routes/leads";
import blogsRoutes from "./routes/blogs";
import publicRoutes from "./routes/public";

const app = express();

const allowedOrigins = [
  ...env.frontendUrls,
  "http://localhost:3100",
  "http://localhost:4200",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

// Locally-stored uploads are served as a public, open-CORS static host — these
// URLs get embedded in <img src> on the landing page, which is a different
// origin. Only reachable when STORAGE_DRIVER=local; with S3 the bucket serves them.
app.use(
  "/uploads",
  cors({ origin: true }),
  express.static(path.resolve(process.cwd(), "uploads"), {
    maxAge: "1y",
    immutable: true,
    index: false,
    dotfiles: "deny",
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "anwar-clinic-api" });
});

app.use("/auth", authRoutes);
app.use("/roles", rolesRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/media", mediaRoutes);
app.use("/services", servicesRoutes);
app.use("/leads", leadsRoutes);
app.use("/blogs", blogsRoutes);
// Open CORS: the landing page fetches this from its own origin (and at build time).
app.use("/public", cors({ origin: true }), publicRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export default app;
