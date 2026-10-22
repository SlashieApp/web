import { describe, expect, it } from 'vitest'

import { SHEET_FLICK_VELOCITY } from '@/ui/Drawer/sheetMotion'

import { initialLocationPanel, resolveLocationPanelSnap } from './locationPanel'

describe('initialLocationPanel', () => {
  it('starts compact so the map gets the room', () => {
    expect(initialLocationPanel(undefined)).toBe('compact')
  })

  it('starts open when the exact address still needs fixing', () => {
    expect(initialLocationPanel('addressRequired')).toBe('expanded')
  })
})

describe('resolveLocationPanelSnap', () => {
  const heights = { compact: 100, expanded: 400 }

  it('stays compact after a short, slow pull up', () => {
    expect(
      resolveLocationPanelSnap({ ...heights, height: 160, velocity: 0 }),
    ).toBe('compact')
  })

  it('opens once a slow pull passes halfway', () => {
    expect(
      resolveLocationPanelSnap({ ...heights, height: 260, velocity: 0 }),
    ).toBe('expanded')
  })

  it('stays open after a short, slow pull down', () => {
    expect(
      resolveLocationPanelSnap({ ...heights, height: 330, velocity: -50 }),
    ).toBe('expanded')
  })

  it('closes once a slow pull down passes halfway', () => {
    expect(
      resolveLocationPanelSnap({ ...heights, height: 230, velocity: 0 }),
    ).toBe('compact')
  })

  it('carries a brisk release past halfway', () => {
    // 200 px up is short of halfway (250), but 600 px/s projects it past.
    expect(
      resolveLocationPanelSnap({ ...heights, height: 200, velocity: 600 }),
    ).toBe('expanded')
    expect(
      resolveLocationPanelSnap({ ...heights, height: 300, velocity: -600 }),
    ).toBe('compact')
  })

  it('follows a flick whatever the distance', () => {
    expect(
      resolveLocationPanelSnap({
        ...heights,
        height: 110,
        velocity: SHEET_FLICK_VELOCITY,
      }),
    ).toBe('expanded')
    expect(
      resolveLocationPanelSnap({
        ...heights,
        height: 390,
        velocity: -SHEET_FLICK_VELOCITY,
      }),
    ).toBe('compact')
  })

  it('goes the way it moved before the open height is measured', () => {
    expect(
      resolveLocationPanelSnap({
        height: 120,
        compact: 100,
        expanded: 0,
        velocity: 0,
      }),
    ).toBe('expanded')
    expect(
      resolveLocationPanelSnap({
        height: 100,
        compact: 100,
        expanded: 0,
        velocity: 0,
      }),
    ).toBe('compact')
  })
})
