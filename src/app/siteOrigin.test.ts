import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { GET_APP_HREF } from '@/utils/appRoutes'

/**
 * www.slashie.app is the main address (FE-617): Vercel's Domains settings send
 * slashie.app to www (FE-616). The site's own links default to www, so search
 * engines and share cards never point at an address that redirects.
 */
describe('the site links to www.slashie.app', () => {
  it('defaults canonical and share links to www', () => {
    const layout = readFileSync(
      join(process.cwd(), 'src/app/layout.tsx'),
      'utf8',
    )
    expect(layout).toContain("'https://www.slashie.app'")
    expect(layout).not.toMatch(/'https:\/\/slashie\.app'/)
  })

  it('opens www from the QR code', () => {
    expect(GET_APP_HREF).toBe('https://www.slashie.app')
  })
})
