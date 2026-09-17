// Rhinon Tech ("the platform") vs. the clinic.
//
// rhinon-cms marks the operator with an Organization.isPlatform flag. This app is
// single-tenant, so the operator is one fixed account. It is deliberately not
// configurable: platform tools such as Deploy restart the server, and the clinic's
// own Super Admin must never reach them — authorize() waves every superadmin
// through, hence this separate check.
const PLATFORM_ADMIN_EMAIL = "prabhat@rhinon.tech";

export function isPlatformAdmin(email: string | null | undefined): boolean {
  return !!email && email.trim().toLowerCase() === PLATFORM_ADMIN_EMAIL;
}
