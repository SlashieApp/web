import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { withTaskBrowseStory } from '../../helpers/taskBrowseStoryDecorator'
import { storyBrowseTasks } from '../../helpers/taskBrowseStoryFixtures'
import { TaskBrowseMapLayer, TaskMap, type TaskMapTask } from './TaskMap'

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const tasks: TaskMapTask[] = storyBrowseTasks.map((task) => ({
  id: task.id,
  title: task.title,
  location: task.location?.name,
  locationLat: task.location?.lat,
  locationLng: task.location?.lng,
  priceLabel: task.budget ? `£${task.budget.amount}` : 'Open',
}))

/** The map fills its parent: give it a sized, positioned box. */
const meta = {
  title: 'Tasks/TaskMap',
  component: TaskMap,
  parameters: { layout: 'padded' },
  args: {
    accessToken: mapboxToken,
    centerLat: 51.5074,
    centerLng: -0.1278,
    radiusMiles: 30,
    tasks,
    // The route to a selected pin comes from the Mapbox directions API.
    navRouteEnabled: false,
  },
  decorators: [
    (Story) => (
      <Box position="relative" w="full" h="480px" overflow="hidden">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskMap>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The map container exists once Mapbox has loaded and made its WebGL context.
 * That is slow on a busy machine, so wait longer than the default second.
 */
async function expectMapContainer(canvasElement: HTMLElement) {
  await waitFor(
    () => expect(canvasElement.querySelector('.mapboxgl-map')).not.toBeNull(),
    { timeout: 15_000 },
  )
}

/** Browsing: a price pin per task and the "You" marker at the search centre. */
export const Browse: Story = {
  play: async ({ canvasElement }) => {
    await expectMapContainer(canvasElement)
  },
}

/** Nothing matches: the map shows only the search centre. */
export const NoTasks: Story = {
  args: { tasks: [] },
  play: async ({ canvasElement }) => {
    await expectMapContainer(canvasElement)
  },
}

/** A task is selected (from a card or a pin): its pin is highlighted. */
export const Selected: Story = {
  args: { selectedTaskId: 'browse-task-2' },
  play: async ({ canvasElement }) => {
    await expectMapContainer(canvasElement)
  },
}

/** Task detail: one pin framed with padding, no search-centre marker. */
export const DetailSolo: Story = {
  args: {
    tasks: tasks.slice(0, 1),
    centerLat: tasks[0].locationLat ?? 51.5074,
    centerLng: tasks[0].locationLng ?? -0.1278,
    radiusMiles: 2,
    cameraMode: 'detail',
    viewPadding: { top: 40, right: 40, bottom: 160, left: 40 },
    selectedTaskId: tasks[0].id,
    showReferenceMarker: false,
    taskPinMode: 'solo',
    mapInteractions: false,
  },
  play: async ({ canvasElement }) => {
    await expectMapContainer(canvasElement)
  },
}

/** Worker search: person pins (initials chip and first name) instead of prices. */
export const PersonPins: Story = {
  args: {
    tasks: [
      {
        ...tasks[0],
        title: 'Jordan Lee',
        priceLabel: 'Jordan',
        pinKind: 'person',
      },
      {
        ...tasks[1],
        title: 'Sam Taylor',
        priceLabel: 'Sam',
        pinKind: 'person',
      },
      {
        ...tasks[2],
        title: 'Maria L.',
        priceLabel: 'Maria',
        pinKind: 'person',
      },
    ],
    navRouteEnabled: false,
  },
  play: async ({ canvasElement }) => {
    await expectMapContainer(canvasElement)
  },
}

/** No Mapbox token configured: a note says which variable to set. */
export const NoToken: Story = {
  args: { accessToken: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN')
  },
}

/** The search page's wiring: pins come from the browse results. */
export const BrowseLayer: Story = {
  render: () => <TaskBrowseMapLayer isDesktop />,
  decorators: [withTaskBrowseStory()],
  parameters: { nextjs: { navigation: { pathname: '/search' } } },
  play: async ({ canvasElement }) => {
    await expectMapContainer(canvasElement)
  },
}
