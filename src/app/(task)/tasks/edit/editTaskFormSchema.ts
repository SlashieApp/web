import { z } from 'zod'

import {
  refineTaskSchedule,
  taskDetailsFields,
} from '@/app/(stepflow)/tasks/create/createTaskFormSchema'

export const editTaskFormSchema = z
  .object({
    ...taskDetailsFields,
    acceptedWorkerCap: z.coerce
      .number()
      .int('Worker cap must be a whole number.')
      .min(1, 'Worker cap must be at least 1.'),
  })
  .superRefine(refineTaskSchedule)

export type EditTaskFormValues = z.infer<typeof editTaskFormSchema>
export type EditTaskFormFieldValues = z.input<typeof editTaskFormSchema>
