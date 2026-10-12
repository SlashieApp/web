import { afterEach, describe, expect, it, vi } from 'vitest'

import { mapboxForwardGeocode } from './mapboxGeocode'

function stubFetch() {
  const fetchMock = vi.fn(async (_url: string) => ({
    ok: true,
    json: async () => ({
      features: [{ center: [-0.29, 51.72], place_name: '11 High Street' }],
    }),
  }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('mapboxForwardGeocode', () => {
  it('keeps results in the UK, so "11 High Street" is not Australia', async () => {
    const fetchMock = stubFetch()
    await mapboxForwardGeocode('11 High Street', 'token')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('country=gb')
  })

  it('prefers matches near a given point (the pin or map centre)', async () => {
    const fetchMock = stubFetch()
    await mapboxForwardGeocode('11 High Street', 'token', {
      proximity: { lat: 51.645, lng: -0.36 },
    })
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      'proximity=-0.36,51.645',
    )
  })
})
