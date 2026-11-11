'use client'

import { Box, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import {
  LuArrowLeft,
  LuBadgeCheck,
  LuEllipsisVertical,
  LuHeart,
  LuStar,
} from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'

import { phoneCropFade } from '../PhoneFrame'
import type { PhoneCopy } from '../phoneCopy'
import { CompactBar, Hotspot, InitialAvatar } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'
import { QuoteDisc } from './taskPageParts'

type ReviewItem = PhoneCopy['profile']['items'][number]

/** Five green stars, the app's rating. */
function Stars({ size }: { size: number }) {
  return (
    <HStack gap="2px" color="action.primary" aria-hidden>
      {[0, 1, 2, 3, 4].map((n) => (
        <LuStar key={n} size={size} fill="currentColor" />
      ))}
    </HStack>
  )
}

/** One cell of the profile's stats grid: the figure over what it counts. */
function Stat({
  value,
  label,
  compact,
}: {
  value: ReactNode
  label: string
  compact: boolean
}) {
  return (
    <Box px={compact ? '10px' : '12px'} py={compact ? '6px' : '12px'}>
      <Text
        fontSize={compact ? '14px' : '18px'}
        lineHeight={compact ? '18px' : '24px'}
        fontWeight={600}
        fontVariantNumeric="tabular-nums"
      >
        {value}
      </Text>
      <Text
        fontSize={compact ? '11px' : '12px'}
        lineHeight="16px"
        color="text.muted"
      >
        {label}
      </Text>
    </Box>
  )
}

/** One review, as the profile lists it: who it is from and when, the stars, the words. */
function Review({
  item,
  from,
  compact,
}: {
  item: ReviewItem
  from: string
  compact: boolean
}) {
  return (
    <Stack
      gap={compact ? '2px' : '6px'}
      py={compact ? '8px' : '12px'}
      borderTopWidth="1px"
      borderColor="border.default"
      data-profile-review={item.author}
    >
      <HStack gap="8px" align="center">
        <QuoteDisc name={item.author} size={compact ? 32 : 28} />
        <Box flex={1} minW={0}>
          <Text
            fontSize={compact ? '12px' : '14px'}
            lineHeight={compact ? '16px' : '18px'}
            fontWeight={500}
          >
            {item.author}
          </Text>
          <Text
            fontSize={compact ? '11px' : '12px'}
            lineHeight="16px"
            color="text.muted"
            lineClamp={1}
          >
            {from} · {item.date}
          </Text>
        </Box>
        <Stars size={compact ? 11 : 12} />
      </HStack>
      <Text
        fontSize={compact ? '12px' : '14px'}
        lineHeight={compact ? '17px' : '21px'}
        lineClamp={compact ? 1 : 2}
      >
        {item.text}
      </Text>
    </Stack>
  )
}

/**
 * A worker's public profile, as the app draws it: the card with the cover,
 * the photo, Save, the name with its verified tick and "Worker", then the
 * stats grid (the rating over its reviews, jobs done, years' experience,
 * joined), Skills, and Reviews (who each is from, the stars, the words). The
 * beat taps "Show all reviews" and the rest of the reviews come in.
 * `compact` is the cropped phone's layout: the worker in the bar, two stats
 * and the reviews, which fade out toward the crop.
 */
export function ProfileScreen({
  copy,
  active,
  intro,
  compact = false,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
  compact?: boolean
}) {
  const { entered, done, trigger } = useDemoBeat(active, intro)
  const t = copy.profile
  const [firstReview, ...moreReviews] = t.items
  const shown = done ? [firstReview, ...moreReviews] : [firstReview]
  const reviews = formatMessage(t.reviewsCount, { count: t.reviewCount })

  const rating = (
    <HStack gap="4px" as="span">
      {t.rating}
      <Box as="span" color="action.primary" display="inline-flex">
        <LuStar size={compact ? 12 : 14} fill="currentColor" aria-hidden />
      </Box>
    </HStack>
  )

  const showAll = (
    <Hotspot
      label={formatMessage(t.showAll, { count: t.reviewCount })}
      onPress={trigger}
      pulse={!done}
      borderRadius="full"
      alignSelf="flex-start"
    >
      <Box
        h={compact ? '32px' : '36px'}
        px="14px"
        borderRadius="full"
        borderWidth="1px"
        borderColor="border.strong"
        bg="bg.surface"
        display="flex"
        alignItems="center"
        fontSize={compact ? '12px' : '14px'}
        fontWeight={500}
        whiteSpace="nowrap"
      >
        {formatMessage(t.showAll, { count: t.reviewCount })}
      </Box>
    </Hotspot>
  )

  const list = shown.map((item, index) => (
    <Box
      key={item.author}
      style={index === 0 ? enterStyle(entered, 1) : undefined}
      css={
        index === 0
          ? undefined
          : { animation: 'fade-rise 320ms cubic-bezier(0.2, 0, 0, 1) both' }
      }
    >
      <Review item={item} from={t.fromCustomer} compact={compact} />
    </Box>
  ))

  if (compact) {
    return (
      <Box position="absolute" inset={0} bg="bg.surface">
        <CompactBar icon="back" title={t.name} sub={t.trade} />
        <Stack gap="8px" px="12px" pt="8px" css={phoneCropFade(44)}>
          <Grid
            templateColumns="1fr 1fr"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="12px"
            style={enterStyle(entered, 0)}
          >
            <Stat value={rating} label={reviews} compact />
            <Box borderLeftWidth="1px" borderColor="border.default">
              <Stat value={t.jobs} label={t.jobsLabel} compact />
            </Box>
          </Grid>
          <HStack justify="space-between" gap="8px">
            <Text fontSize="13px" lineHeight="18px" fontWeight={600}>
              {t.reviewsTitle}
            </Text>
            {done ? null : showAll}
          </HStack>
          <Box>{list}</Box>
        </Stack>
      </Box>
    )
  }

  return (
    <Box position="absolute" inset={0} bg="bg.canvas" overflow="hidden">
      <HStack h="48px" px="8px" justify="space-between" aria-hidden>
        <Box
          w="40px"
          h="40px"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
        >
          <LuArrowLeft size={20} />
        </Box>
        <Box
          w="40px"
          h="40px"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
        >
          <LuEllipsisVertical size={20} />
        </Box>
      </HStack>

      <Stack gap="20px" px="16px">
        {/* The profile card: cover, photo, Save, who they are, the stats. */}
        <Box
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="12px"
          overflow="hidden"
          style={enterStyle(entered, 0)}
        >
          <Box
            h="56px"
            style={{
              background:
                'linear-gradient(180deg, var(--chakra-colors-bg-subtle) 0%, var(--chakra-colors-border-default) 100%)',
            }}
          />
          <HStack align="flex-end" justify="space-between" px="16px" mt="-36px">
            <Box
              borderRadius="full"
              borderWidth="3px"
              borderColor="bg.surface"
              bg="bg.surface"
            >
              <InitialAvatar initials={t.initials} size={72} />
            </Box>
            <HStack
              gap="6px"
              h="36px"
              px="14px"
              borderRadius="full"
              borderWidth="1px"
              borderColor="border.strong"
              bg="bg.surface"
              fontSize="14px"
              fontWeight={500}
            >
              <LuHeart size={16} aria-hidden />
              {t.save}
            </HStack>
          </HStack>
          <Stack gap="2px" px="16px" pt="8px" pb="12px">
            <HStack gap="6px" align="center" flexWrap="wrap">
              <Text
                fontSize="24px"
                lineHeight="30px"
                fontWeight={600}
                letterSpacing="-0.02em"
              >
                {t.name}
              </Text>
              <Box
                as="span"
                color="status.success.fg"
                display="inline-flex"
                aria-hidden
              >
                <LuBadgeCheck size={18} />
              </Box>
              <Box
                px="8px"
                borderRadius="full"
                borderWidth="1px"
                borderColor="border.default"
                bg="bg.subtle"
                fontSize="12px"
                lineHeight="20px"
                fontWeight={500}
                color="text.muted"
              >
                {t.worker}
              </Box>
            </HStack>
            <Text fontSize="14px" lineHeight="20px" fontWeight={500}>
              {t.trade}
            </Text>
          </Stack>
          <Grid
            templateColumns="1fr 1fr"
            borderTopWidth="1px"
            borderColor="border.default"
          >
            <Box
              borderRightWidth="1px"
              borderBottomWidth="1px"
              borderColor="border.default"
            >
              <Stat value={rating} label={reviews} compact={false} />
            </Box>
            <Box borderBottomWidth="1px" borderColor="border.default">
              <Stat value={t.jobs} label={t.jobsLabel} compact={false} />
            </Box>
            <Box borderRightWidth="1px" borderColor="border.default">
              <Stat value={t.years} label={t.yearsLabel} compact={false} />
            </Box>
            <Stat value={t.joined} label={t.joinedLabel} compact={false} />
          </Grid>
        </Box>

        <Stack gap="8px" style={enterStyle(entered, 1)}>
          <Text fontSize="16px" lineHeight="22px" fontWeight={600}>
            {t.skillsTitle}
          </Text>
          <HStack gap="6px" flexWrap="wrap">
            {t.skills.map((skill) => (
              <Box
                key={skill}
                px="10px"
                borderRadius="full"
                borderWidth="1px"
                borderColor="border.default"
                bg="bg.surface"
                fontSize="13px"
                lineHeight="26px"
                fontWeight={500}
              >
                {skill}
              </Box>
            ))}
          </HStack>
        </Stack>

        <Stack gap="8px">
          <HStack justify="space-between" gap="8px">
            <Box>
              <Text fontSize="16px" lineHeight="22px" fontWeight={600}>
                {t.reviewsTitle}
              </Text>
              <Text fontSize="12px" lineHeight="16px" color="text.muted">
                {reviews}
              </Text>
            </Box>
            {done ? null : showAll}
          </HStack>
          <Box>{list}</Box>
        </Stack>
      </Stack>
    </Box>
  )
}
