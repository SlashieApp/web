'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formHelperTextStyle } from '@/theme/styles'
import { mapboxForwardGeocode } from '@/utils/mapboxGeocode'
import { townOnly } from '@/utils/taskLocationDisplay'
import { FormField, FormStack, Input, MapCard, formControlRootProps } from '@ui'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import { workerSetupErrorText } from '../../../helpers/workerSetupValidation'
import bag from '../../../i11n.json'

type Preview = { lat: number; lng: number; placeName: string }

/**
 * Town or postcode, with an approximate-area map and the town customers will
 * see (the API keeps the town only). The preview looks the place up on blur;
 * Continue resolves it again to save.
 *
 * Form spacing (FE-481): the field and the map preview are field groups,
 * `fieldGap` (20) apart; the preview's caption is `controlToHelper` (4) under
 * the map, on the compact helper line.
 */
export function WorkerSetupAreaLocationInput() {
  const t = useI11n(bag)
  const { form, patchForm, fieldErrors } = useWorkerSetup()
  const [preview, setPreview] = useState<Preview | null>(null)
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const point =
    form.locationLat != null && form.locationLng != null
      ? { lat: form.locationLat, lng: form.locationLng }
      : preview
  const town = townOnly(preview?.placeName, form.locationName)

  const lookUpPreview = () => {
    const token = accessToken?.trim()
    const label = form.locationName.trim()
    if (!token || label.length < 2) return
    void mapboxForwardGeocode(label, token)
      .then((hit) => setPreview(hit))
      .catch(() => setPreview(null))
  }

  return (
    <FormStack>
      <FormField
        label={t.area.label}
        helperText={t.area.helper}
        errorText={workerSetupErrorText(t.errors, fieldErrors.locationName)}
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
          placeholder={t.area.placeholder}
          autoComplete="address-level2"
          rootProps={formControlRootProps}
        />
      </FormField>
      {point ? (
        <Stack gap="form.controlToHelper">
          <MapCard
            accessToken={accessToken}
            lat={point.lat}
            lng={point.lng}
            height="160px"
            variant="approximate"
          />
          <Text {...formHelperTextStyle} px={1}>
            {town ? formatMessage(t.area.shownAs, { town }) : t.area.mapCaption}
          </Text>
        </Stack>
      ) : null}
    </FormStack>
  )
}
