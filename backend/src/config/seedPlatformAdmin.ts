import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sequelize } from "./database";
import { Role, User } from "../models";

// Rhinon Tech's own Super Admin login, alongside the clinic's.
//
// Unlike the clinic admin in seed.ts, the password is never written in code (this
// repo is on GitHub) and is never reset by a re-seed: it's taken from
// PLATFORM_ADMIN_PASSWORD, or generated and printed once when the account is
// first created.
const PLATFORM_ADMIN = {
  email: (process.env.PLATFORM_ADMIN_EMAIL || "prabhat@rhinon.tech").trim().toLowerCase(),
  fullName: process.env.PLATFORM_ADMIN_NAME || "Prabhat (Rhinon Tech)",
};

function newPassword(): string {
  // 24 URL-safe characters (~144 bits).
  return crypto.randomBytes(18).toString("base64url");
}

export async function ensurePlatformAdmin(superadminRoleId: string): Promise<void> {
  const existing = await User.findOne({ where: { email: PLATFORM_ADMIN.email } });
  if (existing) {
    // Keep it a working Super Admin, but leave the password alone.
    await existing.update({ roleId: superadminRoleId, status: "active" });
    console.log(`  Platform admin ${PLATFORM_ADMIN.email} already exists — role/status ensured, password unchanged.`);
    return;
  }

  const fromEnv = process.env.PLATFORM_ADMIN_PASSWORD;
  if (fromEnv !== undefined && fromEnv.length < 12) {
    throw new Error("PLATFORM_ADMIN_PASSWORD must be at least 12 characters.");
  }
  const password = fromEnv || newPassword();

  await User.create({
    fullName: PLATFORM_ADMIN.fullName,
    email: PLATFORM_ADMIN.email,
    passwordHash: await bcrypt.hash(password, 10),
    roleId: superadminRoleId,
    department: "Rhinon Tech",
    designation: "Platform Administrator",
    status: "active",
  });

  console.log("");
  console.log("  Seeded platform admin (Super Admin)");
  console.log(`  Email:    ${PLATFORM_ADMIN.email}`);
  console.log(
    fromEnv
      ? "  Password: (from PLATFORM_ADMIN_PASSWORD)"
      : `  Password: ${password}   <- shown only this once; store it now`
  );
  console.log("");
}

// `npm run db:seed:platform-admin` — adds just this account to an existing
// database, without the full seed (which would reset the clinic admin's password).
if (require.main === module) {
  (async () => {
    await sequelize.authenticate();
    const superadmin = await Role.findOne({ where: { slug: "superadmin" } });
    if (!superadmin) throw new Error("Super Admin role not found — run `npm run db:seed` first.");
    await ensurePlatformAdmin(superadmin.id);
    await sequelize.close();
  })().catch(async (err) => {
    console.error("Platform admin seed failed:", err.message);
    await sequelize.close().catch(() => {});
    process.exit(1);
  });
}
