'use client'

import type { UseFormRegister } from 'react-hook-form'

import { TASK_CREATE_CATEGORY_OPTIONS } from '@/app/(task)/helpers/taskCategories'
import { FormField, Input, Select, Textarea } from '@ui'
import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'
import { CreateTaskSection } from './CreateTaskSection'

export type CreateTaskBasicsSectionProps = {
  /** Bare mode for the stepped create flow (no Card/heading). */
  bare?: boolean
  /** Card header text (card mode only). */
  sectionHeading?: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  fieldErrors?: {
    title?: string
    category?: string
    description?: string
  }
}

export function CreateTaskBasicsSection({
  bare = false,
  sectionHeading = '1. Task basics',
  register,
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

      <FormField
        label="Category"
        errorText={fieldErrors?.category}
        helperText="Choose the closest match—workers filter discovery by category."
        helperTextProps={{
          fontSize: 'xs',
          color: 'text.muted',
          mt: 1,
        }}
      >
        <Select {...register('category')}>
          <option value="">Select a category…</option>
          {TASK_CREATE_CATEGORY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>

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
