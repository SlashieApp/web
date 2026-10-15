import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import {
  CURRENT_LOCATION_LABEL,
  URL_SEEDED_AREA_LABEL,
} from '../../../helpers/browseReferenceLocation'
import { withTaskBrowseStory } from '../../../helpers/taskBrowseStoryDecorator'
import {
  storyBrowseTask,
  storyBrowseTaskPage,
  storyBrowseTasks,
} from '../../../helpers/taskBrowseStoryFixtures'
import { SearchResultsListTitle } from './SearchResultsListTitle'

const meta = {
  title: 'Search/SearchResultsListTitle',
  component: SearchResultsListTitle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SearchResultsListTitle>

export default meta
type Story = StoryObj<typeof meta>

/** Several results around the default centre: "5 tasks near London". */
export const Results: Story = {
  decorators: [withTaskBrowseStory({ tasks: storyBrowseTasks })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      name: '5 tasks near London',
    })
  },
}

/** First page loading: a skeleton line instead of a count. */
export const Loading: Story = {
  decorators: [withTaskBrowseStory({ query: 'loading' })],
}

/** One result reads in the singular: "1 task near London". */
export const SingleResult: Story = {
  decorators: [withTaskBrowseStory({ tasks: [storyBrowseTask()] })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      name: '1 task near London',
    })
  },
}

/** Nothing found: "0 tasks near London". */
export const NoResults: Story = {
  decorators: [withTaskBrowseStory({ tasks: [] })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      name: '0 tasks near London',
    })
  },
}

/** A full page of results with more to load: the count reads "100+". */
export const HasMore: Story = {
  decorators: [withTaskBrowseStory({ tasks: storyBrowseTaskPage() })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      name: '100+ tasks near London',
    })
  },
}

/** Centred on a place the visitor searched for or panned to. */
export const NearPlace: Story = {
  decorators: [
    withTaskBrowseStory({
      initialState: {
        reference: {
          lat: 51.539,
          lng: -0.1426,
          label: 'Camden',
          source: 'manual',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      name: '5 tasks near Camden',
    })
  },
}

/** Centred on the visitor's own location: "near you". */
export const NearYou: Story = {
  decorators: [
    withTaskBrowseStory({
      initialState: {
        reference: {
          lat: 51.5362,
          lng: -0.1033,
          label: CURRENT_LOCATION_LABEL,
          source: 'geolocation',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      name: '5 tasks near you',
    })
  },
}

/** Centred on a shared link whose place name is not resolved: "this area". */
export const NearSharedArea: Story = {
  decorators: [
    withTaskBrowseStory({
      // With a token the place name is looked up and replaces "Shared area".
      withoutMapToken: true,
      initialState: {
        reference: {
          lat: 51.5362,
          lng: -0.1033,
          label: URL_SEEDED_AREA_LABEL,
          source: 'manual',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      name: '5 tasks near this area',
    })
  },
}
