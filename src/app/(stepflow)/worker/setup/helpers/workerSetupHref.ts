export function workerSetupHref(next?: string | null): string {
  const trimmed = next?.trim()
  if (!trimmed) return '/worker/setup'
  return `/worker/setup?next=${encodeURIComponent(trimmed)}`
}
