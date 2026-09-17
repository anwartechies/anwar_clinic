import bcrypt from "bcryptjs";
import { sequelize } from "./database";
import { Role, Permission, User, syncDatabase } from "../models";
import { PERMISSION_CATALOG, DEFAULT_ROLE_GRANTS } from "./permissions";
import { ensurePlatformAdmin } from "./seedPlatformAdmin";

// The one account created on a fresh database. Everything else — extra roles,
// extra staff — is created from the admin panel at runtime.
const SEED_ADMIN = {
  fullName: "Clinic Administrator",
  email: "admin@anwarclinic.com",
  password: "Admin@123",
};

async function seed() {
  await sequelize.authenticate();
  await syncDatabase();

  // Permission catalog
  const results = await Promise.all(
    PERMISSION_CATALOG.map((p) => Permission.findOrCreate({ where: { name: p.name }, defaults: p }))
  );
  const allPerms = results.map(([p]) => p);
  console.log(`Permissions ready (${allPerms.length})`);

  // Super Admin — always holds the complete catalog
  const [superadminRole] = await Role.findOrCreate({
    where: { slug: "superadmin" },
    defaults: {
      name: "Super Admin",
      slug: "superadmin",
      description: "Full access to every module and to role management.",
    },
  });
  await (superadminRole as any).setPermissions(allPerms);

  // Starter roles. Their grants come from DEFAULT_ROLE_GRANTS — the same source
  // the boot-time catalog sync uses — so seeding and syncing can never drift.
  const starterRoles: { name: string; slug: keyof typeof DEFAULT_ROLE_GRANTS; description: string }[] = [
    { name: "Doctor", slug: "doctor", description: "Consultations, patient records and prescriptions." },
    { name: "Receptionist", slug: "receptionist", description: "Front desk — appointments, patient intake and billing." },
    { name: "Pharmacist", slug: "pharmacist", description: "Dispensing, stock and inventory." },
  ];

  for (const def of starterRoles) {
    const [role, created] = await Role.findOrCreate({
      where: { slug: def.slug },
      defaults: { name: def.name, slug: def.slug, description: def.description },
    });
    // Only set grants when the role is first created — permission changes made
    // later from Settings > Roles must survive a re-seed.
    if (created) {
      const grants = allPerms.filter((p) => DEFAULT_ROLE_GRANTS[def.slug].includes(p.name));
      await (role as any).setPermissions(grants);
    }
  }

  console.log("Roles ready: superadmin, doctor, receptionist, pharmacist");

  // The single seeded login
  const passwordHash = await bcrypt.hash(SEED_ADMIN.password, 10);
  const [admin, created] = await User.findOrCreate({
    where: { email: SEED_ADMIN.email },
    defaults: {
      fullName: SEED_ADMIN.fullName,
      email: SEED_ADMIN.email,
      passwordHash,
      roleId: superadminRole.id,
      department: "Administration",
      designation: "Administrator",
      status: "active",
    },
  });
  if (!created) {
    // Re-seeding resets the known credentials so the account is never locked out.
    await admin.update({ passwordHash, roleId: superadminRole.id, status: "active" });
  }

  console.log("");
  console.log("  Seeded admin account");
  console.log(`  Email:    ${SEED_ADMIN.email}`);
  console.log(`  Password: ${SEED_ADMIN.password}`);
  console.log("");

  await ensurePlatformAdmin(superadminRole.id);

  await sequelize.close();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
