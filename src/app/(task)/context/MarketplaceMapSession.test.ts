import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(dir, 'MarketplaceMapSession.tsx'), 'utf8')

/**
 * The host's state and what it draws are tested where they run
 * (`helpers/marketplaceMap/session.test.ts`). These guard what only the
 * component does: wiring and markup, which have no test renderer here.
 */
describe('MarketplaceMapHost, approximate area (FE-472)', () => {
  it('keeps its state with the tested reducer and draws what the tested view returns', () => {
    expect(src).toContain('useReducer(')
    expect(src).toContain('marketplaceMapReducer')
    expect(src).toContain('resolveMarketplaceMapHost({')
  })

  it('clears the confirmation when the binder goes', () => {
    expect(src).toContain('export function usePublishTaskLocationAccess')
    expect(src).toContain('() => () => dispatch?.setTaskAccess(null)')
  })

  it('frames the circle from the measured pill and the measured top of the page', () => {
    expect(src).toContain('useApproxPillHeightRef')
    expect(src).toContain("node.closest('main')")
    expect(src).toContain('scroller.getBoundingClientRect().top')
    expect(src).toContain(
      'resolveMarketplaceMapHost({ state, pathname, size, topInset })',
    )
  })

  it('measures the top of the page at rest, and lets a change settle before the camera follows', () => {
    expect(src).toContain('scroller.scrollTop > 1')
    expect(src).toContain('TOP_INSET_SETTLE_MS')
    expect(src).toContain('setTopInset((prev) => (prev == null ? next : prev))')
  })

  it('hides the markers a Search canvas left, in the commit that stops drawing pins', () => {
    expect(src).toContain(
      "const hideStaleMarkers = onDetailPath && liveProps.taskPinMode === 'none'",
    )
    expect(src).toContain("'& .mapboxgl-marker': { display: 'none' }")
  })

  it('puts the wide pill in the fixed map layer, in the right half, and lets gestures through', () => {
    const start = src.indexOf("{viewport === 'web' &&")
    const end = src.indexOf('</Box>', src.indexOf('<ApproximateAreaPill'))
    expect(start).toBeGreaterThan(-1)
    const wide = src.slice(start, end)
    expect(wide).toContain('left={`${approxFrame.centerX}px`}')
    expect(wide).toContain('top={`${approxFrame.pill.top}px`}')
    expect(wide).toContain('pointerEvents="none"')
    expect(wide).toContain('liveProps.approxZone')
  })
})
