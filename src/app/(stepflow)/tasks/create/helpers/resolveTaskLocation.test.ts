import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  TASK_LOCATION_GEOCODE_ERROR,
  TASK_LOCATION_MISSING_ERROR,
  resolveSubmittedTaskLocation,
  taskLocationGeocodeQuery,
} from './resolveTaskLocation'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('taskLocationGeocodeQuery', () => {
  it('prefers the street address over the map label', () => {
    expect(taskLocationGeocodeQuery('  Bushey WD23 ', 'London')).toBe(
      'Bushey WD23',
    )
    expect(taskLocationGeocodeQuery('', ' Watford ')).toBe('Watford')
  })
})

describe('resolveSubmittedTaskLocation', () => {
  it('keeps coordinates the poster chose, including the map preview centre', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await resolveSubmittedTaskLocation({
      streetAddress: 'Somewhere else',
      mapPlaceName: 'London',
      locationLat: '51.5074',
      locationLng: '-0.1278',
      pinChosen: true,
      accessToken: 'token',
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result).toEqual({
      ok: true,
      location: { lat: 51.5074, lng: -0.1278, placeName: 'London' },
    })
  })

  it('geocodes the address when the pin was never chosen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(url).toContain(encodeURIComponent('Bushey'))
        return {
          ok: true,
          json: async () => ({
            features: [
              {
                center: [-0.3604, 51.643],
                place_name: 'Bushey, Hertfordshire',
              },
            ],
          }),
        }
      }),
    )

    const result = await resolveSubmittedTaskLocation({
      streetAddress: 'Bushey',
      mapPlaceName: 'London',
      locationLat: '51.5074',
      locationLng: '-0.1278',
      pinChosen: false,
      accessToken: 'token',
    })

    expect(result).toEqual({
      ok: true,
      location: {
        lat: 51.643,
        lng: -0.3604,
        placeName: 'London',
      },
    })
  })

  it('blocks publish when the place cannot be found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ features: [] }) })),
    )

    const result = await resolveSubmittedTaskLocation({
      streetAddress: 'not a place',
      mapPlaceName: '',
      locationLat: '',
      locationLng: '',
      pinChosen: false,
      accessToken: 'token',
    })

    expect(result).toEqual({ ok: false, error: TASK_LOCATION_GEOCODE_ERROR })
  })

  it('blocks publish when there is nothing to geocode', async () => {
    const result = await resolveSubmittedTaskLocation({
      streetAddress: '  ',
      mapPlaceName: '',
      locationLat: '',
      locationLng: '',
      pinChosen: false,
      accessToken: 'token',
    })
    expect(result).toEqual({ ok: false, error: TASK_LOCATION_MISSING_ERROR })
  })
})
