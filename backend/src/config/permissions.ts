import { Role, Permission } from "../models";

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
  { name: "doctors:read",       resource: "doctors",       action: "read"  },
  { name: "doctors:write",      resource: "doctors",       action: "write" },
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
    "doctors:read",
    "billing:read", "billing:write",
    "leads:read", "leads:write",
  ],
  pharmacist: [
    "dashboard:read",
    "prescriptions:read",
    "inventory:read", "inventory:write",
    "billing:read",
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

  if (createdPerms.length > 0) {
    for (const [slug, grantNames] of Object.entries(DEFAULT_ROLE_GRANTS)) {
      const role = await Role.findOne({ where: { slug } });
      if (!role) continue;
      const toGrant = createdPerms.filter((p) => grantNames.includes(p.name));
      if (toGrant.length > 0) {
        await (role as any).addPermissions(toGrant);
      }
    }
    console.log(`[Permissions] Catalog sync: created ${createdPerms.map((p) => p.name).join(", ")}`);
  }

  return { total: allPerms.length, created: createdPerms.length };
}
