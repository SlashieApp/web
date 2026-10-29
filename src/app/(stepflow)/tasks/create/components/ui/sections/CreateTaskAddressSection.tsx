'use client'

import { HStack, Stack } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'
import { LuLock, LuMapPin } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, Input } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

export type CreateTaskAddressSectionProps = {
  register: UseFormRegister<CreateTaskFormFieldValues>
  /** The address's error (a copy key) from the form. */
  streetAddressError?: string
  /** The pin's current street address (reverse geocoded); empty until known. */
  pinAddress?: string
  /** Copy the pin's address into Exact address (FE-209). No button without it. */
  onUsePinAddress?: () => void
  /**
   * "Shared only with the worker you accept." under the field, for edit's
   * form. Create's address step says it once, under its title.
   */
  privacyHint?: boolean
}

/**
 * The exact address (FE-70): private, shared only with the worker the
 * poster accepts. "Use pin address" fills it from the pin, only when tapped.
 */
export function CreateTaskAddressSection({
  register,
  streetAddressError,
  pinAddress = '',
  onUsePinAddress,
  privacyHint = false,
}: CreateTaskAddressSectionProps) {
  const copy = useI11n(bag)
  const t = copy.location

  return (
    <FormField
      label={
        <HStack as="span" gap={1.5}>
          <LuLock size={14} aria-hidden />
          {t.addressLabel}
        </HStack>
      }
      required
      helperText={privacyHint ? t.addressHelper : undefined}
      errorText={taskFieldError(copy.errors, streetAddressError)}
    >
      {/* The "Use pin address" button hangs 8 under the field it fills. */}
      <Stack gap="form.alternativesGap">
        <Input
          {...register('streetAddress')}
          placeholder={t.addressPlaceholder}
        />
        {onUsePinAddress ? (
          <Button
            type="button"
            variant="secondary"
            alignSelf="flex-start"
            disabled={!pinAddress.trim()}
            onClick={onUsePinAddress}
          >
            <LuMapPin size={14} aria-hidden />
            {t.usePinAddress}
          </Button>
        ) : null}
      </Stack>
    </FormField>
  )
}
