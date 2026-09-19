import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('task map selected pin', () => {
  it('keeps a location pin on the true lat/lng when a task is selected', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    expect(src).toContain("anchor: 'bottom'")
    expect(src).toContain('setExpanded(isSelected)')
    expect(src).toContain('row.marker.setOffset([0, 0])')
    expect(src).not.toContain('SELECTED_ZONE_LAYERS')
    expect(src).not.toContain('syncZoneCircle')
    expect(src).not.toContain('syncSelectedMarkerOffset')
    expect(src).not.toContain('zoneRadiusPx')
  })
})
