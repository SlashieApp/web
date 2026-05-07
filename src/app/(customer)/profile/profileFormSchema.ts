import { z } from 'zod'

import { TaskContactMethod } from '@codegen/schema'

/** Fields backed by `updateMyProfile`—must match codegen `UpdateMyProfileInput`. */
export const profileApiFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Please enter a display name shown on your profile.'),
  contactNumber: z.string(),
  defaultPreferredContactMethod: z.nativeEnum(TaskContactMethod),
})

export type ProfileApiFormValues = z.infer<typeof profileApiFormSchema>

export function profileFormToMutationInput(values: ProfileApiFormValues): {
  name: string
  contactNumber?: string
  defaultPreferredContactMethod: TaskContactMethod
} {
  const phone = values.contactNumber.trim()
  return {
    name: values.displayName.trim(),
    contactNumber: phone === '' ? undefined : phone,
    defaultPreferredContactMethod: values.defaultPreferredContactMethod,
  }
}
