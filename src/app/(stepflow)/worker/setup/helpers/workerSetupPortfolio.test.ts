import { describe, expect, it } from 'vitest'

import {
  PORTFOLIO_URL_MAX_LENGTH,
  isUploadedPortfolioPhoto,
  portfolioUrlProblem,
} from './workerSetupPortfolio'

describe('isUploadedPortfolioPhoto', () => {
  const USER = '64b7f0c2a1d3e4f5a6b7c8d9'
  const UUID = '3f2b8c1e-7a4d-4e2b-9c1f-0a1b2c3d4e5f'

  it('knows a photo on our CDN', () => {
    expect(
      isUploadedPortfolioPhoto(
        `https://cdn.slashie.app/users/${USER}/portfolio/${UUID}.jpg`,
      ),
    ).toBe(true)
    // Anything else we host is shown too (the API lists any photo on our storage).
    expect(
      isUploadedPortfolioPhoto('https://cdn.slashie.app/tasks/abc/0.jpg'),
    ).toBe(true)
  })

  it("knows the API's portfolio path on another storage host (local and test storage)", () => {
    expect(
      isUploadedPortfolioPhoto(
        `https://dev-bucket.lon1.digitaloceanspaces.com/users/${USER}/portfolio/${UUID}.jpg`,
      ),
    ).toBe(true)
  })

  it('draws an inline data image (stories), which asks no host for anything', () => {
    expect(isUploadedPortfolioPhoto('data:image/svg+xml,%3Csvg/%3E')).toBe(true)
    expect(isUploadedPortfolioPhoto('data:text/html,<p>hi</p>')).toBe(false)
  })

  it('treats every other link as an old link', () => {
    for (const url of [
      'https://example.com/kitchen.jpg',
      'https://tracker.example/pixel.png',
      `https://example.com/users/${USER}/portfolio/not-a-uuid.jpg`,
      `https://example.com/users/${USER}/avatar-${UUID}.jpg`,
      `http://cdn.slashie.app/users/${USER}/portfolio/${UUID}.jpg`,
      'https://cdn.slashie.app.evil.example/a.jpg',
      'not a link',
      '',
    ]) {
      expect(isUploadedPortfolioPhoto(url), url).toBe(false)
    }
  })
})

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
