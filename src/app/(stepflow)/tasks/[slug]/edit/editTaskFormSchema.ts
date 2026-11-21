import { z } from 'zod'

import {
  refineTaskBudget,
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
  .superRefine((data, ctx) => {
    refineTaskSchedule(data, ctx)
    refineTaskBudget(data, ctx)
  })

export type EditTaskFormValues = z.infer<typeof editTaskFormSchema>
export type EditTaskFormFieldValues = z.input<typeof editTaskFormSchema>
