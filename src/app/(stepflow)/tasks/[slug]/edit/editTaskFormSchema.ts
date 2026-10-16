import { z } from 'zod'

import {
  refineTaskSchedule,
  taskDetailsFields,
} from '@/app/(stepflow)/tasks/create/createTaskFormSchema'

/**
 * Create's fields and timing rules, without the contact method: the API
 * doesn't say which one the task has, so edit only sends a new choice.
 */
const { preferredContactMethod: _, ...editFields } = taskDetailsFields

export const editTaskFormSchema = z
  .object(editFields)
  .superRefine(refineTaskSchedule)

export type EditTaskFormValues = z.infer<typeof editTaskFormSchema>
export type EditTaskFormFieldValues = z.input<typeof editTaskFormSchema>
