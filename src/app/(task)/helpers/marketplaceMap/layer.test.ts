import { describe, expect, it } from 'vitest'

import type { TaskMapProps } from '../../components/ui/TaskMap'

import {
  type MarketplaceMapPublishedLayer,
  resolveMarketplaceMapLayer,
} from './layer'
import { marketplaceMapIsDesktopWidth } from './viewport'

const browseTask = {
  id: 'task-1',
  title: 'Assemble wardrobe',
  locationLat: 51.5,
  locationLng: -0.12,
}

const otherTask = {
  id: 'task-2',
  title: 'Walk the dog',
  locationLat: 51.51,
  locationLng: -0.13,
}

const browseProps: TaskMapProps = {
  accessToken: 'pk.test',
  centerLat: 51.5,
  centerLng: -0.1,
  radiusMiles: 10,
  tasks: [browseTask, otherTask],
  selectedTaskId: null,
}

const browseLayer: MarketplaceMapPublishedLayer = {
  source: 'browse',
  cameraMode: 'browse',
  variant: 'exact',
  props: browseProps,
}

describe('resolveMarketplaceMapLayer', () => {
  it('keeps every pin while browsing', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: browseLayer,
      focusTaskId: null,
    })
    expect(resolved?.tasks).toHaveLength(2)
    expect(resolved?.cameraMode).toBe('browse')
    expect(resolved?.taskPinMode).toBe('all')
    expect(resolved?.mapInteractions).toBe(true)
  })

  it('clears browse selection so the host can collapse the pin', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: {
        ...browseLayer,
        props: { ...browseProps, selectedTaskId: null },
      },
      focusTaskId: null,
    })
    expect(resolved?.selectedTaskId).toBeNull()
    expect(resolved?.cameraMode).toBe('browse')
    expect(resolved?.taskPinMode).toBe('all')
  })

  it('keeps browse pin framing when a search task is selected', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: {
        ...browseLayer,
        props: { ...browseProps, selectedTaskId: 'task-1' },
      },
      focusTaskId: null,
    })
    expect(resolved?.selectedTaskId).toBe('task-1')
    expect(resolved?.cameraMode).toBe('browse')
    expect(resolved?.taskPinMode).toBe('all')
    expect(resolved?.viewPadding).toBeUndefined()
    expect(resolved?.mapInteractions).toBe(true)
  })

  it('solos the targeted task and switches to the detail camera on click', () => {
    const padding = { top: 58, left: 700, right: 20, bottom: 400 }
    const resolved = resolveMarketplaceMapLayer({
      published: browseLayer,
      focusTaskId: 'task-1',
      viewPadding: padding,
      viewport: 'web',
    })
    expect(resolved?.tasks.map((task) => task.id)).toEqual(['task-1'])
    expect(resolved?.selectedTaskId).toBe('task-1')
    expect(resolved?.cameraMode).toBe('detail')
    expect(resolved?.taskPinMode).toBe('solo')
    expect(resolved?.mapInteractions).toBe(false)
    expect(resolved?.viewPadding).toEqual(padding)
    expect(resolved?.leftViewportPadding).toBe(0)
    expect(resolved?.onSelectTask).toBeUndefined()
    expect(resolved?.onSearchThisAreaConfirm).toBeUndefined()
  })

  it('keeps a solo pin on exact search→detail handoff (not a zone)', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: browseLayer,
      focusTaskId: 'task-1',
      viewport: 'mobile',
    })
    expect(resolved?.cameraMode).toBe('detail')
    expect(resolved?.taskPinMode).toBe('solo')
    expect(resolved?.selectedTaskId).toBe('task-1')
  })

  it('hides price pins for an approximate detail layer (zone only)', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: {
        source: 'detail',
        cameraMode: 'detail',
        variant: 'approximate',
        props: {
          ...browseProps,
          tasks: [browseTask],
          selectedTaskId: 'task-1',
        },
      },
      focusTaskId: null,
    })
    expect(resolved?.taskPinMode).toBe('none')
    expect(resolved?.cameraMode).toBe('detail')
  })
})

describe('marketplace map viewport', () => {
  it('uses desktop width at Chakra lg', () => {
    expect(marketplaceMapIsDesktopWidth(991)).toBe(false)
    expect(marketplaceMapIsDesktopWidth(992)).toBe(true)
  })
})
