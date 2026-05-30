import { z } from 'zod'

import { TaskContactMethod, type UpdateMyProfileInput } from '@codegen/schema'

/** Fields backed by `updateMyProfile`. Phone is managed separately on Account. */
export const profileApiFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Please enter a display name shown on your profile.'),
  /** `yyyy-mm-dd` from a native date input, or empty when unset. */
  dateOfBirth: z.string(),
  defaultPreferredContactMethod: z.nativeEnum(TaskContactMethod),
})

export type ProfileApiFormValues = z.infer<typeof profileApiFormSchema>

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
