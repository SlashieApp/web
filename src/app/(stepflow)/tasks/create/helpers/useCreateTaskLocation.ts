'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { mapboxReverseGeocode } from '@/utils/mapboxGeocode'

import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'
import {
  type CreateTaskStartCentre,
  resolveCreateTaskStartCentre,
} from './createTaskStartCentre'
import { currentPosition } from './currentPosition'
import { resolveSubmittedTaskLocation } from './resolveTaskLocation'

const UPDATE = { shouldValidate: true, shouldDirty: true } as const

/**
 * The location step's map and address (FE-194, FE-70): the starting centre,
 * current location, the pin and its label, "Use pin address", and turning
 * the pin or the typed address into coordinates before leaving the step.
 * The map's own locate-me button moves the pin through
 * `onLocationLatChange`, or says it failed with `onLocateFailed` (FE-356).
 */
export function useCreateTaskLocation({
  form,
  accessToken,
  startCentre,
  /** A repost or a restored draft already has its place: don't ask for location. */
  skipGeolocation,
  /** A restored draft's pin counts as chosen. */
  initialPinChosen = false,
}: {
  form: Pick<
    UseFormReturn<CreateTaskFormFieldValues>,
    'setValue' | 'getValues' | 'setError' | 'clearErrors'
  >
  accessToken: string | undefined
  startCentre: CreateTaskStartCentre
  skipGeolocation: boolean
  initialPinChosen?: boolean
}) {
  const { setValue, getValues, setError, clearErrors } = form
  /**
   * True after a search, a pin drag, a `/search` or current-location start,
   * or a restored pin. The London camera is never a choice.
   */
  const pinChosenRef = useRef(
    startCentre.source !== 'default' || initialPinChosen,
  )
  const [locateUnavailable, setLocateUnavailable] = useState(false)

  const onMapPlaceNameChange = useCallback(
    (v: string) => setValue('mapPlaceName', v, UPDATE),
    [setValue],
  )

  const onLocationLatChange = useCallback(
    (v: string) => {
      pinChosenRef.current = true
      setLocateUnavailable(false)
      setValue('locationLat', v, UPDATE)
    },
    [setValue],
  )

  const onLocationLngChange = useCallback(
    (v: string) => setValue('locationLng', v, UPDATE),
    [setValue],
  )

  /**
   * Exact address from the pin (FE-209): its street label, copied only on
   * tap so a later pin move never overwrites what the poster typed.
   */
  const onUsePinAddress = useCallback(() => {
    const name = getValues('mapPlaceName').trim()
    if (name) setValue('streetAddress', name, UPDATE)
  }, [getValues, setValue])

  /** Reverse geocode a label for the starting pin, keeping one the poster already has. */
  const labelPin = useCallback(
    (lat: number, lng: number) => {
      const token = accessToken?.trim()
      if (!token) return
      void mapboxReverseGeocode(lat, lng, token)
        .then((name) => {
          if (!name || getValues('mapPlaceName').trim()) return
          setValue('mapPlaceName', name, UPDATE)
        })
        .catch(() => undefined)
    },
    [accessToken, getValues, setValue],
  )

  const placePin = useCallback(
    (lat: number, lng: number) => {
      pinChosenRef.current = true
      setLocateUnavailable(false)
      setValue('locationLat', lat.toFixed(6), UPDATE)
      setValue('locationLng', lng.toFixed(6), UPDATE)
      labelPin(lat, lng)
    },
    [labelPin, setValue],
  )

  // A `/search` centre is already the pin (it only needs a label). Otherwise
  // London shows at once and current location replaces it when it arrives,
  // unless the poster has already dragged, searched, or typed.
  useEffect(() => {
    if (startCentre.source !== 'default') {
      labelPin(startCentre.lat, startCentre.lng)
      return
    }
    if (skipGeolocation) return
    let cancelled = false
    void currentPosition(false).then((geolocated) => {
      if (cancelled) return
      const touched =
        pinChosenRef.current || Boolean(getValues('mapPlaceName').trim())
      if (!geolocated) {
        if (!touched) setLocateUnavailable(true)
        return
      }
      if (touched) return
      const start = resolveCreateTaskStartCentre({ search: '', geolocated })
      if (start.source === 'geolocation') placePin(start.lat, start.lng)
    })
    return () => {
      cancelled = true
    }
  }, [getValues, labelPin, placePin, skipGeolocation, startCentre])

  /** Locate-me couldn't tell where the poster is: the hint says so. */
  const onLocateFailed = useCallback(() => setLocateUnavailable(true), [])

  /** Pin or typed address → coordinates. False (with an error) when it can't. */
  const applyResolvedLocation = useCallback(async (): Promise<boolean> => {
    const values = getValues()
    let resolved: Awaited<ReturnType<typeof resolveSubmittedTaskLocation>>
    try {
      resolved = await resolveSubmittedTaskLocation({
        streetAddress: values.streetAddress,
        mapPlaceName: values.mapPlaceName,
        locationLat: values.locationLat,
        locationLng: values.locationLng,
        pinChosen: pinChosenRef.current,
        accessToken,
      })
    } catch {
      setError('mapPlaceName', { message: 'mapUnavailable' })
      return false
    }
    if (!resolved.ok) {
      setError('mapPlaceName', { message: resolved.error })
      return false
    }
    clearErrors(['mapPlaceName', 'locationLat', 'locationLng'])
    setValue('locationLat', String(resolved.location.lat), UPDATE)
    setValue('locationLng', String(resolved.location.lng), UPDATE)
    if (!values.mapPlaceName.trim()) {
      setValue('mapPlaceName', resolved.location.placeName, UPDATE)
    }
    pinChosenRef.current = true
    return true
  }, [accessToken, clearErrors, getValues, setError, setValue])

  return {
    pinChosenRef,
    locateUnavailable,
    onMapPlaceNameChange,
    onLocationLatChange,
    onLocationLngChange,
    onUsePinAddress,
    onLocateFailed,
    applyResolvedLocation,
  }
}
