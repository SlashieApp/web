'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuArrowLeft, LuCalendar, LuMapPin, LuTag } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlElevation, sdlFigure } from '@/theme/styles'

import { PhoneMap, PricePin } from '../PhoneMap'
import type { PhoneCopy } from '../phoneCopy'
import {
  DemoCard,
  Hotspot,
  InitialAvatar,
  MetaChip,
  Stars,
} from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

type QuoteItem = PhoneCopy['quotes']['items'][number]

function QuoteRow({
  quote,
  copy,
  expanded,
}: {
  quote: QuoteItem
  copy: PhoneCopy['quotes']
  expanded: boolean
}) {
  return (
    <DemoCard p="12px">
      <HStack gap="10px" align="flex-start">
        <InitialAvatar initials={quote.initials} size={42} />
        <Stack gap="2px" flex={1} minW={0}>
          <Text fontSize="15px" fontWeight={500}>
            {quote.name}
          </Text>
          <HStack gap="4px">
            <Stars filled={5} size={12} />
            <Text fontSize="12px" color="text.muted" fontWeight={500}>
              {quote.rating}{' '}
              {formatMessage(copy.reviews, { count: quote.reviews })}
            </Text>
          </HStack>
        </Stack>
        <Text fontSize="20px" color="text.default" {...sdlFigure}>
          {quote.price}
        </Text>
      </HStack>
      <Text
        mt="8px"
        fontSize="13px"
        color="text.muted"
        lineClamp={expanded ? undefined : 1}
      >
        {quote.note}
      </Text>
      {expanded ? (
        <HStack
          mt="8px"
          gap="8px"
          fontSize="12px"
          fontWeight={500}
          color="text.muted"
          css={{ animation: 'fade-rise 320ms cubic-bezier(0.2, 0, 0, 1) both' }}
        >
          <Text>{formatMessage(copy.jobs, { count: quote.jobs })}</Text>
          <Text aria-hidden>·</Text>
          <Text>{copy.replies}</Text>
        </HStack>
      ) : null}
    </DemoCard>
  )
}

/** Task detail on its Quotes tab: three quotes arrive; tap one to read it. */
export function QuotesScreen({
  copy,
  active,
  intro,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
}) {
  const { entered, done, trigger } = useDemoBeat(active, intro)
  const task = copy.tasks.hedge
  const t = copy.quotes
  const [first, ...rest] = t.items

  return (
    <Box position="absolute" inset={0} bg="bg.canvas">
      <Box position="relative" h="200px" overflow="hidden">
        <PhoneMap
          css={{
            '& svg': { transform: 'scale(1.25)', transformOrigin: '60% 85%' },
          }}
        />
        <Box
          position="absolute"
          left="50%"
          top="58%"
          transform="translate(-50%, -100%)"
        >
          <PricePin price={task.price} selected={false} />
        </Box>
        <Box
          position="absolute"
          left="14px"
          top="10px"
          w="38px"
          h="38px"
          borderRadius="full"
          bg="bg.surface"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow={sdlElevation.e2}
          aria-hidden
        >
          <LuArrowLeft size={20} />
        </Box>
      </Box>

      <Stack
        gap="12px"
        px="16px"
        pt="16px"
        mt="-18px"
        position="relative"
        bg="bg.canvas"
        borderTopRadius="20px"
        minH="calc(100% - 182px)"
      >
        <Stack gap="8px">
          <HStack gap="6px">
            <Box w="8px" h="8px" borderRadius="full" bg="action.primary" />
            <Text fontSize="12px" fontWeight={500} color="status.success.fg">
              {t.status}
            </Text>
          </HStack>
          <Text
            fontSize="21px"
            fontWeight={500}
            lineHeight={1.2}
            letterSpacing="-0.015em"
          >
            {task.title}
          </Text>
          <HStack gap="6px" flexWrap="wrap">
            <MetaChip>
              <LuMapPin size={12} aria-hidden />
              {task.area}
            </MetaChip>
            <MetaChip>
              <LuCalendar size={12} aria-hidden />
              {copy.post.whenValue}
            </MetaChip>
            <MetaChip>
              <LuTag size={12} aria-hidden />
              {t.category}
            </MetaChip>
          </HStack>
        </Stack>

        <HStack borderBottomWidth="1px" borderColor="border.default" gap={0}>
          <Text
            flex={1}
            textAlign="center"
            py="10px"
            fontSize="14px"
            fontWeight={500}
            color="text.subtle"
          >
            {t.overview}
          </Text>
          <HStack
            flex={1}
            justify="center"
            gap="6px"
            py="10px"
            borderBottomWidth="2px"
            borderColor="accent.active"
            mb="-1px"
          >
            <Text fontSize="14px" fontWeight={500}>
              {t.tab}
            </Text>
            <Box
              px="7px"
              borderRadius="full"
              bg="bg.subtle"
              fontSize="12px"
              fontWeight={600}
              fontVariantNumeric="tabular-nums"
            >
              {t.items.length}
            </Box>
          </HStack>
        </HStack>

        <Box style={enterStyle(entered, 0)}>
          <Hotspot
            label={formatMessage(t.expand, { name: first.name })}
            onPress={trigger}
            pulse={!done}
            w="full"
          >
            <QuoteRow quote={first} copy={t} expanded={done} />
          </Hotspot>
        </Box>
        {rest.map((quote, index) => (
          <Box key={quote.name} style={enterStyle(entered, index + 1)}>
            <QuoteRow quote={quote} copy={t} expanded={false} />
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
