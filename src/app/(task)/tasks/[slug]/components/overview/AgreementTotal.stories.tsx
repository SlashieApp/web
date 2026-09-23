import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card } from '@ui'

import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import { AgreementTotal } from './AgreementTotal'

const meta = {
  title: 'task/tasks/overview/AgreementTotal',
  component: AgreementTotal,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AgreementTotal>

export default meta

type Story = StoryObj<typeof meta>

/** Agreed total as the invoice figure on a section card. */
export const Default: Story = {
  args: {
    label: 'Agreed total',
    amount: '£85.00',
  },
  render: (args) => (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow="Your booking"
      heading="Job in progress"
      metric={<AgreementTotal {...args} />}
    />
  ),
}
