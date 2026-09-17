import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, Role, Permission } from "../models";
import { isPlatformAdmin } from "../config/platform";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    roleSlug: string;
    permissions: string[];
    fullName: string;
    email: string;
    /** Rhinon Tech operator (see config/platform.ts) — not merely a superadmin. */
    isPlatformAdmin: boolean;
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  let payload: { userId: string };
  try {
    payload = jwt.verify(token, env.jwtSecret) as { userId: string };
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  // JWTs live for days — re-derive identity from the DB on every request so
  // deactivations, role changes, and permission grants/revocations take effect
  // immediately instead of waiting for the token to expire or a re-login.
  try {
    const account = await User.findByPk(payload.userId, {
      attributes: ["id", "status", "fullName", "email"],
      include: [{ model: Role, as: "role", include: [{ model: Permission }] }],
    });
    if (!account || account.status !== "active") {
      res.status(401).json({ message: "This account is no longer active." });
      return;
    }

    const role = (account as any).role as Role & { Permissions: Permission[] };
    const permissions = (role?.Permissions || []).map((p: any) => `${p.resource}:${p.action}`);

    req.user = {
      userId: account.id,
      roleSlug: role?.slug ?? "",
      permissions,
      fullName: account.fullName,
      email: account.email,
      isPlatformAdmin: isPlatformAdmin(account.email),
    };
  } catch (err: any) {
    console.error("Auth lookup failed:", err.message);
    res.status(500).json({ message: "Could not verify account" });
    return;
  }

  next();
}

/**
 * Platform-operations guard (rhinon-cms: requirePlatformOrg).
 *
 * authorize() short-circuits for any superadmin, and the clinic's own admin is a
 * superadmin — so without this, the clinic could reach /deploy and restart the
 * server. Modules that operate the platform rather than the clinic sit behind this.
 */
export function requirePlatformAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.isPlatformAdmin) {
    res.status(403).json({ message: "This module is not available to your account." });
    return;
  }
  next();
}

// For imperative in-handler checks (as opposed to the authorize() route guard below).
export function hasPermission(req: AuthRequest, ...anyOf: string[]): boolean {
  if (req.user?.roleSlug === "superadmin") return true;
  const granted = req.user?.permissions || [];
  return anyOf.some((p) => granted.includes(p));
}

// Route guard: requires ALL of the listed permissions.
export function authorize(...requiredPermissions: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Superadmin always has full authority, even if the permission catalog
    // drifts or a role's grants are misconfigured.
    if (req.user?.roleSlug === "superadmin") {
      next();
      return;
    }

    const userPermissions = req.user?.permissions || [];
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasAll) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    next();
  };
}

// Like authorize(), but grants access if the user has ANY of the listed
// permissions — for routes shared by two modules.
export function authorizeAny(...anyOfPermissions: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.roleSlug === "superadmin") {
      next();
      return;
    }

    const userPermissions = req.user?.permissions || [];
    const hasAny = anyOfPermissions.some((p) => userPermissions.includes(p));

    if (!hasAny) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    next();
  };
}
