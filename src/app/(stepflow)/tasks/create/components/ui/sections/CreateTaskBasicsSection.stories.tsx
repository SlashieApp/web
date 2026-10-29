import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { expect, within } from 'storybook/test'

import {
  expectAddRow,
  expectGaps,
  expectLineUnder,
  expectPieces,
  fieldByLabel,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'
import { expectField } from '@/ui/Modal/taskDialogSpacing.testing'
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

/**
 * Form spacing (FE-481): the fields are 20 apart, each label 8 above its
 * control. The categories field is one composite control: its tags, the add row
 * and the suggestions are 8 apart, the tags 8 apart, the input and Add 12 apart
 * and 48 tall, the suggestions' heading 8 above them, and its helper 4 under it.
 */
export const Spacing: Story = {
  args: {
    initialCategories: ['Plumbing', 'Dog walking'],
    defaultValues: filled,
  },
  play: async ({ canvasElement }) => {
    const title = fieldByLabel(canvasElement, /Task title/)
    const categories = fieldByLabel(canvasElement, /Categories/)
    const description = fieldByLabel(canvasElement, /Description/)
    await expectGaps([title, categories, description], formSpace.fieldGap)
    await expectField(title)
    await expectField(description, null)

    const { control, pieces } = await expectPieces(categories)
    const [tags, row, suggestions] = pieces
    await expectGaps([...tags.children], formSpace.alternativesGap)
    await expectAddRow(row)
    await expectGaps([...suggestions.children], formSpace.labelToControl)
    await expectLineUnder(control, categories, /Tap a suggestion/)
  },
}
