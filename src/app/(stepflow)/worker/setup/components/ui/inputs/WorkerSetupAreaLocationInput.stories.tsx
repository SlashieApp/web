import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  withWorkerSetup,
  workerSetupStoryErrors,
  workerSetupStoryForm,
} from '../../workerSetupStoryFixtures'
import { WorkerSetupAreaLocationInput } from './WorkerSetupAreaLocationInput'

const meta: Meta<typeof WorkerSetupAreaLocationInput> = {
  title: 'Worker setup/WorkerSetupAreaLocationInput',
  component: WorkerSetupAreaLocationInput,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="560px">
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const area = { activeSubStep: 'area.location' } as const

/** Empty: no area typed yet, so there is no map preview. */
export const Empty: Story = {
  decorators: [withWorkerSetup({ ...area, form: workerSetupStoryForm() })],
}

/** An area typed but not looked up yet: the preview waits for the field to blur. */
export const AreaTyped: Story = {
  decorators: [
    withWorkerSetup({
      ...area,
      form: workerSetupStoryForm({ locationName: 'Camden, London' }),
    }),
  ],
}

/** Area looked up: the approximate-area map preview and its caption. */
export const WithMapPreview: Story = {
  decorators: [
    withWorkerSetup({
      ...area,
      form: workerSetupStoryForm({
        locationName: 'Camden, London',
        locationLat: 51.539,
        locationLng: -0.1426,
      }),
    }),
  ],
}

/** Continue pressed with no area: the field is flagged as required. */
export const AreaRequired: Story = {
  decorators: [
    withWorkerSetup({
      ...area,
      form: workerSetupStoryForm(),
      fieldErrors: workerSetupStoryErrors('area.location'),
    }),
  ],
}
