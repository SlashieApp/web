import { z } from 'zod'

import { createTaskFormSchema } from '../create/createTaskFormSchema'

export const editTaskFormSchema = createTaskFormSchema.extend({
  acceptedWorkerCap: z.coerce
    .number()
    .int('Worker cap must be a whole number.')
    .min(1, 'Worker cap must be at least 1.'),
})

export type EditTaskFormValues = z.infer<typeof editTaskFormSchema>
export type EditTaskFormFieldValues = z.input<typeof editTaskFormSchema>
