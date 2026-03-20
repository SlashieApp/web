'use client'

import { Box, SimpleGrid, Stack } from '@chakra-ui/react'

import { GlassCard, Heading, Text } from '@ui'

const colors = [
  'Primary (Blueprint Blue): #1A56DB — Used for main actions, brand identity, and verified states. Represents stability and professional expertise.',
  'Accent (Construction Amber): #F2994A — Used for highlighting value, urgency (Emergency jobs), and the Pro membership tier.',
  'Success (Safety Green): #059669 — Used for Job Completed states and positive ratings.',
  'Base (Worksite Gray): bg-slate-50 (Surface), bg-slate-100 (Borders/Dividers), text-slate-600 (Body), text-slate-900 (Headings).',
] as const

const elementBreakdown = {
  atoms: [
    'Primary Buttons: High-contrast blue, 8px radius, white text.',
    'Secondary Buttons: Ghost style with blue border or slate background.',
    'Status Badges: Emergency (Amber), Verified (Blue), Completed (Green).',
    'Input Fields: Clean white background, 1px slate border, Jakarta Sans placeholder text.',
  ],
  molecules: [
    'Job Summary Card: Contains job title, location (with icon), budget, and time since posted.',
    'Pro Endorsement Item: User avatar, name, skill badge, and a short testimonial quote.',
    'Rating Summary: 5-star display with numerical average and total review count.',
    'Filter Chip: Toggleable badges for categories like Plumbing and Electrical.',
  ],
  organisms: [
    'Top Navigation Bar: Global header with logo, search, and profile actions.',
    'Pro Dashboard Sidebar: Vertical navigation for Marketplace, Earnings, and Messages.',
    'Offer Management View: A list of incoming offers with Accept and Message actions.',
    'Review Submission Form: Star rating group + text area + highlight chips (e.g., Fair Price).',
  ],
} as const

const interactionPatterns = [
  'Hover States: Links turn primary blue; cards lift slightly with a shadow transition.',
  'Loading States: Shimmer/Skeleton screens following the layout of the job cards.',
  'Feedback: Toast notifications for Offer Sent or Job Completed.',
] as const

const accessibilityStandards = [
  'Minimum contrast ratio of 4.5:1 for all text.',
  'Large tap targets (min 44x44px) for the eventual mobile version.',
  'Clear error states for form validation in the Post a Job flow.',
] as const

export function HomeDesignLibrarySection() {
  return (
    <Stack gap={8}>
      <Stack gap={3}>
        <Heading size="2xl">
          HandyBox Design Library &amp; Element Breakdown
        </Heading>
        <Text color="muted">
          Design Philosophy: <b>The Master Craftsman</b>. The HandyBox visual
          identity is built on trust, precision, and utility. It mimics the
          aesthetic of a high-end architectural blueprint combined with the
          warmth of a job well done.
        </Text>
      </Stack>

      <GlassCard p={{ base: 5, md: 7 }} bg="surfaceContainerLowest">
        <Stack gap={5}>
          <Heading size="lg">
            Global Style Tokens (Blueprint &amp; Amber)
          </Heading>
          <Stack gap={2}>
            <Text fontWeight={700}>Colors</Text>
            {colors.map((line) => (
              <Text key={line} color="muted" fontSize="sm">
                • {line}
              </Text>
            ))}
          </Stack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Stack gap={2}>
              <Text fontWeight={700}>Typography</Text>
              <Text color="muted" fontSize="sm">
                • Headings: Plus Jakarta Sans (Bold/Extra Bold) — modern,
                geometric, architectural.
              </Text>
              <Text color="muted" fontSize="sm">
                • Body: Inter or Plus Jakarta Sans (Medium/Regular) — optimised
                for readability.
              </Text>
            </Stack>
            <Stack gap={2}>
              <Text fontWeight={700}>Elevation &amp; Shapes</Text>
              <Text color="muted" fontSize="sm">
                • Roundness: 8px (Round Eight) — balances industrial and
                approachable.
              </Text>
              <Text color="muted" fontSize="sm">
                • Shadows: subtle shadow-sm for cards so the UI remains
                blueprint-like.
              </Text>
            </Stack>
          </SimpleGrid>
        </Stack>
      </GlassCard>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        <GlassCard p={5} bg="surfaceContainerLowest">
          <Stack gap={2}>
            <Heading size="md">Atoms</Heading>
            {elementBreakdown.atoms.map((item) => (
              <Text key={item} color="muted" fontSize="sm">
                • {item}
              </Text>
            ))}
          </Stack>
        </GlassCard>
        <GlassCard p={5} bg="surfaceContainerLowest">
          <Stack gap={2}>
            <Heading size="md">Molecules</Heading>
            {elementBreakdown.molecules.map((item) => (
              <Text key={item} color="muted" fontSize="sm">
                • {item}
              </Text>
            ))}
          </Stack>
        </GlassCard>
        <GlassCard p={5} bg="surfaceContainerLowest">
          <Stack gap={2}>
            <Heading size="md">Organisms</Heading>
            {elementBreakdown.organisms.map((item) => (
              <Text key={item} color="muted" fontSize="sm">
                • {item}
              </Text>
            ))}
          </Stack>
        </GlassCard>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <GlassCard p={5} bg="surfaceContainerLowest">
          <Stack gap={2}>
            <Heading size="md">Interaction Patterns</Heading>
            {interactionPatterns.map((item) => (
              <Text key={item} color="muted" fontSize="sm">
                • {item}
              </Text>
            ))}
          </Stack>
        </GlassCard>
        <GlassCard p={5} bg="surfaceContainerLowest">
          <Stack gap={2}>
            <Heading size="md">Accessibility Standards</Heading>
            {accessibilityStandards.map((item) => (
              <Text key={item} color="muted" fontSize="sm">
                • {item}
              </Text>
            ))}
          </Stack>
        </GlassCard>
      </SimpleGrid>

      <Box>
        <Text color="muted" fontSize="sm">
          This section is mirrored in the homepage Storybook view for design
          review and handoff.
        </Text>
      </Box>
    </Stack>
  )
}
