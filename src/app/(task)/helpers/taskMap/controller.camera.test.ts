import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('task map camera', () => {
  it('uses flyTo for every camera move, including Back from task detail to search', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    expect(src).toContain('map.flyTo')
    expect(src).toContain('CAMERA_FLY_MS')
    expect(src).toContain('flyCamera')
    expect(src).not.toContain('easeTo')
    expect(src).not.toContain('jumpTo')
    expect(src).toContain('to search is a real camera change')
    expect(src).toContain("if (cameraMode === 'detail')")
    expect(src).toContain('lastCameraKey = cameraKey')
  })

  it('keeps search selection as a pin on lat/lng (no zone circle or marker lift)', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    expect(src).not.toContain('syncZoneCircle')
    expect(src).not.toContain('SELECTED_ZONE')
    expect(src).not.toContain('zoneRadiusPx')
    expect(src).not.toContain('syncSelectedMarkerOffset')
    expect(src).toContain('PIN_MAPBOX_ANCHOR')
    expect(src).toContain('PIN_MAPBOX_OFFSET')
    expect(src).toContain('row.marker.setOffset(PIN_MAPBOX_OFFSET)')
    expect(src).toContain('setExpanded(isSelected)')
    expect(src).toContain('applySelectionVisuals')
    expect(src).toContain('syncSelection(true)')
  })
})
