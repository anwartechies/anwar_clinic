import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-safe decode: reads the claims without verifying the signature. That's
// fine here because this only decides where to *route* — every real
// authorization check happens server-side in the API, which re-derives the
// user's role and permissions from the database on each request.
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const json = Buffer.from(base64, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("authToken")?.value;

  const isAuthRoute = pathname.startsWith("/auth/");

  if (isAuthRoute) {
    if (authToken) {
      const payload = decodeJWTPayload(authToken);
      if (payload?.roleSlug) {
        return NextResponse.redirect(new URL(`/${payload.roleSlug}/dashboard`, request.url));
      }
    }
    return NextResponse.next();
  }

  if (!authToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const payload = decodeJWTPayload(authToken);

  if (!payload?.roleSlug) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("authToken");
    return response;
  }

  if (payload.exp && typeof payload.exp === "number" && Date.now() / 1000 > payload.exp) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("authToken");
    return response;
  }

  const roleSlug = payload.roleSlug as string;
  const urlRole = pathname.split("/")[1];

  // Superadmin may preview any role's URL, including roles created at runtime
  // from Settings > Roles — everyone else is pinned to their own.
  if (urlRole && urlRole !== roleSlug && roleSlug !== "superadmin") {
    return NextResponse.redirect(new URL(`/${roleSlug}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Static files from public/ and the app icon files are served from the site
  // root, so they're excluded by extension — otherwise the logo and favicon
  // would redirect to /auth/login for signed-out visitors.
  matcher: ["/auth/:path*", "/((?!_next/static|_next/image|.*\\.(?:ico|png|jpe?g|svg|webp)$).*)"],
};
