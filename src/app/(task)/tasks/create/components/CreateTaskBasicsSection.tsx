'use client'

import { Heading } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

import { TASK_CREATE_CATEGORY_OPTIONS } from '@/app/(task)/helpers/taskCategories'
import { Card, FormField, Input, Select, Textarea } from '@ui'
import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'

export type CreateTaskBasicsSectionProps = {
  /** Card header text (the stepped create flow drops the legacy numbering). */
  sectionHeading?: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  fieldErrors?: {
    title?: string
    category?: string
    description?: string
  }
}

export function CreateTaskBasicsSection({
  sectionHeading = '1. Task basics',
  register,
  fieldErrors,
}: CreateTaskBasicsSectionProps) {
  return (
    <Card
      layout="section"
      bodyGap={5}
      header={
        <Heading size="lg" color="text.link">
          {sectionHeading}
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
    </Card>
  )
}
