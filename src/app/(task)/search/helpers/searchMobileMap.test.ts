import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('search mobile map chrome', () => {
  it('offsets Mapbox controls above the overlapping task card below lg', () => {
    const overlay = readFileSync(
      join(dir, '../../helpers/marketplaceMap/overlay/overlay.ts'),
      'utf8',
    )
    const overlayConfig = readFileSync(
      join(dir, '../../helpers/marketplaceMap/overlay/config.ts'),
      'utf8',
    )
    const mapSrc = readFileSync(
      join(dir, '../../components/ui/TaskMap.tsx'),
      'utf8',
    )
    const searchMap = readFileSync(
      join(dir, '../components/map/SearchMapLayer.tsx'),
      'utf8',
    )
    expect(overlay).toContain('overlayCtrlBottomOffsetForMobile')
    expect(overlayConfig).toContain('+ 7.5rem')
    expect(searchMap).toContain('mobileCtrlBottomOffset')
    expect(searchMap).toContain('overlayCtrlBottomOffsetForMobile')
    expect(searchMap).toContain("logoPosition: 'bottom-right'")
    expect(mapSrc).toContain('useIsTouchMobileDevice')
    expect(mapSrc).toContain("display: 'none'")
    expect(mapSrc).not.toContain("display: { base: 'none', lg: 'block' }")
    expect(mapSrc).toContain("lg: '0'")
    expect(overlayConfig).not.toContain('+ 12rem')
  })

  it('packs the Mapbox logo and compact attribution into a tight corner cluster', () => {
    const src = readFileSync(
      join(dir, '../../helpers/marketplaceMap/overlay/overlay.ts'),
      'utf8',
    )
    expect(src).toContain("flexDirection: 'row-reverse'")
    expect(src).toContain("columnGap: '2px'")
    expect(src).toContain("right: '4px'")
    expect(src).toContain("width: '70px'")
    expect(src).toContain(
      "'& .mapboxgl-ctrl-attrib .mapboxgl-ctrl-attrib-button'",
    )
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
    expect(screenSrc).toContain('<WebSearchLayout />')
    expect(screenSrc).toContain('<MobileSearchLayout />')
    expect(screenSrc).toContain('pointerEvents="none"')
    expect(screenSrc).toContain('<SearchMapLayer')
    expect(screenSrc).not.toContain(
      'isDesktopSplit ? <WebSearchLayout /> : <MobileSearchLayout />',
    )
  })

  it('sits the mobile carousel above the bottom nav', () => {
    const src = readFileSync(
      join(dir, '../components/layout/SearchLayouts.tsx'),
      'utf8',
    )
    expect(src).toContain("display={{ base: 'none', lg: 'block' }}")
    expect(src).toContain("display={{ base: 'block', lg: 'none' }}")
    expect(src).toContain('bottom={0}')
    expect(src).toContain('useIsTouchMobileDevice')
    expect(src).toContain('mr={touchPhone ? 0 : 12}')
    expect(src).not.toContain('bottom={MOBILE_BOTTOM_NAV_CLEARANCE}')
    expect(src).not.toContain('linear-gradient')
    expect(src).not.toContain('TaskBrowseListColumnScrim')
  })

  it('syncs TaskCard active state to the same selectedTaskId as the map pin', () => {
    const listSrc = readFileSync(
      join(dir, '../../components/(web)/layout/TaskList.tsx'),
      'utf8',
    )
    const carouselSrc = readFileSync(
      join(dir, '../../components/(mobile)/layout/MobileTaskCarousel.tsx'),
      'utf8',
    )
    expect(listSrc).toContain('isActive={selectedTaskId === task.id}')
    expect(listSrc).toContain('setSelectedTaskId(taskId)')
    expect(carouselSrc).toContain('onSnapSelect={setSelectedTaskId}')
    expect(carouselSrc).toContain('isActive={state.isActive}')
  })

  it('does not open the mobile filter sheet on desktop while both layouts stay mounted', () => {
    const src = readFileSync(
      join(
        dir,
        '../../components/(mobile)/layout/MobileTaskBrowseFiltersDrawer.tsx',
      ),
      'utf8',
    )
    expect(src).toContain("fallback: 'lg'")
    expect(src).toContain('if (!showMobileSheet) return null')
    expect(src).toContain('open={isFilterOpen}')
  })

  it('centers the mobile task-card skeleton to match the carousel snap', () => {
    const src = readFileSync(
      join(dir, '../../components/(mobile)/layout/MobileTaskCarousel.tsx'),
      'utf8',
    )
    expect(src).toContain('mx="auto"')
    expect(src).toContain("w={{ base: 'full', md: 'calc(100% - 52px)' }}")
    expect(src).not.toContain('minW="85%"')
  })
})
