'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { mapboxForwardGeocode } from '@/utils/mapboxGeocode'
import { FormField, Input, MapCard, formControlRootProps } from '@ui'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'

/**
 * Service-area step (FE-70): the area field plus an approximate-area map
 * preview, so it is clear customers see a circle, not an address. The
 * preview geocodes on blur for display only; saving still resolves the
 * place when the worker continues.
 */
export function WorkerSetupAreaLocationInput() {
  const { form, patchForm, fieldErrors } = useWorkerSetup()
  const [preview, setPreview] = useState<{ lat: number; lng: number } | null>(
    null,
  )
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const point =
    form.locationLat != null && form.locationLng != null
      ? { lat: form.locationLat, lng: form.locationLng }
      : preview

  const lookUpPreview = () => {
    const token = accessToken?.trim()
    const label = form.locationName.trim()
    if (!token || label.length < 2) return
    void mapboxForwardGeocode(label, token)
      .then((hit) => setPreview(hit ? { lat: hit.lat, lng: hit.lng } : null))
      .catch(() => setPreview(null))
  }

  return (
    <Stack gap={3}>
      <FormField
        label="Primary service area"
        helperText="City or postcode where you usually take jobs. Customers see an approximate area around it, never your address."
        errorText={fieldErrors.locationName}
      >
        <Input
          value={form.locationName}
          onChange={(e) => {
            setPreview(null)
            patchForm({
              locationName: e.target.value,
              locationLat: null,
              locationLng: null,
            })
          }}
          onBlur={lookUpPreview}
          placeholder="London or WD17 2AW"
          rootProps={formControlRootProps}
        />
      </FormField>
      {point ? (
        <Stack gap={1.5}>
          <MapCard
            accessToken={accessToken}
            lat={point.lat}
            lng={point.lng}
            height="160px"
            variant="approximate"
          />
          <Text fontSize="xs" color="text.muted">
            Customers see this approximate area on your profile.
          </Text>
        </Stack>
      ) : null}
    </Stack>
  )
}
