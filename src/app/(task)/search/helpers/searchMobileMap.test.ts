import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('search mobile map chrome', () => {
  it('fills the viewport behind header/nav and offsets Mapbox controls', () => {
    const src = readFileSync(
      join(dir, '../components/map/SearchMapLayer.tsx'),
      'utf8',
    )
    expect(src).toContain("position={{ base: 'fixed', lg: 'absolute' }}")
    expect(src).toContain("h={{ base: '100dvh', lg: 'full' }}")
    expect(src).toContain('mobileCtrlBottomOffset')
    expect(src).toContain('SEARCH_MOBILE_MAP_CTRL_BOTTOM')
    expect(src).not.toContain(
      '96px + env(safe-area-inset-bottom, 0px) + 11.5rem',
    )
  })

  it('sits the mobile carousel flush to the viewport bottom', () => {
    const src = readFileSync(
      join(dir, '../components/SearchLayouts.tsx'),
      'utf8',
    )
    expect(src).toContain("position={{ base: 'fixed', md: 'absolute' }}")
    expect(src).toContain('bottom={0}')
    expect(src).not.toContain('bottom={8}')
  })
})
