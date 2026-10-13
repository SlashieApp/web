/**
 * Carries the email between login, forgot-password and the "sent" screen in
 * sessionStorage, so it never sits in a URL (history, logs, analytics).
 */
const KEY = 'slashie.reset-email'

export function stashResetEmail(email: string): void {
  try {
    const trimmed = email.trim()
    if (trimmed) window.sessionStorage.setItem(KEY, trimmed)
    else window.sessionStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the field just starts empty.
  }
}

export function readResetEmail(): string {
  try {
    return window.sessionStorage.getItem(KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}
