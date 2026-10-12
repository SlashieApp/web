import { describe, expect, it } from 'vitest'

import {
  clusterFeatureCollection,
  clusterSize,
  clusterViewFromFeatures,
  shouldOpenTaskStack,
} from './clusters'

function point(
  properties: Record<string, unknown>,
  lng = -0.4,
  lat = 51.65,
): GeoJSON.Feature {
  return {
    type: 'Feature',
    properties,
    geometry: { type: 'Point', coordinates: [lng, lat] },
  }
}

describe('clusterViewFromFeatures', () => {
  it('dedupes clusters repeated across tiles and lists loose pins', () => {
    const view = clusterViewFromFeatures([
      point({ cluster: true, cluster_id: 7, point_count: 12 }, -0.39, 51.66),
      point({ cluster: true, cluster_id: 7, point_count: 12 }, -0.39, 51.66),
      point({ id: 'task-a' }),
      point({ id: 'task-b' }),
    ])
    expect(view.clusters).toEqual([
      { id: 7, count: 12, lng: -0.39, lat: 51.66 },
    ])
    expect([...view.loose].sort()).toEqual(['task-a', 'task-b'])
  })
})

describe('shouldOpenTaskStack', () => {
  it('zooms in while the cluster can still split', () => {
    expect(shouldOpenTaskStack(14, 11, 17)).toBe(false)
  })

  it('lists tasks that never split or are already at max zoom', () => {
    expect(shouldOpenTaskStack(18, 12, 17)).toBe(true)
    expect(shouldOpenTaskStack(17, 17, 17)).toBe(true)
  })
})

describe('clusterSize', () => {
  it('grows at 10 and 50', () => {
    expect([2, 9, 10, 49, 50].map(clusterSize)).toEqual([
      'sm',
      'sm',
      'md',
      'md',
      'lg',
    ])
  })
})

describe('clusterFeatureCollection', () => {
  it('writes [lng, lat] points carrying the task id', () => {
    expect(
      clusterFeatureCollection([{ id: 't1', lng: -0.4, lat: 51.65 }])
        .features[0],
    ).toMatchObject({
      properties: { id: 't1' },
      geometry: { coordinates: [-0.4, 51.65] },
    })
  })
})
