'use client'

import type { UseFormRegister } from 'react-hook-form'

import { useI11n } from '@/i18n/useI11n'
import { FormField, Input, Textarea } from '@ui'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'
import { CreateTaskCategoriesInput } from './CreateTaskCategoriesInput'

export type CreateTaskBasicsSectionProps = {
  /** Bare inside the create flow's step; a titled section on edit. */
  bare?: boolean
  sectionHeading?: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  /** Tag-style categories (FE-211); not a registered input. */
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
  /** Copy keys from the form schema. */
  fieldErrors?: {
    title?: string
    categories?: string
    description?: string
  }
}

/** Title, categories and description. */
export function CreateTaskBasicsSection({
  bare = false,
  sectionHeading = '',
  register,
  categories,
  onCategoriesChange,
  fieldErrors,
}: CreateTaskBasicsSectionProps) {
  const t = useI11n(bag)
  const f = t.fields

  return (
    <CreateTaskSection bare={bare} heading={sectionHeading}>
      <FormField
        label={f.title}
        required
        errorText={taskFieldError(t.errors, fieldErrors?.title)}
      >
        <Input {...register('title')} placeholder={f.titlePlaceholder} />
      </FormField>

      <CreateTaskCategoriesInput
        value={categories}
        onChange={onCategoriesChange}
        errorText={fieldErrors?.categories}
      />

      <FormField
        label={f.description}
        required
        errorText={taskFieldError(t.errors, fieldErrors?.description)}
      >
        <Textarea
          {...register('description')}
          placeholder={f.descriptionPlaceholder}
          rows={4}
        />
      </FormField>
    </CreateTaskSection>
  )
}
