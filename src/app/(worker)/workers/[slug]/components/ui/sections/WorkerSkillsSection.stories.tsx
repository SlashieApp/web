import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withWorkerProfile } from '../shared/workerProfileStoryDecorator'
import { workerProfileFixture } from '../shared/workerProfileStoryFixtures'
import { WorkerSkillsSection } from './WorkerSkillsSection'

/**
 * Skills card: the first four skills as pills, with "+N more" for the rest.
 * Falls back to the skills a listing card handed over while the profile loads.
 */
const meta = {
  title: 'Worker profile/WorkerSkillsSection',
  component: WorkerSkillsSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkerSkillsSection>

export default meta
type Story = StoryObj<typeof meta>

/** Six skills: four pills and a "+2 more" pill. */
export const Default: Story = {
  decorators: [
    withWorkerProfile({ worker: workerProfileFixture, maxWidth: '720px' }),
  ],
}

/** Four skills or fewer: every pill shows, no "more" pill. */
export const FewSkills: Story = {
  decorators: [
    withWorkerProfile({
      worker: { ...workerProfileFixture, skills: ['Assembly', 'Painting'] },
      maxWidth: '720px',
    }),
  ],
}

/** After tapping "+2 more": all six skills show. */
export const Expanded: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Show 2 more skills' }),
    )
    await expect(await canvas.findByText('Repairs')).toBeVisible()
    await expect(canvas.queryByText('+2 more')).toBeNull()
  },
}

/** Long skill names: each pill takes its own line, and the "more" pill follows the fourth. */
export const LongSkillNames: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        skills: [
          'Furniture assembly and disassembly for moves',
          'Wall mounting for TVs, mirrors and heavy shelving',
          'Interior painting and decorating',
          'Small plumbing repairs and tap replacement',
          'Flat-pack kitchens',
        ],
      },
      maxWidth: '420px',
    }),
  ],
}

/** No skills listed yet. */
export const NoSkills: Story = {
  decorators: [
    withWorkerProfile({
      worker: { ...workerProfileFixture, skills: [] },
      maxWidth: '720px',
    }),
  ],
}

/** Profile still loading: the skills handed over by the listing card show meanwhile. */
export const LoadingFromListing: Story = {
  decorators: [
    withWorkerProfile({
      seed: {
        id: 'worker-skills-listing',
        name: 'Maya Okafor',
        skills: ['Assembly', 'Mounting', 'Shelving'],
      },
      maxWidth: '720px',
    }),
  ],
}
