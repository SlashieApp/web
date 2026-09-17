import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('search mobile map chrome', () => {
  it('offsets Mapbox controls above the overlapping task card below lg', () => {
    const src = readFileSync(
      join(dir, '../components/map/SearchMapLayer.tsx'),
      'utf8',
    )
    const mapSrc = readFileSync(
      join(dir, '../../components/TaskMap.tsx'),
      'utf8',
    )
    expect(src).toContain('mobileCtrlBottomOffset')
    expect(src).toContain('SEARCH_MOBILE_MAP_CTRL_BOTTOM')
    expect(src).toContain('logoPosition="bottom-right"')
    expect(src).toContain('+ 7.5rem')
    expect(mapSrc).toContain("display: { base: 'none', lg: 'block' }")
    expect(mapSrc).toContain("lg: '0'")
    expect(src).not.toContain('+ 12rem')
  })

  it('fills the shell main padding box so the map stays full-bleed under the nav', () => {
    const screenSrc = readFileSync(
      join(dir, '../components/SearchScreen.tsx'),
      'utf8',
    )
    expect(screenSrc).toContain(
      "position={{ base: 'absolute', lg: 'relative' }}",
    )
    expect(screenSrc).toContain("inset={{ base: 0, lg: 'auto' }}")
  })

  it('sits the mobile carousel above the bottom nav', () => {
    const src = readFileSync(
      join(dir, '../components/SearchLayouts.tsx'),
      'utf8',
    )
    expect(src).toContain('bottom={MOBILE_BOTTOM_NAV_CLEARANCE}')
    expect(src).not.toContain('bottom={0}')
    expect(src).not.toContain('linear-gradient')
    expect(src).not.toContain('TaskBrowseListColumnScrim')
  })
})
