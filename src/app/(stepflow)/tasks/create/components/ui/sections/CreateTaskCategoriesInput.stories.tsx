import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import {
  createTaskStoryErrors,
  withPopularCategories,
} from '../../createTaskStoryFixtures'
import {
  CreateTaskCategoriesInput,
  type CreateTaskCategoriesInputProps,
} from './CreateTaskCategoriesInput'

function ControlledCategories(
  props: Omit<CreateTaskCategoriesInputProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return (
    <CreateTaskCategoriesInput {...props} value={value} onChange={setValue} />
  )
}

const meta = {
  title: 'Create task/CreateTaskCategoriesInput',
  component: CreateTaskCategoriesInput,
  parameters: { layout: 'padded' },
  decorators: [
    withPopularCategories(),
    (Story) => (
      <Box maxW="560px">
        <Story />
      </Box>
    ),
  ],
  render: (args) => <ControlledCategories {...args} />,
  args: { value: [], onChange: () => {} },
} satisfies Meta<CreateTaskCategoriesInputProps>

export default meta
type Story = StoryObj<typeof meta>

const NINE = [
  'Plumbing',
  'Painting',
  'Tiling',
  'Carpentry',
  'Cleaning',
  'Moving',
  'Repairs',
  'Assembly',
  'Gardening',
]

/** Empty: popular categories first, then the starter list, as suggestions. */
export const Empty: Story = {}

/** Nothing popular yet: only the starter suggestions are offered. */
export const StarterSuggestionsOnly: Story = {
  decorators: [withPopularCategories([])],
}

/** Three chosen: they show as removable chips and leave the suggestions. */
export const WithCategories: Story = {
  args: { value: ['Plumbing', 'Dog walking', 'Handyman'] },
}

/** A category near the 64 character limit wraps inside its chip. */
export const LongCategory: Story = {
  args: {
    value: ['Dog walking and pet sitting while the owners are away this week'],
  },
}

/** Ten chosen: the field, Add button and suggestions are all gone. */
export const AtCap: Story = {
  args: { value: [...NINE, 'Decorating'] },
}

/** Publish pressed with none chosen: the real required message shows. */
export const Required: Story = {
  args: { errorText: createTaskStoryErrors().categories },
}

/** A category over 64 characters is refused with a message. */
export const TooLong: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByRole('textbox', { name: /add a category/i }),
      `${'a'.repeat(65)}{Enter}`,
    )
    await expect(canvas.getByText(/under 64 characters/i)).toBeVisible()
  },
}

/** Pasting two when only one slot is left adds one and warns about the cap. */
export const TooMany: Story = {
  args: { value: NINE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('textbox', { name: /add a category/i }),
    )
    await userEvent.paste('Decorating, Roofing')
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByText(/up to 10 categories/i)).toBeVisible()
  },
}
