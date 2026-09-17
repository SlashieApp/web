import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  SEARCH_MAP_LEFT_FADE_POS,
  SEARCH_MAP_LEFT_FADE_SIZE,
  mapboxCanvasFadeCss,
} from './mapboxCanvasFade'

const dir = dirname(fileURLToPath(import.meta.url))

describe('mapboxCanvasFadeCss', () => {
  it('paints search washes on the tile canvas: top+bottom below lg, left from the page column on desktop', () => {
    const css = mapboxCanvasFadeCss('search')
    const after = css['& .mapboxgl-canvas-container::after'] as Record<
      string,
      unknown
    >
    expect(after.backgroundImage).toMatchObject({
      lg: expect.stringContaining('to right'),
    })
    expect(after.backgroundSize).toMatchObject({
      base: '100% 30%, 100% 40%',
      lg: `${SEARCH_MAP_LEFT_FADE_SIZE} 100%`,
    })
    expect(after.backgroundPosition).toMatchObject({
      lg: `${SEARCH_MAP_LEFT_FADE_POS} 0`,
    })
    expect(SEARCH_MAP_LEFT_FADE_POS).toContain('90rem')
    expect(SEARCH_MAP_LEFT_FADE_SIZE).toContain('460px')
  })

  it('uses top+bottom on mobile task detail and left+half-bottom on desktop', () => {
    const mobile = mapboxCanvasFadeCss('taskDetailMobile')[
      '& .mapboxgl-canvas-container::after'
    ] as Record<string, string>
    const desktop = mapboxCanvasFadeCss('taskDetailDesktop')[
      '& .mapboxgl-canvas-container::after'
    ] as Record<string, string>
    expect(mobile.backgroundImage).toContain('to bottom')
    expect(mobile.backgroundImage).toContain('to top')
    expect(desktop.backgroundSize).toBe('100% 100%, 100% 50%')
    expect(desktop.backgroundImage).toContain('to right')
  })

  it('is wired onto the search and task-detail map shells, not layout overlays', () => {
    const searchMap = readFileSync(
      join(dir, '../search/components/map/SearchMapLayer.tsx'),
      'utf8',
    )
    const searchLayout = readFileSync(
      join(dir, '../search/components/SearchLayouts.tsx'),
      'utf8',
    )
    const detailBg = readFileSync(
      join(
        dir,
        '../tasks/[slug]/components/tripDetail/openTask/TaskDetailMapBackground.tsx',
      ),
      'utf8',
    )
    const hero = readFileSync(
      join(
        dir,
        '../tasks/[slug]/components/tripDetail/openTask/TaskLocationHeroMap.tsx',
      ),
      'utf8',
    )
    expect(searchMap).toContain("mapboxCanvasFadeCss('search')")
    expect(searchLayout).not.toContain('linear-gradient')
    expect(searchLayout).not.toContain('TaskBrowseListColumnScrim')
    expect(detailBg).toContain("mapboxCanvasFadeCss('taskDetailDesktop')")
    expect(hero).toContain("mapboxCanvasFadeCss('taskDetailMobile')")
  })
})
