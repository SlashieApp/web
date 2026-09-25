const ADMIN_EMAIL_DOMAIN = 'slashie.app'

/** Same gate as the admin app: `@slashie.app` accounts only. */
export function isSlashieAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.trim().toLowerCase().endsWith(`@${ADMIN_EMAIL_DOMAIN}`)
}
