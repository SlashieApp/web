'use client'

import { Box, Container, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import {
  LuBriefcase,
  LuCalendar,
  LuCheck,
  LuMapPin,
  LuStar,
} from 'react-icons/lu'
import { LuArrowLeft } from 'react-icons/lu'

import { Avatar, Link } from '@ui'

import { WORKER_SEARCH_HREF } from '@/utils/appRoutes'
import { useWorkerProfile } from '../../context/WorkerProfileContext'
import {
  workerHeadline,
  workerHeroStats,
  workerPublicDisplayName,
  workerServiceAreaDisplay,
} from '../../helpers/workerProfileHelpers'
import { WorkerProfileActions } from './WorkerProfileActions'

const STAT_ICONS = [LuStar, LuBriefcase, LuCalendar]

/**
 * Profile v2 hero: soft mint gradient band, avatar + verified badge, name,
 * headline, italic tagline, stats row, and the approximate service-area line.
 * Save + Leave a review sit top-right on the same row as the Workers back link.
 */
export function WorkerProfileHero() {
  const { worker } = useWorkerProfile()
  const name = workerPublicDisplayName(worker)
  const headline = workerHeadline(worker)
  const tagline = worker.tagline?.trim()
  const stats = workerHeroStats(worker)
  const serviceArea = workerServiceAreaDisplay(worker)

  return (
    <Box
      w="full"
      borderWidth="1px"
      borderColor="border.default"
      overflow="hidden"
      bg="bg.surface"
      /* Mockup's mint band (#E7FBF0 → white) via the success-soft token. */
      bgImage="linear-gradient(180deg, var(--chakra-colors-status-success-soft) 0%, var(--chakra-colors-bg-surface) 78%)"
      p={{ base: 5, md: 8 }}
    >
      {/* Mobile mirrors the mockup: centred avatar → identity.
          Desktop: avatar | identity in one row. */}
      <Container>
        <HStack
          justify="space-between"
          align="center"
          gap={3}
          flexWrap="wrap"
          pb={{ base: 6, md: 12 }}
        >
          <Link
            href={WORKER_SEARCH_HREF}
            tone="muted"
            fontSize="sm"
            fontWeight={600}
            display="inline-flex"
            alignItems="center"
            gap={1.5}
          >
            <Box as="span" display="inline-flex" aria-hidden>
              <LuArrowLeft size={15} strokeWidth={2.2} />
            </Box>
            Workers
          </Link>
          <WorkerProfileActions />
        </HStack>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'center', md: 'flex-start' }}
          gap={{ base: 4, md: 6 }}
        >
          <Box position="relative" flexShrink={0}>
            {/* White ring lifts the avatar off the mint cover band. */}
            <Box
              borderRadius="full"
              p="3px"
              bg="bg.surface"
              boxShadow="e2"
              display="inline-flex"
            >
              <Avatar
                name={name}
                src={worker.profile?.avatarUrl ?? undefined}
                size="xl"
              />
            </Box>
            {worker.isVerified ? (
              <Box
                position="absolute"
                right="2px"
                bottom="2px"
                boxSize="26px"
                borderRadius="full"
                bg="action.primary"
                color="text.onGreen"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderWidth="2.5px"
                borderColor="bg.surface"
                aria-label="Verified worker"
              >
                <LuCheck size={13} strokeWidth={3.2} aria-hidden />
              </Box>
            ) : null}
          </Box>

          <Stack
            gap={2.5}
            flex={1}
            minW={0}
            align={{ base: 'center', md: 'flex-start' }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Heading
              as="h1"
              fontSize={{ base: '2xl', md: '32px' }}
              lineHeight="1.15"
              fontWeight={600}
              letterSpacing="-0.01em"
            >
              {name}
            </Heading>

            {headline ? (
              <Text fontSize="md" color="text.muted" fontWeight={500}>
                {headline}
              </Text>
            ) : null}

            {tagline ? (
              <Text fontSize="md" color="text.default" fontStyle="italic">
                “{tagline}”
              </Text>
            ) : null}

            <HStack
              gap={{ base: 2, md: 3 }}
              flexWrap="wrap"
              justify={{ base: 'center', md: 'flex-start' }}
              color="text.muted"
              fontSize="sm"
              pt={0.5}
            >
              {stats.map((stat, index) => {
                const Icon = STAT_ICONS[index] ?? LuCalendar
                return (
                  <HStack key={stat} gap={1.5} flexShrink={0}>
                    {index > 0 ? (
                      <Text as="span" aria-hidden color="text.subtle">
                        ·
                      </Text>
                    ) : null}
                    <Box as="span" display="inline-flex" aria-hidden>
                      <Icon size={14} strokeWidth={2} />
                    </Box>
                    <Text as="span">{stat}</Text>
                  </HStack>
                )
              })}
            </HStack>

            {serviceArea ? (
              <HStack
                gap={1.5}
                color="text.default"
                fontSize="sm"
                fontWeight={500}
              >
                <Box
                  as="span"
                  display="inline-flex"
                  aria-hidden
                  color="text.muted"
                >
                  <LuMapPin size={14} strokeWidth={2} />
                </Box>
                <Text as="span">Service area: {serviceArea}</Text>
              </HStack>
            ) : null}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
