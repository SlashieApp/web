'use client'

import { Heading } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

import { TASK_CREATE_CATEGORY_OPTIONS } from '@/app/(task)/helpers/taskCategories'
import { FormField, Input, SectionCard, Select, Textarea } from '@ui'
import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'

export type CreateTaskBasicsSectionProps = {
  register: UseFormRegister<CreateTaskFormFieldValues>
  fieldErrors?: {
    title?: string
    category?: string
    description?: string
  }
}

export function CreateTaskBasicsSection({
  register,
  fieldErrors,
}: CreateTaskBasicsSectionProps) {
  return (
    <SectionCard
      bodyGap={5}
      header={
        <Heading size="lg" color="primary.700">
          1. Task basics
        </Heading>
      }
    >
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
          color: 'formLabelMuted',
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
    </SectionCard>
  )
}
