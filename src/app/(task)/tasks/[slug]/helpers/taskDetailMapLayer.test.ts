import { describe, expect, it } from 'vitest'

import type { TaskLocationAccess } from '@/app/(task)/helpers/taskLocationAccess'

import {
  buildTaskDetailMapLayer,
  buildTaskLocationMapAccess,
  taskDetailMapCenter,
} from './taskDetailMapLayer'
import { storyTaskDetail, storyTaskOrder } from './taskDetailStoryFixtures'

const LABEL = 'Approximate area. Exact address after booking.'

/** The API's `location` for a viewer without the exact address: the public point. */
const task = storyTaskDetail({
  location: {
    lat: 51.5081,
    lng: -0.1269,
    name: 'Westminster',
    address: null,
  },
} as never)

/** The booked address: a different spot, which only the exact viewers may use. */
const order = storyTaskOrder({
  snapshot: {
    ...storyTaskOrder().snapshot,
    location: {
      lat: 51.5074,
      lng: -0.1278,
      name: 'Westminster',
      address: '12 Example Street, London SW1A 1AA',
    },
  },
})

const SEARCH_ORIGIN = { lat: 51.45, lng: -0.2 }

function layerFor(
  locationAccess: TaskLocationAccess,
  overrides: Partial<Parameters<typeof buildTaskDetailMapLayer>[0]> = {},
) {
  return buildTaskDetailMapLayer({
    task,
    locationAccess,
    myOrder: order,
    isOwner: false,
    meId: 'worker-detail-1',
    approxLabel: LABEL,
    keepBrowse: false,
    origin: SEARCH_ORIGIN,
    ...overrides,
  })
}

describe('buildTaskDetailMapLayer, approximate', () => {
  it('is the circle’s layer: no pin, no route, no You marker, labelled', () => {
    const layer = layerFor('approximate')
    expect(layer).toMatchObject({
      source: 'detail',
      cameraMode: 'detail',
      variant: 'approximate',
    })
    expect(layer?.props).toMatchObject({
      tasks: [],
      selectedTaskId: null,
      showReferenceMarker: false,
      navRouteEnabled: false,
      mapAriaLabel: LABEL,
    })
  })

  it('is centred on the task’s `location`, never the order snapshot or the search origin', () => {
    const layer = layerFor('approximate')
    expect(layer?.props.centerLat).toBe(51.5081)
    expect(layer?.props.centerLng).toBe(-0.1269)
    expect(layer?.props.centerLat).not.toBe(order.snapshot.location?.lat)
    expect(layer?.props.centerLat).not.toBe(SEARCH_ORIGIN.lat)
  })

  it('draws no circle’s layer of its own when the Search canvas is kept', () => {
    expect(layerFor('approximate', { keepBrowse: true })).toBeNull()
  })

  it('is the same for the owner’s preview, which arrives as approximate', () => {
    const layer = layerFor('approximate', { isOwner: true, meId: 'owner-1' })
    expect(layer?.variant).toBe('approximate')
    expect(layer?.props.tasks).toEqual([])
  })

  it('has nothing to draw without a place', () => {
    expect(
      layerFor('approximate', {
        task: storyTaskDetail({ location: null } as never),
      }),
    ).toBeNull()
    expect(layerFor('approximate', { task: null })).toBeNull()
  })
})

describe('buildTaskDetailMapLayer, pending', () => {
  it('publishes nothing until the viewer is known', () => {
    expect(layerFor('pending')).toBeNull()
    expect(layerFor('pending', { keepBrowse: true })).toBeNull()
  })
})

describe('buildTaskDetailMapLayer, exact', () => {
  it('is the task’s pin, selected, and the booked address when there is an order', () => {
    const layer = layerFor('exact')
    expect(layer?.variant).toBe('exact')
    expect(layer?.props.tasks.map((t) => t.id)).toEqual([task.id])
    expect(layer?.props.selectedTaskId).toBe(task.id)
    expect(layer?.props.tasks[0]).toMatchObject({
      locationLat: 51.5074,
      locationLng: -0.1278,
    })
  })

  it('uses the task’s `location` when there is no order (the owner)', () => {
    const layer = layerFor('exact', {
      myOrder: null,
      isOwner: true,
      meId: 'owner-1',
      origin: null,
    })
    expect(layer?.props.tasks[0]).toMatchObject({
      locationLat: 51.5081,
      locationLng: -0.1269,
    })
    expect(layer?.props.centerLat).toBe(51.5081)
  })

  it('routes from the search origin, with the You marker, only when it has one', () => {
    const fromSearch = layerFor('exact')
    expect(fromSearch?.props.navRouteEnabled).toBe(true)
    expect(fromSearch?.props.showReferenceMarker).toBe(true)
    expect(fromSearch?.props.centerLat).toBe(SEARCH_ORIGIN.lat)
    const direct = layerFor('exact', { origin: null })
    expect(direct?.props.navRouteEnabled).toBe(false)
    expect(direct?.props.showReferenceMarker).toBe(false)
  })

  it('draws the pin even when the Search canvas is kept: the detail layer replaces it', () => {
    expect(layerFor('exact', { keepBrowse: true })?.variant).toBe('exact')
  })

  it('prices the pin as the owner or a visitor sees it', () => {
    expect(
      layerFor('exact', { isOwner: true, meId: task.poster?.id })?.props
        .tasks[0]?.priceLabel,
    ).toBeTruthy()
  })
})

describe('taskDetailMapCenter', () => {
  it('takes the order snapshot only for an exact viewer', () => {
    expect(
      taskDetailMapCenter({ task, locationAccess: 'exact', myOrder: order }),
    ).toEqual({ lat: 51.5074, lng: -0.1278 })
    for (const locationAccess of ['approximate', 'pending'] as const) {
      expect(
        taskDetailMapCenter({ task, locationAccess, myOrder: order }),
      ).toEqual({ lat: 51.5081, lng: -0.1269 })
    }
  })

  it('is null without a task or a location', () => {
    expect(
      taskDetailMapCenter({ task: null, locationAccess: 'exact' }),
    ).toBeNull()
    expect(
      taskDetailMapCenter({
        task: storyTaskDetail({ location: null } as never),
        locationAccess: 'approximate',
      }),
    ).toBeNull()
  })
})

describe('buildTaskLocationMapAccess', () => {
  it('tells the host who is looking, which task, and where its circle goes', () => {
    expect(
      buildTaskLocationMapAccess({
        task,
        taskId: 'task-9',
        locationAccess: 'approximate',
        myOrder: order,
        approxLabel: LABEL,
      }),
    ).toEqual({
      taskId: 'task-9',
      access: 'approximate',
      center: { lat: 51.5081, lng: -0.1269 },
      approxLabel: LABEL,
    })
  })

  it('says nothing until the task is there, and says pending while the role is not known', () => {
    expect(
      buildTaskLocationMapAccess({
        task: null,
        taskId: 'task-9',
        locationAccess: 'pending',
        approxLabel: LABEL,
      }),
    ).toBeNull()
    expect(
      buildTaskLocationMapAccess({
        task,
        taskId: 'task-9',
        locationAccess: 'pending',
        approxLabel: LABEL,
      })?.access,
    ).toBe('pending')
  })
})
