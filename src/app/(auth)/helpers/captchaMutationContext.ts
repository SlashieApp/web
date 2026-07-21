import { AUTH_CAPTCHA_HEADER } from './turnstileConfig'

/** Apollo mutate `context` that attaches the CAPTCHA token for the API to verify. */
export function captchaMutationContext(
  token: string | null | undefined,
): { headers: Record<string, string> } | undefined {
  const trimmed = token?.trim()
  if (!trimmed) return undefined
  return {
    headers: {
      [AUTH_CAPTCHA_HEADER]: trimmed,
    },
  }
}
