import { stripLocalePrefix } from '@/i18n/navigation'

/**
 * Multi-step flows that own their chrome via `StepFlowLayout`.
 * These routes must not also mount app `Header` / `Dock`.
 */
export function isStepFlowStandaloneRoute(
  pathname: string | null | undefined,
): boolean {
  const path = stripLocalePrefix(pathname ?? '')

  if (path === '/worker/setup' || path.startsWith('/worker/setup/')) {
    return true
  }

  if (path === '/tasks/create' || path.startsWith('/tasks/create/')) {
    return true
  }

  // `/tasks/:slug/quote` (send-quote StepFlow)
  if (/^\/tasks\/[^/]+\/quote(?:\/|$)/.test(path)) {
    return true
  }

  return false
}
