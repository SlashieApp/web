/** URL prefixes for the signed-in account hub (dashboard route group). */
const ACCOUNT_HUB_PREFIXES = [
  '/dashboard',
  '/workers',
  '/requests',
  '/quotes',
  '/earnings',
  '/billing',
  '/account',
  '/profile',
] as const

export function isAccountHubPath(pathname: string | null | undefined): boolean {
  const path = pathname ?? ''
  return ACCOUNT_HUB_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )
}
