import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Text } from '../Typography'
import { Section } from './Section'

function SectionStory() {
  return (
    <Box bg="surface">
      <Section bg="surfaceContainerLow">
        <Text>First section content</Text>
      </Section>
      <Section>
        <Text>Second section content</Text>
      </Section>
    </Box>
  )
}

const meta: Meta<typeof SectionStory> = {
  title: 'UI/Layout/Section',
  component: SectionStory,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof SectionStory>

export const Default: Story = {}
