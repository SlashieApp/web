'use client'

import {
  Box,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuCheck, LuMapPin } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'
import { Avatar, Badge, Card, StickyHeaderTitle } from '@ui'

import type {
  PublicProfileModel,
  StatCell,
} from '../../helpers/publicProfileModel'
import bag from '../../i11n.json'

/** A neutral cover band: `bg.subtle` into `border.default` and back. */
const COVER =
  'linear-gradient(115deg, var(--chakra-colors-bg-subtle) 0%, var(--chakra-colors-border-default) 58%, var(--chakra-colors-bg-subtle) 100%)'

export type PublicProfileHeroProps = {
  model: Pick<
    PublicProfileModel,
    | 'name'
    | 'avatarUrl'
    | 'verified'
    | 'isWorker'
    | 'headline'
    | 'tagline'
    | 'serviceAreaLabel'
  >
  stats: readonly StatCell[]
  /** Save and Leave a review, beside the photo (the ⋯ menu is in the page header's bar). */
  actions?: ReactNode
  /**
   * `h1` (default): the page's title, under the page header, which collapses
   * it into its bar. `h3` when the hero is a preview inside another page.
   */
  nameAs?: 'h1' | 'h3'
}

/**
 * Cover band, photo, name, headline, area and one stats strip. The page
 * header's bar (Back and the ⋯ menu) floats over the cover.
 */
export function PublicProfileHero({
  model,
  stats,
  actions,
  nameAs = 'h1',
}: PublicProfileHeroProps) {
  const t = useI11n(bag)
  const name = model.name || t.fallbackName

  return (
    <Card p={0} overflow="hidden" maxW="full">
      <Box h={{ base: '104px', md: '120px' }} bgImage={COVER} />
      <Stack gap={1} px={{ base: 4, md: 6 }} pb={{ base: 4, md: 5 }}>
        <HStack justify="space-between" align="flex-end" gap={3}>
          <Box
            mt={{ base: '-40px', md: '-60px' }}
            p="4px"
            bg="bg.surface"
            borderRadius="full"
            borderWidth="1px"
            borderColor="border.default"
            flexShrink={0}
          >
            <Avatar name={name} src={model.avatarUrl ?? undefined} size="xl" />
          </Box>
          {actions ? (
            <HStack gap={2} pt={3} flexWrap="wrap" justify="flex-end">
              {actions}
            </HStack>
          ) : null}
        </HStack>
        <HStack gap={2} flexWrap="wrap" mt={2} rowGap={1}>
          {nameAs === 'h1' ? (
            <StickyHeaderTitle>{name}</StickyHeaderTitle>
          ) : (
            <Heading
              as={nameAs}
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight={500}
              lineHeight="1.2"
              letterSpacing={{ base: '-0.02em', md: '-0.025em' }}
              color="text.default"
              overflowWrap="anywhere"
            >
              {name}
            </Heading>
          )}
          {model.verified ? (
            <Box
              as="span"
              role="img"
              aria-label={t.hero.verified}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              boxSize="22px"
              borderRadius="full"
              bg="action.primary"
              color="text.onGreen"
              flexShrink={0}
            >
              <LuCheck size={13} strokeWidth={3.5} aria-hidden />
            </Box>
          ) : null}
          <Badge variant="neutral" shape="pill" size="sm">
            {model.isWorker ? t.userType.worker : t.userType.customer}
          </Badge>
        </HStack>
        {model.headline ? (
          <Text fontWeight={500} color="text.default">
            {model.headline}
          </Text>
        ) : null}
        {model.tagline ? (
          <Text color="text.muted" overflowWrap="anywhere">
            {model.tagline}
          </Text>
        ) : null}
        {model.serviceAreaLabel ? (
          <HStack gap={1.5} color="text.muted" fontSize="sm" align="flex-start">
            <Box as="span" display="inline-flex" pt="3px" aria-hidden>
              <LuMapPin size={14} />
            </Box>
            <Text>
              <Text as="span" srOnly>
                {t.hero.serviceArea}:{' '}
              </Text>
              {model.serviceAreaLabel}
            </Text>
          </HStack>
        ) : null}
      </Stack>
      {stats.length > 0 ? <ProfileStats cells={stats} /> : null}
    </Card>
  )
}

function ProfileStats({ cells }: { cells: readonly StatCell[] }) {
  const columns = cells.length === 4 ? { base: 2, md: 4 } : cells.length

  return (
    // The 1px gap over a border-coloured grid draws the dividers.
    <SimpleGrid
      columns={columns}
      gap="1px"
      bg="border.default"
      borderTopWidth="1px"
      borderColor="border.default"
    >
      {cells.map((cell) => (
        <Stack
          key={cell.id}
          gap={0.5}
          bg="bg.surface"
          px={{ base: 4, md: 6 }}
          py={3}
        >
          <StatContent cell={cell} />
        </Stack>
      ))}
    </SimpleGrid>
  )
}

function StatValue({ children }: { children: ReactNode }) {
  return (
    <Text
      fontFamily="heading"
      fontSize="lg"
      fontWeight={600}
      lineHeight="1.2"
      color="text.default"
      fontVariantNumeric="tabular-nums"
    >
      {children}
    </Text>
  )
}

function StatLabel({ children }: { children: ReactNode }) {
  return (
    <Text fontSize="xs" color="text.muted">
      {children}
    </Text>
  )
}

function StatContent({ cell }: { cell: StatCell }) {
  const t = useI11n(bag).stats

  switch (cell.id) {
    case 'rating':
      if (cell.average == null) {
        return (
          <>
            <StatValue>{cell.count}</StatValue>
            <StatLabel>{cell.count === 1 ? t.review : t.reviews}</StatLabel>
          </>
        )
      }
      return (
        <chakra.a
          href="#reviews"
          display="grid"
          gap={0.5}
          borderRadius="sm"
          _hover={{ '& .stat-label': { textDecoration: 'underline' } }}
          _focusVisible={sdlFocusRing}
        >
          <Text srOnly>
            {formatMessage(t.averageAria, {
              average: cell.average.toFixed(1),
              count: cell.count,
            })}
          </Text>
          <Box aria-hidden>
            <StatValue>
              {cell.average.toFixed(1)}{' '}
              <Text as="span" color="action.primary" fontSize="md">
                ★
              </Text>
            </StatValue>
          </Box>
          <Box aria-hidden className="stat-label">
            <StatLabel>
              {formatMessage(t.reviewsCount, { count: cell.count })}
            </StatLabel>
          </Box>
        </chakra.a>
      )
    case 'jobs':
      return (
        <>
          <StatValue>{cell.count}</StatValue>
          <StatLabel>{cell.count === 1 ? t.job : t.jobs}</StatLabel>
        </>
      )
    case 'hosted':
      return (
        <>
          <StatValue>{cell.count}</StatValue>
          <StatLabel>{cell.count === 1 ? t.hostedOne : t.hosted}</StatLabel>
        </>
      )
    case 'experience':
      return (
        <>
          <StatValue>{cell.years}</StatValue>
          <StatLabel>{cell.years === 1 ? t.year : t.years}</StatLabel>
        </>
      )
    case 'openTasks':
      return (
        <>
          <StatValue>{cell.count}</StatValue>
          <StatLabel>{cell.count === 1 ? t.openTask : t.openTasks}</StatLabel>
        </>
      )
    case 'joined':
      return (
        <>
          <StatValue>{cell.label}</StatValue>
          <StatLabel>{t.joined}</StatLabel>
        </>
      )
  }
}
