import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('task detail Mapbox chrome', () => {
  it('places the logo top-right and keeps attribution visible', () => {
    const src = readFileSync(join(dir, 'taskLocationMap.ts'), 'utf8')
    expect(src).toContain("logoPosition: 'top-right'")
    expect(src).toContain('attributionControl: true')
    expect(src).not.toContain('attributionControl: false')
  })

  it('fades the desktop map left-to-right and bottom half on the Mapbox canvas', () => {
    const bgSrc = readFileSync(
      join(
        dir,
        '../components/tripDetail/openTask/TaskDetailMapBackground.tsx',
      ),
      'utf8',
    )
    expect(bgSrc).toContain("mapboxCanvasFadeCss('taskDetailDesktop')")
    expect(bgSrc).toContain('.mapboxgl-ctrl-top-right')
    expect(bgSrc).toContain('HEADER_MIN_HEIGHT.md')
    expect(bgSrc).not.toContain('DESKTOP_LOGO_CLEARANCE')
    expect(bgSrc).not.toContain('.mapboxgl-ctrl-top-left')
    expect(bgSrc).toContain('isolation="isolate"')
    expect(bgSrc).toContain("display={{ base: 'none', lg: 'block' }}")
  })
})
