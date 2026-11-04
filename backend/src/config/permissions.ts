import bcrypt from "bcryptjs";
import { Role, Permission, User } from "../models";

// Single source of truth for the permission catalog. The DB is synced to this
// list on every boot (additive only) — see syncPermissionCatalog below. Adding
// a line here is all it takes for a new permission to show up in the
// Settings > Roles matrix, ready to be granted to any role.
export const PERMISSION_CATALOG = [
  { name: "dashboard:read",     resource: "dashboard",     action: "read"  },
  { name: "appointments:read",  resource: "appointments",  action: "read"  },
  { name: "appointments:write", resource: "appointments",  action: "write" },
  { name: "patients:read",      resource: "patients",      action: "read"  },
  { name: "patients:write",     resource: "patients",      action: "write" },
  { name: "vitals:read",        resource: "vitals",        action: "read"  },
  { name: "vitals:write",       resource: "vitals",        action: "write" },
  { name: "queue:read",         resource: "queue",         action: "read"  },
  { name: "queue:write",        resource: "queue",         action: "write" },
  { name: "doctors:read",       resource: "doctors",       action: "read"  },
  { name: "doctors:write",      resource: "doctors",       action: "write" },
  { name: "consultation:write", resource: "consultation",  action: "write" },
  { name: "prescriptions:read", resource: "prescriptions", action: "read"  },
  { name: "prescriptions:write",resource: "prescriptions", action: "write" },
  { name: "billing:read",       resource: "billing",       action: "read"  },
  { name: "billing:write",      resource: "billing",       action: "write" },
  { name: "inventory:read",     resource: "inventory",     action: "read"  },
  { name: "inventory:write",    resource: "inventory",     action: "write" },
  { name: "staff:read",         resource: "staff",         action: "read"  },
  { name: "staff:write",        resource: "staff",         action: "write" },
  { name: "reports:read",       resource: "reports",       action: "read"  },
  { name: "leads:read",         resource: "leads",         action: "read"  },
  { name: "leads:write",        resource: "leads",         action: "write" },
  { name: "services:read",      resource: "services",      action: "read"  },
  { name: "services:write",     resource: "services",      action: "write" },
  { name: "media:read",         resource: "media",         action: "read"  },
  { name: "media:write",        resource: "media",         action: "write" },
  { name: "blogs:read",         resource: "blogs",         action: "read"  },
  { name: "blogs:write",        resource: "blogs",         action: "write" },
  { name: "products:read",      resource: "products",      action: "read"  },
  { name: "products:write",     resource: "products",      action: "write" },
  { name: "careers:read",       resource: "careers",       action: "read"  },
  { name: "careers:write",      resource: "careers",       action: "write" },
  { name: "offers:read",        resource: "offers",        action: "read"  },
  { name: "offers:write",       resource: "offers",        action: "write" },
  { name: "deploy:read",        resource: "deploy",        action: "read"  },
  { name: "deploy:trigger",     resource: "deploy",        action: "trigger" },
  { name: "settings:read",      resource: "settings",      action: "read"  },
  { name: "settings:write",     resource: "settings",      action: "write" },
];

// Grants applied only when a permission is FIRST created, preserving each
// role's existing behavior. Existing permissions are never re-granted, so
// revocations made from the Settings UI survive restarts.
export const DEFAULT_ROLE_GRANTS: Record<string, string[]> = {
  doctor: [
    "dashboard:read",
    "appointments:read", "appointments:write",
    "patients:read", "patients:write",
    "vitals:read", "vitals:write",
    "queue:read", "queue:write",
    "doctors:read",
    "consultation:write",
    "prescriptions:read", "prescriptions:write",
    "reports:read",
    "leads:read",
    "blogs:read",
    "products:read",
  ],
  receptionist: [
    "dashboard:read",
    "appointments:read", "appointments:write",
    "patients:read", "patients:write",
    "vitals:read", "vitals:write",
    "queue:read", "queue:write",
    "doctors:read",
    "billing:read", "billing:write",
    "leads:read", "leads:write",
  ],
  pharmacist: [
    "dashboard:read",
    "queue:read", "queue:write",
    "patients:read",
    "doctors:read",
    "prescriptions:read",
    "inventory:read", "inventory:write",
    "billing:read", "billing:write",
  ],
};

// Idempotent, additive catalog sync. Runs on every boot:
// - creates any catalog permissions missing from the DB
// - superadmin always accumulates the full catalog (addPermissions, never set)
// - DEFAULT_ROLE_GRANTS apply only to newly created permissions
export async function syncPermissionCatalog() {
  const results = await Promise.all(
    PERMISSION_CATALOG.map((p) =>
      Permission.findOrCreate({ where: { name: p.name }, defaults: p })
    )
  );
  const allPerms = results.map(([perm]) => perm);
  const createdPerms = results.filter(([, created]) => created).map(([perm]) => perm);

  const superadmin = await Role.findOne({ where: { slug: "superadmin" } });
  if (superadmin) {
    await (superadmin as any).addPermissions(allPerms);
  }

  for (const [slug, grantNames] of Object.entries(DEFAULT_ROLE_GRANTS)) {
    const [role] = await Role.findOrCreate({
      where: { slug },
      defaults: {
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        description: `${slug.charAt(0).toUpperCase() + slug.slice(1)} role for clinical workflow`,
      },
    });

    const refreshed = await Role.findByPk(role.id, { include: [{ model: Permission }] });
    const existingPermNames = new Set(((refreshed as any)?.Permissions || []).map((p: any) => p.name));
    const toGrant = allPerms.filter((p) => grantNames.includes(p.name) && !existingPermNames.has(p.name));
    if (toGrant.length > 0) {
      await (role as any).addPermissions(toGrant);
      console.log(`[Permissions] Granted default permissions to ${slug}: ${toGrant.map((p) => p.name).join(", ")}`);
    }
  }

  // Ensure default Pharmacist staff user exists for testing
  const pharmacistRole = await Role.findOne({ where: { slug: "pharmacist" } });
  if (pharmacistRole) {
    const existingPharmacist = await User.findOne({ where: { email: "pharmacist@anwarclinic.com" } });
    if (!existingPharmacist) {
      const passwordHash = await bcrypt.hash("Pharmacist@123", 10);
      await User.create({
        fullName: "Chief Pharmacist",
        email: "pharmacist@anwarclinic.com",
        passwordHash,
        roleId: pharmacistRole.id,
        department: "Pharmacy",
        designation: "Head Pharmacist",
        status: "active",
      });
      console.log("[Seed] Seeded default pharmacist account: pharmacist@anwarclinic.com (Pharmacist@123)");
    }
  }

  return { total: allPerms.length, created: createdPerms.length };
}
