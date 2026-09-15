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
  })
})
