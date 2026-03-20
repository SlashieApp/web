import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Header, Section, SiteFooter, SiteHeader } from '../../ui'
import { HomeDesignLibrarySection } from './HomeDesignLibrarySection'

function DesignLibraryDashboardStory() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 4, md: 5 }}>
          <Header>
            <SiteHeader activeItem="my-jobs" />
          </Header>
        </Section>
        <Section id="design-library" py={{ base: 10, md: 14 }}>
          <HomeDesignLibrarySection />
        </Section>
        <SiteFooter />
      </Stack>
    </Box>
  )
}

const meta: Meta<typeof DesignLibraryDashboardStory> = {
  title: 'UI/Pages/Design Library Dashboard',
  component: DesignLibraryDashboardStory,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof DesignLibraryDashboardStory>

export const Default: Story = {}
