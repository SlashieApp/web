'use client'

import { useEffect, useState } from 'react'

import { mapboxReverseGeocodeArea } from '@/utils/mapboxGeocode'
import { stripStreetFromPlaceName } from '@/utils/taskLocationDisplay'

/**
 * The public place name stored on a task (FE-70): the town or locality at
 * the pin, never a street. The map's own label can be a full street
 * address, and the API shows the stored name to everyone. Falls back to
 * the label with street numbers and postcodes removed.
 */
export async function resolvePublicAreaName(input: {
  lat: number
  lng: number
  fallbackLabel: string
  accessToken: string | undefined
}): Promise<string> {
  const token = input.accessToken?.trim()
  if (token && Number.isFinite(input.lat) && Number.isFinite(input.lng)) {
    try {
      const area = await mapboxReverseGeocodeArea(input.lat, input.lng, token)
      if (area) return area
    } catch {
      // Network or Mapbox error: use the stripped label below.
    }
  }
  return stripStreetFromPlaceName(input.fallbackLabel)
}

const AREA_LOOKUP_DELAY_MS = 400

/** Live area name for the pin (for the "Workers will see" chip). */
export function usePublicTaskArea(
  lat: string,
  lng: string,
  accessToken: string | undefined,
): string {
  const [area, setArea] = useState('')

  useEffect(() => {
    const latNum = Number.parseFloat(lat)
    const lngNum = Number.parseFloat(lng)
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      setArea('')
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      void resolvePublicAreaName({
        lat: latNum,
        lng: lngNum,
        fallbackLabel: '',
        accessToken,
      }).then((name) => {
        if (!cancelled) setArea(name)
      })
    }, AREA_LOOKUP_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [accessToken, lat, lng])

  return area
}
