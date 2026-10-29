import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyImage } from '@/app/(stepflow)/stepflowStoryHelpers'

import { expectGaps } from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'
import {
  QUOTE_STORY_MESSAGE,
  quoteStorySlots,
  withQuoteStory,
} from '../../taskQuoteStoryFixtures'
import { TaskQuoteReviewStep } from './TaskQuoteReviewStep'

const meta = {
  title: 'Quote flow/TaskQuoteReviewStep',
  component: TaskQuoteReviewStep,
  parameters: {
    layout: 'padded',
  },
  args: {
    photoUrls: [],
  },
} satisfies Meta<typeof TaskQuoteReviewStep>

export default meta
type Story = StoryObj<typeof meta>

const form = {
  amountPence: '8500',
  message: QUOTE_STORY_MESSAGE,
  slots: quoteStorySlots(),
}

const review = (overrides: Partial<typeof form> = {}) => [
  withQuoteStory({}, { form: { ...form, ...overrides }, maxWidth: '520px' }),
]

/** Everything filled in: price, two proposed times and a message. */
export const Default: Story = { decorators: review() }

/** With photos: a thumbnail row is added under the message. */
export const WithPhotos: Story = {
  args: {
    photoUrls: [
      storyImage('#9ec5e8', 144),
      storyImage('#f0c987', 144),
      storyImage('#7fcfa6', 144),
    ],
  },
  decorators: review(),
}

/** No times proposed: the "Proposed times" section is left out. */
export const NoTimes: Story = { decorators: review({ slots: [] }) }

/** No message written: the message reads "No message". */
export const NoMessage: Story = { decorators: review({ message: '' }) }

/** No price entered: the price reads "No price entered". */
export const NoPrice: Story = { decorators: review({ amountPence: '' }) }

/** A long message keeps its line breaks and wraps. */
export const LongMessage: Story = {
  decorators: review({
    message: `${QUOTE_STORY_MESSAGE}\n\nI can also bring a stud finder, and I will clear up any dust and packaging before I leave.\n\nThanks for considering my quote.`,
  }),
}

/** Form spacing (FE-481): the answers are 20 apart, and each label is 8 above what it says. */
export const Spacing: Story = {
  decorators: review(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rows = [
      canvas.getByText('Your quote').parentElement as HTMLElement,
      canvas.getByText('Proposed times').parentElement as HTMLElement,
      canvas.getByText('Message to customer').parentElement as HTMLElement,
    ]
    await expectGaps(rows, formSpace.fieldGap)
    for (const row of rows) {
      await expectGaps([...row.children].slice(0, 2), formSpace.labelToControl)
    }
    // The proposed times are a list, 8 apart.
    await expectGaps([...(rows[1] as HTMLElement).children].slice(1), 8)
  },
}
