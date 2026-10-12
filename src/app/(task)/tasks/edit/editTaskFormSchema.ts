import { z } from 'zod'

import {
  refineTaskSchedule,
  taskDetailsFields,
} from '@/app/(stepflow)/tasks/create/createTaskFormSchema'

export const editTaskFormSchema = z
  .object({
    ...taskDetailsFields,
  })
  .superRefine(refineTaskSchedule)

export type EditTaskFormValues = z.infer<typeof editTaskFormSchema>
export type EditTaskFormFieldValues = z.input<typeof editTaskFormSchema>
