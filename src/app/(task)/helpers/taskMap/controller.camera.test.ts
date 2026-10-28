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

  it('keeps search selection as a pin on lat/lng (no zone-era circle or marker lift)', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
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

  // FE-167 and FE-169 took the zone circle out of the shared controller so a
  // browse selection is a pin, and this test used to forbid `syncZoneCircle`
  // here altogether. FE-472 puts the circle back for ONE case: task detail,
  // for a viewer who does not have the exact address (an `approxZone` on the
  // detail camera). The circle is the privacy answer there, not a selection
  // style, so it is drawn by the shared controller (the one map on the page)
  // and only from `syncApproxZone`.
  it('draws the circle only from syncApproxZone, for an approxZone on the detail camera', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    const start = src.indexOf('const syncApproxZone = () => {')
    const end = src.indexOf('// ----', start)
    expect(start).toBeGreaterThan(-1)
    const body = src.slice(start, end)
    expect(body).toContain("p.cameraMode === 'detail'")
    expect(body).toContain('p.approxZone')
    expect(body).toContain('syncZoneCircle(')
    // Nowhere else in the controller: browse selection stays a pin.
    const outside = src.slice(0, start) + src.slice(end)
    expect(outside.match(/syncZoneCircle\(/g)).toBeNull()
    // Only clears when there was a circle, so /search never adds the layers.
    expect(body).toContain('hadZone')
    // Remembered only once drawn: while the style is busy the next sync retries.
    expect(body).toMatch(
      /syncZoneCircle\([\s\S]*lastZoneKey = zoneKey[\s\S]*catch/,
    )
  })

  it('never draws a route, a You marker or a pin beside an approximate zone', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    expect(src).toContain('(p.navRouteEnabled ?? true) && !p.approxZone')
    expect(src).toContain('p.showReferenceMarker === false || p.approxZone')
    expect(src).toContain('task.id === p.approxZone.taskId')
  })

  it('does not wait for the style to clear pins, the You marker and the route when there are none to show', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    const start = src.indexOf('const sync = () => {')
    const guard = src.slice(start, src.indexOf('syncDeferred = false', start))
    // Inside the "style is busy" branch, before it defers.
    expect(guard).toContain('if (!map.isStyleLoaded()) {')
    expect(guard).toContain("early.cameraMode === 'detail'")
    expect(guard).toContain("(early.taskPinMode ?? 'all') === 'none'")
    expect(guard).toContain('syncNoPinsNow()')
    const now = src.slice(
      src.indexOf('const syncNoPinsNow = () => {'),
      src.indexOf('const sync = () => {'),
    )
    expect(now).toContain('syncReferenceMarker()')
    expect(now).toContain('syncMarkers()')
    expect(now).toContain('navRoute.clearRoute({ force: true })')
    expect(now).toContain('syncApproxZone()')
  })

  it('redraws the circle after a style reload and never animates it', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    // A theme switch reloads the style, which drops the circle's layers.
    expect(src).toMatch(/styleLoadRun = \(\) => \{[\s\S]*lastZoneKey = ''/)
    // The circle has no transition; only the camera pans, and not with reduced motion.
    expect(src).toContain('animate: pinMotionEnabled()')
    expect(src).toContain('didInitialCamera && args.animate !== false')
  })

  it('runs a sync skipped while the style was busy once the map is idle', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    expect(src).toContain('syncDeferred = true')
    expect(src).toContain('if (syncDeferred) scheduleSync()')
    expect(src).toMatch(/m\.on\('idle', idleRun\)/)
  })
})
