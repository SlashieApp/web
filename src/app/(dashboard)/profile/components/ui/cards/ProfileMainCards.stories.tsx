import { Stack } from '@chakra-ui/react'
import { WorkerPrimaryCategory } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyMe,
  storyWorker,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import type { MeSnapshot } from '@/app/(auth)/store/user'

import { getProfileLifecycle } from '../../../helpers/profileLifecycle'
import {
  ContactCard,
  PersonalInfoCard,
  PublicPreviewCard,
  WorkerProfileCard,
} from './ProfileMainCards'

/** The four main-column cards, in the order the profile hub stacks them. */
function MainCards({ me }: { me: MeSnapshot }) {
  const lifecycle = getProfileLifecycle(me)
  return (
    <Stack gap={5} maxW="720px">
      <PersonalInfoCard me={me} onEdit={() => {}} />
      <ContactCard me={me} onEdit={() => {}} />
      <WorkerProfileCard me={me} lifecycle={lifecycle} onEdit={() => {}} />
      <PublicPreviewCard me={me} lifecycle={lifecycle} />
    </Stack>
  )
}

/** Story for one signed-in user. */
function cardsFor(me: MeSnapshot): Story {
  return { args: { me }, decorators: [withSession({ me })] }
}

const meta = {
  title: 'Dashboard/Profile/ProfileMainCards',
  component: MainCards,
  parameters: { layout: 'padded' },
  args: { me: storyMe() },
} satisfies Meta<typeof MainCards>

export default meta
type Story = StoryObj<typeof meta>

/** Customer, no worker profile: the worker card invites setup and there is no public preview. */
export const Customer: Story = {
  ...cardsFor(storyMe({ profile: { contactNumber: '+447700900123' } })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: 'Become a worker' }),
    ).toBeVisible()
    await expect(canvas.queryByText('Public profile preview')).toBeNull()
  },
}

/** Worker setup unfinished: "Not published yet", Continue setup, and no Edit on the worker card. */
export const SetupInProgress: Story = {
  ...cardsFor(
    storyMe({
      profile: { contactNumber: '+447700900123' },
      worker: storyWorkerDraft({ tagline: 'Handyman in Watford' }),
    }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: 'Continue setup' }),
    ).toBeVisible()
    await expect(
      canvas.getAllByText('Not published yet').length,
    ).toBeGreaterThan(0)
  },
}

/** Published worker with a verified phone and a date of birth: full detail, skills and the public preview link. */
export const ActiveWorker: Story = {
  ...cardsFor(
    storyWorkerMe({ profile: { dateOfBirth: '1990-01-01T12:00:00.000Z' } }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Published')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'View full public profile' }),
    ).toBeVisible()
  },
}

/** Published worker whose phone is not verified: the phone row says Not verified. */
export const PhoneNotVerified: Story = cardsFor(
  storyWorkerMe({ phoneVerified: false }),
)

/** A worker with the optional fields empty: every blank reads "Not added". */
export const EmptyDetails: Story = cardsFor(
  storyWorkerMe({
    profile: { contactNumber: null },
    phoneVerified: false,
    worker: storyWorker({
      tagline: null,
      bio: null,
      yearsExperience: null,
      skills: [],
      primaryCategory: null,
      travelRadiusMiles: null,
      locationAddress: null,
      preferredLocation: { address: null, lat: null, lng: null, name: null },
    }),
  }),
)

/** A long bio, headline and many skills wrap inside the cards. */
export const LongContent: Story = cardsFor(
  storyWorkerMe({
    worker: storyWorker({
      tagline:
        'Time-served carpenter and joiner for kitchens, wardrobes and stairs',
      bio: 'Time-served carpenter with twenty years on residential projects across Hertfordshire. I fit kitchens, build bespoke wardrobes, repair staircases and restore period doors. I arrive on time, protect floors and furniture, tidy up after every job and always agree the price before I start work.',
      primaryCategory: WorkerPrimaryCategory.Carpentry,
      yearsExperience: 20,
      skills: [
        'Kitchen fitting',
        'Bespoke wardrobes',
        'Staircase repair',
        'Door hanging',
        'Skirting and architrave',
        'Flat-pack assembly',
        'Decking',
        'Shelving',
      ],
      preferredLocation: {
        address: 'Bushey',
        lat: 51.6428,
        lng: -0.3612,
        name: 'Bushey, Hertfordshire',
      },
    }),
  }),
)

/** Phones: the worker details collapse to a single column. */
export const Phone: Story = {
  ...cardsFor(storyWorkerMe()),
  globals: { viewport: { value: 'mobile1' } },
}
