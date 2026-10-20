import { describe, expect, it } from 'vitest'

import {
  PORTFOLIO_URL_MAX_LENGTH,
  portfolioUrlProblem,
} from './workerSetupPortfolio'

describe('portfolioUrlProblem', () => {
  it('takes a full https link', () => {
    expect(portfolioUrlProblem('https://example.com/kitchen.jpg')).toBeNull()
  })

  it('refuses http, other schemes and text that is not a link', () => {
    expect(portfolioUrlProblem('http://example.com/a.jpg')).toBe('notHttps')
    expect(portfolioUrlProblem('javascript:alert(1)')).toBe('notHttps')
    expect(portfolioUrlProblem('example.com/a.jpg')).toBe('notHttps')
  })

  it('refuses a link over 2,048 characters', () => {
    const base = 'https://example.com/'
    const ok = base + 'a'.repeat(PORTFOLIO_URL_MAX_LENGTH - base.length)
    expect(portfolioUrlProblem(ok)).toBeNull()
    expect(portfolioUrlProblem(`${ok}a`)).toBe('tooLong')
  })
})
