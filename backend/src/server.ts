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
        // Seed data only ever FILLS GAPS. What the admin panel saved always wins:
        // this runs on every boot, so overwriting here silently undid their edits.
        const existing: Record<string, Record<string, unknown>> = { ...(service.sections || {}) };

        // The section was renamed with the QHT -> NexGen rebrand. Carry any saved
        // content over to the new key, or the next save drops it as unknown.
        if (existing.whyChooseQHT && !existing.whyChooseNexGen) {
          existing.whyChooseNexGen = existing.whyChooseQHT;
        }
        delete existing.whyChooseQHT;

        await service.update({
          sections: { ...sections, ...existing },
          ...(meta?.desc && !service.cardDescription ? { cardDescription: meta.desc } : {}),
          ...(meta?.image && !service.cardImage ? { cardImage: meta.image } : {}),
          ...(meta?.badge && !service.badge ? { badge: meta.badge } : {}),
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

