import { stripLocalePrefix } from '@/i18n/navigation'
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
  const path = stripLocalePrefix(pathname)
  return (
    path === MARKETING_HOME ||
    path.startsWith('/pricing') ||
    path.startsWith('/about') ||
    path.startsWith('/cookies') ||
    path.startsWith('/privacy') ||
    path.startsWith('/terms')
  )
}

export function isAuthRoute(pathname: string): boolean {
  const path = stripLocalePrefix(pathname)
  return (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password') ||
    path.startsWith('/verify-email')
  )
}

/** Map browse + public task detail — readable without login; stay on page if API is down. */
export function isPublicTaskBrowseRoute(pathname: string): boolean {
  const path = stripLocalePrefix(pathname)
  if (path === APP_HOME) return true
  if (!path.startsWith(`${APP_HOME}/`)) return false

  const rest = path.slice(`${APP_HOME}/`.length)
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
