import { z } from 'zod'

import { TaskContactMethod, type UpdateMyProfileInput } from '@codegen/schema'

import { isAtLeast18, parseIsoDateOnly } from '@/utils/age'

export type ProfileFormErrors = {
  displayName: string
  dateOfBirth: string
  under18: string
}

/** Fields backed by `updateMyProfile`; errors in the page's language. */
export function createProfileApiFormSchema(errors: ProfileFormErrors) {
  return z.object({
    displayName: z.string().trim().min(1, errors.displayName),
    /** `yyyy-mm-dd` from a native date input, or empty when unset. */
    dateOfBirth: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || parseIsoDateOnly(value) !== null,
        errors.dateOfBirth,
      )
      .refine((value) => value === '' || isAtLeast18(value), errors.under18),
    defaultPreferredContactMethod: z.nativeEnum(TaskContactMethod),
  })
}

export type ProfileApiFormValues = z.infer<
  ReturnType<typeof createProfileApiFormSchema>
>

/** `Date` (DateTime) → `yyyy-mm-dd` for a native date input. */
export function dateInputValueFromIso(iso: unknown): string {
  const d =
    typeof iso === 'string' || typeof iso === 'number'
      ? new Date(iso)
      : iso instanceof Date
        ? iso
        : null
  if (!d || Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function profileFormToMutationInput(
  values: ProfileApiFormValues,
): UpdateMyProfileInput {
  const dob = values.dateOfBirth.trim()
  return {
    name: values.displayName.trim(),
    dateOfBirth:
      dob === '' ? undefined : new Date(`${dob}T00:00:00.000Z`).toISOString(),
    defaultPreferredContactMethod: values.defaultPreferredContactMethod,
  }
}
