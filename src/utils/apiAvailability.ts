import { APP_HOME, MARKETING_HOME } from '@/utils/appRoutes'

const API_UNAVAILABLE_KEY = 'slashie_api_unavailable'

export function markApiUnavailable(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(API_UNAVAILABLE_KEY, '1')
}

export function clearApiUnavailable(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(API_UNAVAILABLE_KEY)
}

export function isApiUnavailable(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(API_UNAVAILABLE_KEY) === '1'
}

export function isMarketingRoute(pathname: string): boolean {
  return (
    pathname === MARKETING_HOME ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about')
  )
}

export function isAuthRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email')
  )
}

/** Map browse + public task detail — readable without login; stay on page if API is down. */
export function isPublicTaskBrowseRoute(pathname: string): boolean {
  if (pathname === APP_HOME) return true
  if (!pathname.startsWith(`${APP_HOME}/`)) return false

  const rest = pathname.slice(`${APP_HOME}/`.length)
  const segment = rest.split('/')[0]
  if (!segment || segment === 'create') return false
  if (rest.includes('/edit') || rest.includes('/quote')) return false

  return true
}

/** App routes that should fall back to marketing home when the API is unreachable. */
export function shouldFallbackToLandingOnApiFailure(pathname: string): boolean {
  if (
    isMarketingRoute(pathname) ||
    isAuthRoute(pathname) ||
    isPublicTaskBrowseRoute(pathname)
  ) {
    return false
  }
  return true
}

export function redirectToLandingIfAppRoute(): void {
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  if (!shouldFallbackToLandingOnApiFailure(path)) return
  markApiUnavailable()
  window.location.assign(MARKETING_HOME)
}
