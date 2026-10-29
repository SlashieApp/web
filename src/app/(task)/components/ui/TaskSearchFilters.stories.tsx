import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'
import { gapBelow, gapBeside, heightOf } from '@/ui/FormField/formGap.testing'

import { browseDatePresetRange } from '../../helpers/taskBrowseHelpers'
import { withTaskBrowseStory } from '../../helpers/taskBrowseStoryDecorator'
import { TaskSearchFilters } from './TaskSearchFilters'

const meta = {
  title: 'Tasks/TaskSearchFilters',
  component: TaskSearchFilters,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskSearchFilters>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing applied: the Date and Budget chips, both closed. */
export const Default: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Date' })
    await canvas.findByRole('button', { name: 'Budget' })
  },
}

/** The Date chip is open: Today, This week and Pick dates. */
export const DatePanel: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Date' }))
    await canvas.findByRole('button', { name: 'Today' })
    await canvas.findByRole('button', { name: 'This week' })
  },
}

/** Pick dates: the From and To date fields appear. */
export const PickDates: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Date' }))
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Pick dates' }),
    )
    await canvas.findByLabelText('From')
    await canvas.findByLabelText('To')
  },
}

/** The Budget chip is open: Min and Max pound fields. */
export const BudgetPanel: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Budget' }))
    await canvas.findByLabelText('Min (£)')
    await canvas.findByLabelText('Max (£)')
  },
}

/** A minimum above the maximum: the panel explains why nothing is applied. */
export const BudgetInvalid: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Budget' }))
    await userEvent.type(await canvas.findByLabelText('Min (£)'), '200')
    await userEvent.type(await canvas.findByLabelText('Max (£)'), '50')
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'The minimum is above the maximum.',
    )
  },
}

/** A custom date range: the chip shows the range and the panel has both days. */
export const CustomDateRange: Story = {
  decorators: [
    withTaskBrowseStory({
      dateFilter: { preset: 'custom', from: '2030-06-10', to: '2030-06-20' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: /10 Jun/ }))
    expect(await canvas.findByLabelText('From')).toHaveValue('2030-06-10')
    expect(canvas.getByLabelText('To')).toHaveValue('2030-06-20')
  },
}

/** Date and Budget applied: the chips turn green with an ×, plus Clear all. */
export const WithActiveFilters: Story = {
  decorators: [
    withTaskBrowseStory({
      dateFilter: browseDatePresetRange('week'),
      budget: { min: '50', max: '200' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Remove Date filter' })
    await canvas.findByRole('button', { name: 'Remove Budget filter' })
    await canvas.findByRole('button', { name: 'Clear all' })
  },
}

/**
 * Form spacing (FE-481): the Date panel is a small form. The presets and the
 * From and To fields are 20 apart, each label is 8 above its field (48 tall),
 * From and To sit 12 apart, and the panel keeps its 12 padding.
 */
export const DatePanelSpacing: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Date' }))
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Pick dates' }),
    )
    const panel = await canvas.findByRole('group', { name: 'Date' })
    const presets = canvas.getByRole('button', { name: 'Today' })
      .parentElement as HTMLElement
    const from = canvas.getByLabelText('From')
    const to = canvas.getByLabelText('To')
    const shell = (input: HTMLElement) => input.parentElement as HTMLElement
    const label = (name: string) =>
      canvas.getByText(name, { selector: 'label' })

    // Presets row to the fields: one field gap.
    await expect(gapBelow(presets, label('From'))).toBe(formSpace.fieldGap)
    for (const [name, input] of [
      ['From', from],
      ['To', to],
    ] as const) {
      await expect(gapBelow(label(name), shell(input))).toBe(
        formSpace.labelToControl,
      )
      await expect(heightOf(shell(input))).toBe(formSpace.controlHeight)
    }
    await expect(gapBeside(shell(from), shell(to))).toBe(formSpace.inlineGap)
    // The choices in the row are 8 apart.
    const [today, week] = [...presets.children] as HTMLElement[]
    await expect(gapBeside(today as Element, week as Element)).toBe(
      formSpace.alternativesGap,
    )
    // 12 of padding and the 1px border around the panel's content.
    const inner = panel.getBoundingClientRect()
    await expect(
      Math.round(presets.getBoundingClientRect().top - inner.top),
    ).toBe(13)
  },
}

/** Before a range is picked, the presets are the panel: nothing but the row, no extra space under it. */
export const DatePanelPresetsOnly: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Date' }))
    const panel = await canvas.findByRole('group', { name: 'Date' })
    const presets = canvas.getByRole('button', { name: 'Today' })
      .parentElement as HTMLElement
    await expect(
      Math.round(
        panel.getBoundingClientRect().bottom -
          presets.getBoundingClientRect().bottom,
      ),
    ).toBe(13)
  },
}

/**
 * Form spacing (FE-481): Min and Max are one row, 12 apart, each label 8 above
 * its field (48 tall). The explanation of a range that cannot apply sits 4
 * under the row, on the compact line.
 */
export const BudgetPanelSpacing: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Budget' }))
    const min = await canvas.findByLabelText('Min (£)')
    const max = canvas.getByLabelText('Max (£)')
    const shell = (input: HTMLElement) => input.parentElement as HTMLElement
    for (const [name, input] of [
      ['Min (£)', min],
      ['Max (£)', max],
    ] as const) {
      await expect(
        gapBelow(canvas.getByText(name, { selector: 'label' }), shell(input)),
      ).toBe(formSpace.labelToControl)
      await expect(heightOf(shell(input))).toBe(formSpace.controlHeight)
    }
    await expect(gapBeside(shell(min), shell(max))).toBe(formSpace.inlineGap)

    await userEvent.type(min, '200')
    await userEvent.type(max, '50')
    const row = (min.closest('[data-scope="field"]') as HTMLElement)
      .parentElement as HTMLElement
    const alert = await canvas.findByRole('alert')
    await expect(gapBelow(row, alert)).toBe(formSpace.controlToHelper)
    // The compact 20px line, so the 4 reads as 4.
    await expect(heightOf(alert)).toBe(20)
  },
}
