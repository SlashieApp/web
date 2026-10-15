import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { CreateTaskBasicsSection } from './CreateTaskBasicsSection'

function CreateTaskBasicsSectionDemo({
  initialCategories = [],
  categoriesError,
}: {
  initialCategories?: string[]
  categoriesError?: string
}) {
  const { register } = useForm<CreateTaskFormFieldValues>()
  const [categories, setCategories] = useState(initialCategories)
  return (
    <CreateTaskBasicsSection
      bare
      register={register}
      categories={categories}
      onCategoriesChange={setCategories}
      fieldErrors={{ categories: categoriesError }}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskBasicsSection',
  component: CreateTaskBasicsSectionDemo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CreateTaskBasicsSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

/** FE-211: no categories yet, suggestions below the input. */
export const Default: Story = {}

export const WithCategories: Story = {
  args: { initialCategories: ['Plumbing', 'Dog walking', 'HANDYMAN'] },
}

export const MissingCategory: Story = {
  args: { categoriesError: 'Add at least one category.' },
}
