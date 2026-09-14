import app from "./app";
import { env } from "./config/env";
import { sequelize } from "./config/database";
import { syncDatabase, Service } from "./models";
import { syncPermissionCatalog } from "./config/permissions";
import { storage } from "./services/storage";
import { ALL_SERVICES_SEED, SEED_SECTIONS_BY_SLUG } from "./config/serviceSeedData";
import { syncSeedBlogsOnBoot } from "./config/seedBlogs";
import { syncSeedProductsOnBoot } from "./config/seedProducts";
import { syncSeedJobsOnBoot } from "./config/seedJobs";

async function syncServicesOnBoot() {
  try {
    for (const [slug, sections] of Object.entries(SEED_SECTIONS_BY_SLUG)) {
      const service = await Service.findOne({ where: { slug } });
      const meta = ALL_SERVICES_SEED.find((s) => s.slug === slug);
      if (service) {
        const existingRaw = JSON.stringify(service.sections || {});
        const hasLegacyQht = existingRaw.includes("qhtclinic.com") || existingRaw.includes("QHT") || existingRaw.includes("SAVA");
        const cleanSections = hasLegacyQht
          ? { ...(service.sections || {}), ...sections }
          : { ...sections, ...(service.sections || {}) };

        await service.update({
          sections: cleanSections,
          ...(meta?.desc ? { cardDescription: meta.desc } : {}),
          ...(meta?.image && !service.cardImage ? { cardImage: meta.image } : {}),
          ...(meta?.badge ? { badge: meta.badge } : {}),
        });
      } else if (meta) {
        await Service.create({
          slug: meta.slug,
          title: meta.title,
          cardDescription: meta.desc,
          cardImage: meta.image,
          badge: meta.badge ?? null,
          sortOrder: ALL_SERVICES_SEED.indexOf(meta),
          status: "published",
          seoTitle: `${meta.title} in India | NexGen Hair Transplant`,
          seoDescription: meta.desc,
          sections: sections ?? {},
          hiddenSections: [],
        });
      }
    }
    console.log("[Services] Synced seed sections to DB");
  } catch (err: any) {
    console.error("[Services] Sync error:", err.message);
  }
}

async function start() {
  await sequelize.authenticate();
  console.log("Database connected");

  await syncDatabase();
  console.log("Models synced");

  // Keep the DB permission catalog in sync with the code catalog (additive)
  try {
    const { total, created } = await syncPermissionCatalog();
    console.log(`[Permissions] Catalog synced (${total} permissions, ${created} new)`);
  } catch (err: any) {
    console.error("[Permissions] Catalog sync failed:", err.message);
  }

  await syncServicesOnBoot();
  await syncSeedBlogsOnBoot();
  await syncSeedProductsOnBoot();
  await syncSeedJobsOnBoot();

  console.log(`[Storage] Driver: ${storage.name}`);

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

