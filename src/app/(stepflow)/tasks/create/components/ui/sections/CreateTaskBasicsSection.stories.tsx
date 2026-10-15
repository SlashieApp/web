import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import {
  createTaskStoryErrors,
  emptyCreateTaskValues,
  withPopularCategories,
} from '../../createTaskStoryFixtures'
import {
  CreateTaskBasicsSection,
  type CreateTaskBasicsSectionProps,
} from './CreateTaskBasicsSection'

function CreateTaskBasicsSectionDemo({
  initialCategories = [],
  defaultValues,
  ...props
}: Pick<
  CreateTaskBasicsSectionProps,
  'bare' | 'sectionHeading' | 'fieldErrors'
> & {
  initialCategories?: string[]
  defaultValues?: Partial<CreateTaskFormFieldValues>
}) {
  const { register } = useForm<CreateTaskFormFieldValues>({
    defaultValues: { ...emptyCreateTaskValues, ...defaultValues },
  })
  const [categories, setCategories] = useState(initialCategories)
  return (
    <CreateTaskBasicsSection
      {...props}
      register={register}
      categories={categories}
      onCategoriesChange={setCategories}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskBasicsSection',
  component: CreateTaskBasicsSectionDemo,
  parameters: { layout: 'padded' },
  decorators: [withPopularCategories()],
  args: { bare: true },
} satisfies Meta<typeof CreateTaskBasicsSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

const filled = {
  title: 'Fix leaking pipe in master bathroom',
  description:
    'The pipe under the basin has started to drip. I need it replaced and the cupboard checked for water damage. Tools and parts can be supplied.',
}

/** FE-211: nothing entered yet, suggestions below the category input. */
export const Default: Story = {}

/** Categories chosen: they show as chips above the input. */
export const WithCategories: Story = {
  args: { initialCategories: ['Plumbing', 'Dog walking', 'HANDYMAN'] },
}

/** Everything filled in: title, categories and description. */
export const Filled: Story = {
  args: { initialCategories: ['Plumbing'], defaultValues: filled },
}

/** Ten categories chosen: the category input is disabled. */
export const AtCategoryCap: Story = {
  args: {
    initialCategories: [
      'Plumbing',
      'Painting',
      'Tiling',
      'Carpentry',
      'Cleaning',
      'Moving',
      'Repairs',
      'Assembly',
      'Gardening',
      'Decorating',
    ],
  },
}

/** Only the category is missing: its message shows under the field. */
export const MissingCategory: Story = {
  args: {
    defaultValues: filled,
    fieldErrors: { categories: createTaskStoryErrors().categories },
  },
}

/** Continue pressed on an empty step: title, categories and description flagged. */
export const AllRequired: Story = {
  args: { fieldErrors: createTaskStoryErrors() },
}

/** Card mode (edit page): the fields sit in a titled section card. */
export const CardMode: Story = {
  args: { bare: false, initialCategories: ['Plumbing'], defaultValues: filled },
}
