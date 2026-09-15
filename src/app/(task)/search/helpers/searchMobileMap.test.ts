import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('search mobile map chrome', () => {
  it('offsets Mapbox controls above the overlapping task card', () => {
    const src = readFileSync(
      join(dir, '../components/map/SearchMapLayer.tsx'),
      'utf8',
    )
    expect(src).toContain('mobileCtrlBottomOffset')
    expect(src).toContain('SEARCH_MOBILE_MAP_CTRL_BOTTOM')
    expect(src).not.toContain(
      '96px + env(safe-area-inset-bottom, 0px) + 11.5rem',
    )
  })

  it('fills the shell main padding box so the carousel can sit on the nav', () => {
    const screenSrc = readFileSync(
      join(dir, '../components/SearchScreen.tsx'),
      'utf8',
    )
    expect(screenSrc).toContain(
      "position={{ base: 'absolute', lg: 'relative' }}",
    )
    expect(screenSrc).toContain("inset={{ base: 0, lg: 'auto' }}")
  })

  it('sits the mobile carousel flush to the layout bottom', () => {
    const src = readFileSync(
      join(dir, '../components/SearchLayouts.tsx'),
      'utf8',
    )
    expect(src).toContain('bottom={0}')
    expect(src).not.toContain('bottom={8}')
  })
})
