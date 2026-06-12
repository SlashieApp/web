export function billingPath(): string {
  return '/billing'
}

export function billingAbsoluteUrl(origin?: string): string {
  const base =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}${billingPath()}`
}

export function checkoutSuccessUrl(origin?: string): string {
  return `${billingAbsoluteUrl(origin)}?checkout=success`
}

export function checkoutCancelUrl(origin?: string): string {
  return billingAbsoluteUrl(origin)
}

export function billingPortalReturnUrl(origin?: string): string {
  return billingAbsoluteUrl(origin)
}
