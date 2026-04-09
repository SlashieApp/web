'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { Heading, Text } from '@ui'

function IconLightbulb() {
  return (
    <Box as="span" display="inline-flex" color="secondary.600" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <title>Tip</title>
        <path
          d="M9 21h6M12 3a6 6 0 0 0-3 11.2V17h6v-2.8A6 6 0 0 0 12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function ExpertRow({
  name,
  subtitle,
  initials,
}: {
  name: string
  subtitle: string
  initials: string
}) {
  return (
    <HStack align="center" gap={3}>
      <Box
        boxSize="44px"
        borderRadius="full"
        bg="linear-gradient(135deg, #1A56DB 0%, #003fb1 100%)"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontWeight={800}
        fontSize="sm"
        flexShrink={0}
      >
        {initials}
      </Box>
      <Stack gap={0} minW={0}>
        <Text fontWeight={700} fontSize="sm" lineClamp={1}>
          {name}
        </Text>
        <Text fontSize="xs" color="muted" lineClamp={2}>
          {subtitle}
        </Text>
      </Stack>
    </HStack>
  )
}

export function CreateTaskSidebar() {
  return (
    <Stack gap={6} position="sticky" top={4}>
      <Box
        borderRadius="xl"
        p={5}
        bg="secondaryContainer"
        borderWidth="1px"
        borderColor="border"
      >
        <HStack gap={2} mb={3} align="center">
          <IconLightbulb />
          <Heading size="md" color="primary.700" mb={0}>
            Pro tips
          </Heading>
        </HStack>
        <Stack as="ul" gap={2} pl={4} fontSize="sm" color="fg">
          <Text as="li">
            Detailed descriptions get faster, better-matched quotes.
          </Text>
          <Text as="li">
            Clear photos help pros price accurately before they visit.
          </Text>
          <Text as="li">
            A realistic budget attracts serious, available workers.
          </Text>
        </Stack>
      </Box>

      <GlassCard p={5} bg="surfaceContainerLowest">
        <Heading size="md" mb={4} color="primary.700">
          Our experts
        </Heading>
        <Stack gap={4}>
          <ExpertRow
            name="Marcus T."
            subtitle="Master electrician · verified"
            initials="MT"
          />
          <ExpertRow
            name="Sara L."
            subtitle="Interior finisher · top rated"
            initials="SL"
          />
        </Stack>
        <Button asChild w="full" mt={5} variant="outline" size="md">
          <NextLink href="/">View all pros</NextLink>
        </Button>
      </GlassCard>

      <Box
        borderRadius="2xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor="border"
        bg="linear-gradient(160deg, #e8f0ff 0%, #d4e4ff 45%, #fef6ee 100%)"
        minH="200px"
        position="relative"
      >
        <Box position="absolute" inset={0} opacity={0.35} aria-hidden>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 240"
            preserveAspectRatio="xMidYMid slice"
          >
            <title>Decorative</title>
            <path
              fill="#1A56DB"
              fillOpacity="0.12"
              d="M0 180c80-40 160-20 240 10s120 50 160 50V0H0z"
            />
            <circle cx="300" cy="70" r="48" fill="#F2994A" fillOpacity="0.25" />
            <rect
              x="48"
              y="48"
              width="120"
              height="88"
              rx="12"
              fill="#1A56DB"
              fillOpacity="0.08"
            />
          </svg>
        </Box>
        <Stack p={6} gap={2} position="relative">
          <Text fontWeight={800} fontSize="lg" color="primary.700">
            Post with confidence
          </Text>
          <Text fontSize="sm" color="muted" maxW="240px">
            Slashie matches your task to nearby pros — you stay in control until
            you accept an offer.
          </Text>
        </Stack>
      </Box>
    </Stack>
  )
}
