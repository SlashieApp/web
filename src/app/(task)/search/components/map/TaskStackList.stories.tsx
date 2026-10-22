import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

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
  title: 'Search/TaskStackList',
  component: TaskStackList,
  parameters: { layout: 'fullscreen' },
  args: {
    stack: { taskIds: ['t1', 't2', 't3'], x: 420, y: 420 },
    tasks,
    isDesktop: true,
    onSelect: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof TaskStackList>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop, cluster low on the map: the card opens above it. */
export const Desktop: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /Mount a 55" TV/ }),
    )
    await expect(args.onSelect).toHaveBeenCalledWith('t2')
    await expect(args.onClose).toHaveBeenCalled()
  },
}

/** Desktop, cluster near the top of the map: the card opens below it. */
export const DesktopBelowCluster: Story = {
  args: { stack: { taskIds: ['t1', 't2', 't3'], x: 420, y: 140 } },
}

/** Desktop, cluster at the left edge: the card stays inside the window. */
export const DesktopNearEdge: Story = {
  args: { stack: { taskIds: ['t1', 't2', 't3'], x: 24, y: 420 } },
}

/** Phone: the same list as a bottom sheet, with the task titles starting on the sheet title's left edge. */
export const Mobile: Story = {
  args: { isDesktop: false },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body)
    const dialog = await sheet.findByRole('dialog')
    const row = await sheet.findByRole('button', {
      name: /Assemble a wardrobe/,
    })
    const title = within(dialog).getByRole('heading')
    const taskTitle = within(row).getByText(/Assemble a wardrobe/)
    expect(
      Math.abs(
        taskTitle.getBoundingClientRect().left -
          title.getBoundingClientRect().left,
      ),
    ).toBeLessThanOrEqual(0.5)
  },
}

/** No cluster is open: nothing renders. */
export const Closed: Story = {
  args: { stack: null },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/** Filters removed every task in the cluster: the card closes itself. */
export const FilteredOut: Story = {
  args: { stack: { taskIds: ['gone-1', 'gone-2'], x: 420, y: 420 } },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('dialog')).toBeNull()
  },
}
