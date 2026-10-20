/** Most portfolio links a profile keeps (TOO_MANY_PORTFOLIO_URLS above it). */
export const PORTFOLIO_URLS_MAX = 12

/** Longest link the API takes (INVALID_PORTFOLIO_URL above it). */
export const PORTFOLIO_URL_MAX_LENGTH = 2048

export type PortfolioUrlProblem = 'notHttps' | 'tooLong'

/**
 * Why a portfolio link would be refused, or null when it is fine. https only:
 * an http image is blocked or flagged on an https page, and the API refuses
 * it too.
 */
export function portfolioUrlProblem(value: string): PortfolioUrlProblem | null {
  const url = value.trim()
  if (url.length > PORTFOLIO_URL_MAX_LENGTH) return 'tooLong'
  try {
    return new URL(url).protocol === 'https:' ? null : 'notHttps'
  } catch {
    return 'notHttps'
  }
}
