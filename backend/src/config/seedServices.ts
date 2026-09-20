import { sequelize } from "./database";
import { Service, syncDatabase } from "../models";
import { ALL_SERVICES_SEED, SEED_SECTIONS_BY_SLUG } from "./serviceSeedData";

// Imports the services that used to live in the landing page's
// src/data/allServicesData.ts. Idempotent: existing rows are left alone so
// edits made in the admin panel survive a re-run.
async function seedServices() {
  await sequelize.authenticate();
  await syncDatabase();

  let created = 0;
  let skipped = 0;

  for (const [index, item] of ALL_SERVICES_SEED.entries()) {
    const [service, wasCreated] = await Service.findOrCreate({
      where: { slug: item.slug },
      defaults: {
        slug: item.slug,
        title: item.title,
        cardDescription: item.desc,
        cardImage: item.image,
        badge: item.badge ?? null,
        sortOrder: index,
        status: "published",
        seoTitle: `${item.title} in India | NexGen Hair Transplant`,
        seoDescription: item.desc,
        sections: SEED_SECTIONS_BY_SLUG[item.slug] ?? {},
        hiddenSections: [],
      },
    });

    if (!wasCreated && SEED_SECTIONS_BY_SLUG[item.slug]) {
      // Re-seeding tops up missing sections; it never overwrites what the admin
      // panel saved (spreading the seed last used to wipe every edit).
      await service.update({
        sections: {
          ...SEED_SECTIONS_BY_SLUG[item.slug],
          ...(service.sections || {}),
        },
      });
    }

    wasCreated ? created++ : skipped++;
  }

  console.log(`Services seeded: ${created} created, ${skipped} already existed.`);
  await sequelize.close();
}

seedServices().catch(async (err) => {
  console.error("Service seed failed:", err);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
