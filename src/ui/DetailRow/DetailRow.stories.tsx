import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  LuCalendar,
  LuMapPin,
  LuPoundSterling,
  LuTag,
  LuWrench,
} from 'react-icons/lu'

import { Badge } from '../Badge/Badge'
import { Card } from '../Card/Card'
import { DetailRow } from './DetailRow'

const meta = {
  title: 'ui/DetailRow',
  component: DetailRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    icon: <LuMapPin />,
    label: 'Location',
    children: 'Westminster, London',
  },
} satisfies Meta<typeof DetailRow>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithSubLine: Story = {
  args: {
    icon: <LuCalendar />,
    label: 'When',
    children: 'Flexible',
    subLine: 'Preferred timing',
  },
}

/** As used in the Task details card: stacked rows with dividers + rich values. */
export const TaskDetailsCard: Story = {
  render: () => (
    <Card layout="section" heading="Task details" maxW="520px">
      <Stack gap={0}>
        <DetailRow icon={<LuWrench />} label="Task" withDivider>
          [SEED] Fix leaking kitchen tap
        </DetailRow>
        <DetailRow icon={<LuMapPin />} label="Location" withDivider>
          Westminster, London
        </DetailRow>
        <DetailRow icon={<LuTag />} label="Category" withDivider>
          Plumbing
        </DetailRow>
        <DetailRow
          icon={<LuCalendar />}
          label="When"
          subLine="Preferred timing"
          withDivider
        >
          Flexible
        </DetailRow>
        <DetailRow icon={<LuPoundSterling />} label="Budget">
          <span
            style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
          >
            £80
            <Badge variant="success">Fixed price</Badge>
          </span>
        </DetailRow>
      </Stack>
    </Card>
  ),
}
