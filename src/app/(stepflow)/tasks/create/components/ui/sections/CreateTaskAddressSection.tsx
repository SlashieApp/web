'use client'

import { HStack, Stack } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'
import { LuLock, LuMapPin } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, FormStack, Input } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

export type CreateTaskAddressSectionProps = {
  register: UseFormRegister<CreateTaskFormFieldValues>
  /** Field errors (copy keys) from the form. */
  addressErrors?: {
    addressLine1?: string
    city?: string
    postcode?: string
  }
  /** The pin's current address (reverse geocoded); empty until known. */
  pinAddress?: string
  /** Fill the lines from the pin, only when tapped. No button without it. */
  onUsePinAddress?: () => void
  /**
   * "Shared only with the worker you accept." under line 1, for edit's
   * form. Create's address step says it once, under its title.
   */
  privacyHint?: boolean
}

/**
 * The exact address (FE-70): private, shared only with the worker the
 * poster accepts. Line 1, line 2, city, county and postcode. "Use {address}"
 * fills them from the pin, only when tapped.
 */
export function CreateTaskAddressSection({
  register,
  addressErrors,
  pinAddress = '',
  onUsePinAddress,
  privacyHint = false,
}: CreateTaskAddressSectionProps) {
  const copy = useI11n(bag)
  const t = copy.location
  const address = pinAddress.trim()
  const useLabel = address
    ? formatMessage(t.usePinAddress, { address })
    : t.usePinAddressEmpty

  return (
    <Stack gap="form.alternativesGap">
      <FormStack>
        <FormField
          label={
            <HStack as="span" gap={1.5}>
              <LuLock size={14} aria-hidden />
              {t.addressLine1}
            </HStack>
          }
          required
          helperText={privacyHint ? t.addressHelper : undefined}
          errorText={taskFieldError(copy.errors, addressErrors?.addressLine1)}
        >
          <Input
            {...register('addressLine1')}
            placeholder={t.addressLine1Placeholder}
            autoComplete="address-line1"
          />
        </FormField>
        <FormField label={t.addressLine2}>
          <Input
            {...register('addressLine2')}
            placeholder={t.addressLine2Placeholder}
            autoComplete="address-line2"
          />
        </FormField>
        <FormField
          label={t.city}
          required
          errorText={taskFieldError(copy.errors, addressErrors?.city)}
        >
          <Input
            {...register('city')}
            placeholder={t.cityPlaceholder}
            autoComplete="address-level2"
          />
        </FormField>
        <FormField label={t.county}>
          <Input
            {...register('county')}
            placeholder={t.countyPlaceholder}
            autoComplete="address-level1"
          />
        </FormField>
        <FormField
          label={t.postcode}
          required
          errorText={taskFieldError(copy.errors, addressErrors?.postcode)}
        >
          <Input
            {...register('postcode')}
            placeholder={t.postcodePlaceholder}
            autoComplete="postal-code"
            autoCapitalize="characters"
            spellCheck={false}
          />
        </FormField>
      </FormStack>
      {onUsePinAddress ? (
        <Button
          type="button"
          variant="secondary"
          alignSelf="flex-start"
          h="auto"
          minH="form.controlHeight"
          py={2}
          whiteSpace="normal"
          textAlign="left"
          disabled={!address}
          onClick={onUsePinAddress}
        >
          <LuMapPin size={14} aria-hidden />
          {useLabel}
        </Button>
      ) : null}
    </Stack>
  )
}
