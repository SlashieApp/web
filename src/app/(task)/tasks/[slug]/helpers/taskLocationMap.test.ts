import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('task detail Mapbox chrome', () => {
  it('places the logo top-left and keeps attribution visible', () => {
    const src = readFileSync(join(dir, 'taskLocationMap.ts'), 'utf8')
    expect(src).toContain("logoPosition: 'top-left'")
    expect(src).toContain('attributionControl: true')
    expect(src).not.toContain('attributionControl: false')
  })

  it('clears the desktop left scrim below the header so the logo stays visible', () => {
    const bgSrc = readFileSync(
      join(
        dir,
        '../components/tripDetail/openTask/TaskDetailMapBackground.tsx',
      ),
      'utf8',
    )
    expect(bgSrc).toContain('DESKTOP_LOGO_CLEARANCE')
    expect(bgSrc).toContain('.mapboxgl-ctrl-top-left')
    expect(bgSrc).toContain('HEADER_MIN_HEIGHT.md')
  })
})
