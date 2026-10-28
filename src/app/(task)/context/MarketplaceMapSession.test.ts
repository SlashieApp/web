import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(dir, 'MarketplaceMapSession.tsx'), 'utf8')

/** Source guards for the host's default deny and the approximate pill (FE-472). */
describe('MarketplaceMapHost, approximate area', () => {
  it('keys the default deny on the detail path, not on the focus alone', () => {
    expect(src).toContain('confirmedTaskLocationAccess({')
    expect(src).toContain('onDetailPath,')
    expect(src).toContain('locationAccess: taskAccess')
    expect(src).toContain('const onDetailPath = isTaskDetailPath(pathname)')
  })

  it('resets the confirmation on prepareBrowse and clearFocus, and keeps only the same task on prepareDetail', () => {
    const prepareBrowse = src.slice(
      src.indexOf('prepareBrowse: () => {'),
      src.indexOf('clearFocus: () => {'),
    )
    expect(prepareBrowse).toContain('taskAccess: null')
    const clearFocus = src.slice(
      src.indexOf('clearFocus: () => {'),
      src.indexOf('setTaskAccess: (access) => {'),
    )
    expect(clearFocus).toContain('taskAccess: null')
    expect(clearFocus).toContain('prev.taskAccess')
    const prepareDetail = src.slice(
      src.indexOf('prepareDetail: (taskId) => {'),
      src.indexOf('prepareBrowse: () => {'),
    )
    expect(prepareDetail).toContain('prev.taskAccess?.taskId === taskId')
  })

  it('clears the confirmation when the binder goes', () => {
    expect(src).toContain('export function usePublishTaskLocationAccess')
    expect(src).toContain('() => () => dispatch?.setTaskAccess(null)')
  })

  it('frames the circle from the measured pill and fits its zoom to the window', () => {
    expect(src).toContain(
      "approximate ? 'approximate' : (published?.variant ?? 'exact')",
    )
    expect(src).toContain('approxCircleFrame({')
    expect(src).toContain('approxCircleZoom(confirmedAccess.center.lat')
    expect(src).toContain('approxPillH ?? APPROX_PILL_ONE_LINE_PX')
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
