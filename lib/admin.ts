const ADMIN_DOMAIN = "willbieten.net"

/**
 * Check if a user has admin access based on their email domain.
 * Only users with @willbieten.net email addresses have full admin access.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const domain = email.split("@")[1]?.toLowerCase()
  return domain === ADMIN_DOMAIN
}
