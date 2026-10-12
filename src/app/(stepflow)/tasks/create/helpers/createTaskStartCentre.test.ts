import { describe, expect, it } from 'vitest'

import {
  createTaskSearchCentreFromQuery,
  resolveCreateTaskStartCentre,
} from './createTaskStartCentre'
import {
  TASK_MAP_PREVIEW_LAT,
  TASK_MAP_PREVIEW_LNG,
} from './resolveTaskLocation'

const LONDON = {
  lat: TASK_MAP_PREVIEW_LAT,
  lng: TASK_MAP_PREVIEW_LNG,
  source: 'default',
}

describe('createTaskSearchCentreFromQuery', () => {
  it('reads a /search centre', () => {
    expect(
      createTaskSearchCentreFromQuery('?from=search&lat=51.6&lng=-0.35'),
    ).toEqual({ lat: 51.6, lng: -0.35 })
  })

  it('keeps other params alongside the centre', () => {
    expect(
      createTaskSearchCentreFromQuery(
        'title=Fix%20tap&from=search&lat=51.6&lng=-0.35',
      ),
    ).toEqual({ lat: 51.6, lng: -0.35 })
  })

  it('ignores coordinates that did not come from /search', () => {
    expect(createTaskSearchCentreFromQuery('?lat=51.6&lng=-0.35')).toBeNull()
    expect(
      createTaskSearchCentreFromQuery('?from=detail&lat=51.6&lng=-0.35'),
    ).toBeNull()
  })

  it('rejects missing, invalid, and out-of-range coordinates', () => {
    for (const query of [
      '?from=search',
      '?from=search&lat=51.6',
      '?from=search&lng=-0.35',
      '?from=search&lat=&lng=',
      '?from=search&lat=abc&lng=-0.35',
      '?from=search&lat=51.6abc&lng=-0.35',
      '?from=search&lat=Infinity&lng=-0.35',
      '?from=search&lat=91&lng=-0.35',
      '?from=search&lat=-91&lng=-0.35',
      '?from=search&lat=51.6&lng=181',
      '?from=search&lat=51.6&lng=-181',
    ]) {
      expect(createTaskSearchCentreFromQuery(query)).toBeNull()
    }
  })
})

describe('resolveCreateTaskStartCentre', () => {
  const geolocated = { lat: 53.48, lng: -2.24 }

  it('prefers the /search centre over current location', () => {
    expect(
      resolveCreateTaskStartCentre({
        search: '?from=search&lat=51.6&lng=-0.35',
        geolocated,
      }),
    ).toEqual({ lat: 51.6, lng: -0.35, source: 'search' })
  })

  it('falls back to current location without a valid /search centre', () => {
    expect(
      resolveCreateTaskStartCentre({
        search: '?from=search&lat=999&lng=-0.35',
        geolocated,
      }),
    ).toEqual({ ...geolocated, source: 'geolocation' })
  })

  it('falls back to London when nothing else is available', () => {
    expect(resolveCreateTaskStartCentre({ search: '' })).toEqual(LONDON)
    expect(
      resolveCreateTaskStartCentre({ search: '', geolocated: null }),
    ).toEqual(LONDON)
    expect(
      resolveCreateTaskStartCentre({
        search: '',
        geolocated: { lat: Number.NaN, lng: 0 },
      }),
    ).toEqual(LONDON)
  })
})
