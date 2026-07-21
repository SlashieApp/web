const LOGIN_FAIL_KEY = 'slashie.auth.loginFailCount'
const REGISTER_FAIL_KEY = 'slashie.auth.registerFailCount'

function readCount(key: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = sessionStorage.getItem(key)
    const n = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

function writeCount(key: string, value: number): void {
  if (typeof window === 'undefined') return
  try {
    if (value <= 0) {
      sessionStorage.removeItem(key)
      return
    }
    sessionStorage.setItem(key, String(value))
  } catch {
    // sessionStorage unavailable — progressive CAPTCHA still works in-memory via callers
  }
}

export function getLoginFailCount(): number {
  return readCount(LOGIN_FAIL_KEY)
}

export function incrementLoginFailCount(): number {
  const next = readCount(LOGIN_FAIL_KEY) + 1
  writeCount(LOGIN_FAIL_KEY, next)
  return next
}

export function clearLoginFailCount(): void {
  writeCount(LOGIN_FAIL_KEY, 0)
}

export function getRegisterFailCount(): number {
  return readCount(REGISTER_FAIL_KEY)
}

export function incrementRegisterFailCount(): number {
  const next = readCount(REGISTER_FAIL_KEY) + 1
  writeCount(REGISTER_FAIL_KEY, next)
  return next
}

export function clearRegisterFailCount(): void {
  writeCount(REGISTER_FAIL_KEY, 0)
}
