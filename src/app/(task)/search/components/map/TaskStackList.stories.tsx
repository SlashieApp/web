import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { TaskMapTask } from '../../../components/ui/TaskMap'
import { TaskStackList } from './TaskStackList'

const tasks: TaskMapTask[] = [
  {
    id: 't1',
    title: 'Assemble a wardrobe and two bedside tables',
    priceLabel: '£85',
    location: 'Bushey',
  },
  {
    id: 't2',
    title: 'Mount a 55" TV on a plasterboard wall',
    priceLabel: '£60',
    location: 'Bushey',
  },
  {
    id: 't3',
    title: 'Clear guttering on a semi-detached house',
    priceLabel: '£120',
    location: 'Bushey',
  },
]

const meta = {
  title: 'search/map/TaskStackList',
  component: TaskStackList,
  parameters: { layout: 'fullscreen' },
  args: {
    stack: { taskIds: ['t1', 't2', 't3'], x: 420, y: 420 },
    tasks,
    isDesktop: true,
    onSelect: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof TaskStackList>

export default meta
type Story = StoryObj<typeof meta>

/** Card above the cluster on desktop. */
export const Desktop: Story = {}

/** Bottom sheet on mobile. */
export const Mobile: Story = {
  args: { isDesktop: false },
}
