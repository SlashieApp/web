'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuBadgeCheck, LuStar } from 'react-icons/lu'

import type { PhoneCopy } from '../phoneCopy'
import {
  DemoCard,
  Hotspot,
  InitialAvatar,
  PhoneTabBar,
  Stars,
} from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <Stack gap={0} flex={1} align="center">
      <Text fontSize="18px" fontWeight={600} fontVariantNumeric="tabular-nums">
        {value}
      </Text>
      <Text fontSize="11px" color="text.muted" fontWeight={500}>
        {label}
      </Text>
    </Stack>
  )
}

/** The worker's public profile: rating, jobs, skills and reviews. */
export function ProfileScreen({
  copy,
  active,
  intro,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
}) {
  const { entered, done, trigger } = useDemoBeat(active, intro)
  const t = copy.profile
  const [firstReview, ...moreReviews] = t.items
  const shown = done ? [firstReview, ...moreReviews] : [firstReview]

  return (
    <Box position="absolute" inset={0} bg="bg.canvas">
      <Box
        h="96px"
        bgGradient="to-br"
        gradientFrom="status.success.soft"
        gradientTo="status.success.border"
      />
      <Stack px="16px" mt="-44px" gap="12px">
        <Stack align="center" gap="6px" style={enterStyle(entered, 0)}>
          <Box borderRadius="full" borderWidth="4px" borderColor="bg.canvas">
            <InitialAvatar initials={t.initials} size={80} />
          </Box>
          <HStack gap="6px">
            <Text fontSize="21px" fontWeight={500}>
              {t.name}
            </Text>
            <Box color="status.success.fg" display="inline-flex">
              <LuBadgeCheck size={20} aria-hidden />
            </Box>
          </HStack>
          <Text fontSize="13px" color="text.muted">
            {t.trade}
          </Text>
        </Stack>

        <DemoCard display="flex" py="12px" style={enterStyle(entered, 1)}>
          <Stat
            value={
              <HStack gap="4px" as="span">
                <Box
                  as="span"
                  color="status.warning.solid"
                  display="inline-flex"
                >
                  <LuStar size={16} fill="currentColor" aria-hidden />
                </Box>
                {t.rating}
              </HStack>
            }
            label={t.reviews}
          />
          <Box w="1px" bg="border.default" />
          <Stat value={t.jobs} label={t.jobsLabel} />
          <Box w="1px" bg="border.default" />
          <Stat value={t.response} label={t.responseLabel} />
        </DemoCard>

        <HStack gap="6px" flexWrap="wrap" style={enterStyle(entered, 2)}>
          {t.skills.map((skill) => (
            <Box
              key={skill}
              px="10px"
              py="5px"
              borderRadius="full"
              bg="status.success.soft"
              color="status.success.fg"
              fontSize="12px"
              fontWeight={500}
            >
              {skill}
            </Box>
          ))}
        </HStack>

        <Text fontSize="16px" fontWeight={500} style={enterStyle(entered, 3)}>
          {t.reviewsTitle}
        </Text>
        {shown.map((review, index) => (
          <DemoCard
            key={review.author}
            p="12px"
            style={index === 0 ? enterStyle(entered, 4) : undefined}
            css={
              index === 0
                ? undefined
                : {
                    animation: `rise-in 360ms cubic-bezier(0.2, 0, 0, 1) ${index * 90}ms both`,
                  }
            }
          >
            <HStack justify="space-between">
              <Text fontSize="13px" fontWeight={500}>
                {review.author}
              </Text>
              <Stars filled={5} size={11} />
            </HStack>
            <Text fontSize="13px" color="text.muted" mt="4px">
              {review.text}
            </Text>
          </DemoCard>
        ))}
        {done ? null : (
          <Box style={enterStyle(entered, 5)}>
            <Hotspot label={t.seeAll} onPress={trigger} pulse w="full">
              <Box
                h="42px"
                borderRadius="12px"
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
