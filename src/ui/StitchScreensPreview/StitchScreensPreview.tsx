'use client'

import {
  Box,
  type BoxProps,
  Grid,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'

import { GlassCard } from '../Card/GlassCard'

export type StitchScreen = {
  name: string
  id: string
}

export const STITCH_POST_JOB_SCREENS: readonly StitchScreen[] = [
  {
    name: 'Design System',
    id: 'asset-stub-assets-bc39156ca0a84daba21e19a34832e409-1773993001541',
  },
  { name: 'Handyman Pro Registration', id: '248c06f82a404d82855256a85309f78a' },
  { name: 'Rate Your Professional', id: '3845b5431ce443608662160bc5674185' },
  { name: 'Unlock Pro Badge', id: '3e53175f067943c59e4de22a4b4e3e53' },
  { name: 'Post a Job Form', id: '564b6301bc744b19aea4c10d9a65342a' },
  { name: 'Job Done & Pay Cash', id: '88df998cd81c425aa03ff79246199a61' },
  { name: 'Landing Screen', id: '9dde6c4a21ae426a95bdcf262cf88b42' },
  { name: 'Professional Profile', id: 'ac0ad1e4257145ea90279c0f974f50c2' },
  { name: 'Booking & Messages', id: 'bef207581b504c7b9945ac3dfd2da077' },
  { name: 'Job Dashboard', id: 'bf4475452b80495d847c825fe600cb43' },
  { name: 'Browse Local Jobs', id: 'cef5e170aa214094b03077a965ce7e29' },
  { name: 'Unified Pro Dashboard', id: 'fc4b3e032a5f464bb9db068cbb9e8b6e' },
  {
    name: 'HandyBox GraphQL Schema Requirements',
    id: '05f9eee700b2453e90faa9d93076ec8d',
  },
] as const

type StitchScreensPreviewProps = {
  screens?: readonly StitchScreen[]
} & BoxProps

export function StitchScreensPreview({
  screens = STITCH_POST_JOB_SCREENS,
  ...props
}: StitchScreensPreviewProps) {
  return (
    <Stack gap={6} {...props}>
      <Stack gap={2} maxW="2xl">
        <Text
          width="fit-content"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight={700}
          letterSpacing="0.06em"
          textTransform="uppercase"
          bg="surfaceContainerLowest"
          color="primary.700"
        >
          Stitch Project Preview
        </Text>
        <Heading size="xl" letterSpacing="-0.02em">
          Post a Job Form screen map
        </Heading>
        <Text color="muted">
          Reference index for all Stitch screen IDs used in this redesign.
        </Text>
      </Stack>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
        {screens.map((screen, index) => (
          <GlassCard key={screen.id} p={4}>
            <Stack gap={3}>
              <Box
                h="96px"
                borderRadius="md"
                bg="linear-gradient(120deg, rgba(0,63,177,0.16), rgba(26,86,219,0.34))"
              />
              <Stack gap={1}>
                <Text fontSize="xs" color="muted" fontWeight={700}>
                  Screen {index + 1}
                </Text>
                <Text fontWeight={700}>{screen.name}</Text>
              </Stack>
              <HStack
                px={2.5}
                py={2}
                borderRadius="md"
                bg="surfaceContainerLow"
                align="start"
              >
                <Text fontSize="xs" color="muted" fontWeight={700}>
                  ID
                </Text>
                <Text fontSize="xs" fontFamily="mono">
                  {screen.id}
                </Text>
              </HStack>
            </Stack>
          </GlassCard>
        ))}
      </Grid>
    </Stack>
  )
}
