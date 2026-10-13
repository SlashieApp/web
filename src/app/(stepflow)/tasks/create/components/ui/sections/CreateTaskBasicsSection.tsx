'use client'

import type { UseFormRegister } from 'react-hook-form'

import { FormField, Input, Textarea } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'
import { CreateTaskCategoriesInput } from './CreateTaskCategoriesInput'

export type CreateTaskBasicsSectionProps = {
  /** Bare mode for the stepped create flow (no Card/heading). */
  bare?: boolean
  /** Card header text (card mode only). */
  sectionHeading?: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  /** Tag-style categories (FE-211); not a registered input. */
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
  fieldErrors?: {
    title?: string
    categories?: string
    description?: string
  }
}

export function CreateTaskBasicsSection({
  bare = false,
  sectionHeading = '1. Task basics',
  register,
  categories,
  onCategoriesChange,
  fieldErrors,
}: CreateTaskBasicsSectionProps) {
  return (
    <CreateTaskSection bare={bare} heading={sectionHeading} bodyGap={5}>
      <FormField label="Task title" errorText={fieldErrors?.title}>
        <Input
          {...register('title')}
          placeholder="e.g., Fix leaking pipe in master bathroom"
        />
      </FormField>

      <CreateTaskCategoriesInput
        value={categories}
        onChange={onCategoriesChange}
        errorText={fieldErrors?.categories}
      />

      <FormField label="Description" errorText={fieldErrors?.description}>
        <Textarea
          {...register('description')}
          placeholder="Describe the specific problem or work needed..."
          rows={4}
        />
      </FormField>
    </CreateTaskSection>
  )
}
