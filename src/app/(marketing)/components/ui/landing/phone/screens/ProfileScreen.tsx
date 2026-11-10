'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuBadgeCheck, LuStar } from 'react-icons/lu'

import { phoneCropFade } from '../PhoneFrame'
import type { PhoneCopy } from '../phoneCopy'
import {
  DemoCard,
  Hotspot,
  InitialAvatar,
  PhoneTabBar,
  Stars,
} from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

function Stat({
  value,
  label,
  compact = false,
}: {
  value: React.ReactNode
  label: string
  compact?: boolean
}) {
  return (
    <Stack gap={0} flex={1} align="center">
      <Text
        fontSize={compact ? '14px' : '18px'}
        lineHeight={compact ? '20px' : undefined}
        fontWeight={600}
        fontVariantNumeric="tabular-nums"
      >
        {value}
      </Text>
      <Text
        fontSize="11px"
        lineHeight={compact ? '15px' : undefined}
        color="text.muted"
        fontWeight={500}
      >
        {label}
      </Text>
    </Stack>
  )
}

/**
 * The worker's public profile: rating, jobs, skills and reviews. `compact` is
 * the cropped phone's layout: who they are in one row, the three figures, a
 * review and the button; the reviews it opens fade out toward the crop.
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

  const stats = (
    <>
      <Stat
        compact={compact}
        value={
          <HStack gap="4px" as="span">
            <Box as="span" color="status.warning.solid" display="inline-flex">
              <LuStar
                size={compact ? 13 : 16}
                fill="currentColor"
                aria-hidden
              />
            </Box>
            {t.rating}
          </HStack>
        }
        label={t.reviews}
      />
      <Box w="1px" bg="border.default" />
      <Stat compact={compact} value={t.jobs} label={t.jobsLabel} />
      <Box w="1px" bg="border.default" />
      <Stat compact={compact} value={t.response} label={t.responseLabel} />
    </>
  )

  const reviews = shown.map((review, index) => (
    <DemoCard
      key={review.author}
      p={compact ? '10px' : '12px'}
      style={index === 0 ? enterStyle(entered, compact ? 2 : 4) : undefined}
      css={
        index === 0
          ? undefined
          : {
              animation: `fade-rise 360ms cubic-bezier(0.2, 0, 0, 1) ${index * 90}ms both`,
            }
      }
    >
      <HStack justify="space-between">
        <Text fontSize={compact ? '12px' : '13px'} fontWeight={500}>
          {review.author}
        </Text>
        <Stars filled={5} size={11} />
      </HStack>
      <Text
        fontSize={compact ? '12px' : '13px'}
        lineHeight={compact ? '17px' : undefined}
        color="text.muted"
        mt={compact ? '2px' : '4px'}
      >
        {review.text}
      </Text>
    </DemoCard>
  ))

  if (compact) {
    return (
      <Box
        position="absolute"
        inset={0}
        bg="bg.canvas"
        // Opened, the reviews run past the crop: they fade out toward it.
        css={done ? phoneCropFade() : undefined}
      >
        <Stack px="12px" pt="12px" gap="8px">
          <HStack gap="10px" style={enterStyle(entered, 0)}>
            <InitialAvatar initials={t.initials} size={44} />
            <Box minW={0}>
              <HStack gap="5px">
                <Text
                  fontSize="15px"
                  lineHeight="20px"
                  fontWeight={500}
                  letterSpacing="-0.01em"
                >
                  {t.name}
                </Text>
                <Box color="accent.active" display="inline-flex">
                  <LuBadgeCheck size={16} aria-hidden />
                </Box>
              </HStack>
              <Text fontSize="12px" lineHeight="16px" color="text.muted">
                {t.trade}
              </Text>
            </Box>
          </HStack>
          <DemoCard
            display="flex"
            py="8px"
            px="6px"
            style={enterStyle(entered, 1)}
          >
            {stats}
          </DemoCard>
          {reviews}
          {done ? null : (
            <Box style={enterStyle(entered, 3)}>
              <Hotspot
                label={t.seeAll}
                onPress={trigger}
                pulse
                w="full"
                borderRadius="full"
              >
                <Box
                  h="40px"
                  borderRadius="full"
                  borderWidth="1px"
                  borderColor="border.strong"
                  bg="bg.surface"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="13px"
                  fontWeight={500}
                >
                  {t.seeAll}
                </Box>
              </Hotspot>
            </Box>
          )}
        </Stack>
      </Box>
    )
  }

  return (
    <Box position="absolute" inset={0} bg="bg.canvas">
      <Box h="96px" bg="bg.subtle" aria-hidden />
      <Stack px="16px" mt="-44px" gap="12px">
        <Stack align="center" gap="6px" style={enterStyle(entered, 0)}>
          <Box borderRadius="full" borderWidth="4px" borderColor="bg.canvas">
            <InitialAvatar initials={t.initials} size={80} />
          </Box>
          <HStack gap="6px">
            <Text fontSize="21px" fontWeight={500} letterSpacing="-0.015em">
              {t.name}
            </Text>
            <Box color="accent.active" display="inline-flex">
              <LuBadgeCheck size={20} aria-hidden />
            </Box>
          </HStack>
          <Text fontSize="13px" color="text.muted">
            {t.trade}
          </Text>
        </Stack>

        <DemoCard display="flex" py="12px" style={enterStyle(entered, 1)}>
          {stats}
        </DemoCard>

        <HStack gap="6px" flexWrap="wrap" style={enterStyle(entered, 2)}>
          {t.skills.map((skill) => (
            <Box
              key={skill}
              px="10px"
              py="5px"
              borderRadius="full"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.default"
              color="text.muted"
              fontSize="12px"
              fontWeight={500}
            >
              {skill}
            </Box>
          ))}
        </HStack>

        <Text
          fontSize="16px"
          fontWeight={500}
          letterSpacing="-0.01em"
          style={enterStyle(entered, 3)}
        >
          {t.reviewsTitle}
        </Text>
        {reviews}
        {done ? null : (
          <Box style={enterStyle(entered, 5)}>
            <Hotspot
              label={t.seeAll}
              onPress={trigger}
              pulse
              w="full"
              borderRadius="full"
            >
              <Box
                h="42px"
                borderRadius="full"
                borderWidth="1px"
                borderColor="border.strong"
                bg="bg.surface"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="14px"
                fontWeight={500}
              >
                {t.seeAll}
              </Box>
            </Hotspot>
          </Box>
        )}
      </Stack>
      <PhoneTabBar copy={copy.nav} active="account" unread={1} />
    </Box>
  )
}
