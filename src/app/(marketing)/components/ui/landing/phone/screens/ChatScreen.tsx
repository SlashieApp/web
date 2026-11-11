'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { type CSSProperties, useEffect, useState } from 'react'
import {
  LuArrowLeft,
  LuCalendar,
  LuChevronRight,
  LuEllipsis,
} from 'react-icons/lu'

import { PHONE_CROP_SCREEN_H } from '../PhoneFrame'
import type { PhoneCopy } from '../phoneCopy'
import { CompactBar, Hotspot, InitialAvatar } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

/** The compact composer: 10px over the field, the field (44px, 46px with a two-line draft) and the rest under it, down to the crop. */
const COMPACT_COMPOSER_H = 70

/** Clock times under the messages, as the app's thread shows them (demo data). */
const TIMES = { theirs: '09:12', mine: '09:14', sent: '09:15', reply: '09:16' }

function Bubble({
  mine,
  compact = false,
  arriving = false,
  time,
  children,
  style,
}: {
  mine: boolean
  compact?: boolean
  /** A message the beat adds: it fades and rises in. */
  arriving?: boolean
  /** The clock time under the last message of a run, as the app shows it. */
  time?: string
  children: string
  style?: CSSProperties
}) {
  return (
    <Stack
      style={style}
      css={
        arriving
          ? { animation: 'fade-rise 300ms cubic-bezier(0.2, 0, 0, 1) both' }
          : undefined
      }
      alignSelf={mine ? 'flex-end' : 'flex-start'}
      align={mine ? 'flex-end' : 'flex-start'}
      maxW="80%"
      gap="4px"
    >
      <Box
        px={compact ? '12px' : '14px'}
        py={compact ? '7px' : '8px'}
        borderRadius="16px"
        borderBottomRightRadius={mine ? '6px' : '16px'}
        borderBottomLeftRadius={mine ? '16px' : '6px'}
        bg={mine ? 'action.primary' : 'bg.surface'}
        color={mine ? 'text.onGreen' : 'text.default'}
        borderWidth={mine ? 0 : '1px'}
        borderColor="border.default"
        fontSize={compact ? '13px' : '14px'}
        lineHeight={compact ? 1.35 : '21px'}
      >
        {children}
      </Box>
      {time ? (
        <Text
          fontSize="12px"
          lineHeight="16px"
          color="text.muted"
          fontVariantNumeric="tabular-nums"
        >
          {time}
        </Text>
      ) : null}
    </Stack>
  )
}

/**
 * The booking card pinned under the thread's header once someone is booked
 * (the app's `ThreadBookingCard`): who, when and the agreed price, with a
 * chevron (in the app it opens the booking's sheet). `compact` is one slim
 * row for the cropped phone.
 */
function BookingCard({
  copy,
  compact = false,
}: {
  copy: PhoneCopy
  compact?: boolean
}) {
  const worker = copy.quotes.items[0]
  return (
    <Box
      data-chat-booking=""
      px={compact ? '10px' : '16px'}
      py={compact ? '4px' : '12px'}
      bg="bg.canvas"
      borderBottomWidth="1px"
      borderColor="border.default"
      flexShrink={0}
    >
      <HStack
        gap={compact ? '8px' : '12px'}
        h={compact ? '40px' : undefined}
        p={compact ? '0 10px' : '12px'}
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius={compact ? '10px' : '12px'}
      >
        {/* The cropped phone draws no text under 11px: its disc is 32. */}
        <InitialAvatar initials={worker.initials} size={compact ? 32 : 24} />
        {compact ? (
          <HStack gap="6px" flex={1} minW={0}>
            <Text
              fontSize="13px"
              lineHeight="18px"
              fontWeight={500}
              flexShrink={0}
            >
              {copy.chat.worker}
            </Text>
            <Text
              fontSize="12px"
              lineHeight="18px"
              color="text.muted"
              lineClamp={1}
            >
              {copy.hire.when}
            </Text>
          </HStack>
        ) : (
          <Stack gap="2px" flex={1} minW={0}>
            <Text
              fontSize="15px"
              lineHeight="20px"
              fontWeight={500}
              letterSpacing="-0.01em"
              lineClamp={1}
            >
              {copy.chat.worker}
            </Text>
            <HStack gap="6px" color="text.muted" minW={0}>
              <Box display="inline-flex" flexShrink={0} aria-hidden>
                <LuCalendar size={14} />
              </Box>
              <Text fontSize="14px" lineHeight="21px" lineClamp={1}>
                {copy.hire.when}
              </Text>
            </HStack>
          </Stack>
        )}
        <Text
          flexShrink={0}
          fontSize={compact ? '14px' : '18px'}
          lineHeight={compact ? '18px' : '24px'}
          fontWeight={600}
          fontVariantNumeric="tabular-nums"
        >
          {copy.hire.price}
        </Text>
        <Box display="inline-flex" color="text.subtle" aria-hidden>
          <LuChevronRight size={compact ? 14 : 16} />
        </Box>
      </HStack>
    </Box>
  )
}

/**
 * The composer, as the app draws it: the message box (the draft before the
 * beat, "Write a message" after) and Send, which is green only while there is
 * something to send.
 */
function Composer({
  copy,
  done,
  compact = false,
  onSend,
}: {
  copy: PhoneCopy
  done: boolean
  compact?: boolean
  onSend: () => void
}) {
  const t = copy.chat
  return (
    <>
      {/* The draft is whole: on the narrowest phones it takes two lines. */}
      <Box
        data-chat-field=""
        flex={1}
        minW={0}
        minH="44px"
        px="12px"
        py={compact ? '5px' : '10px'}
        borderRadius="8px"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        display="flex"
        alignItems="center"
        fontSize={compact ? '13px' : '16px'}
        lineHeight={compact ? '17px' : '24px'}
        color={done ? 'text.subtle' : 'text.default'}
      >
        {done ? t.composer : t.sent}
      </Box>
      <Hotspot
        label={t.sendLabel}
        onPress={onSend}
        pulse={!done}
        borderRadius="full"
        flexShrink={0}
      >
        <Box
          h="44px"
          px={compact ? '14px' : '20px'}
          borderRadius="full"
          bg={done ? 'bg.subtle' : 'action.primary'}
          color={done ? 'text.subtle' : 'text.onGreen'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize={compact ? '13px' : '15px'}
          fontWeight={500}
        >
          {t.send}
        </Box>
      </Hotspot>
    </>
  )
}

/**
 * Where the thread starts: the quote was accepted, so the two can message.
 * One short centred line, as the app's own thread draws it (the title in ink,
 * then the price and the booked slot), over a line that says what it opens.
 * The cropped phone keeps the first line only.
 */
function AcceptedLine({
  copy,
  compact = false,
  style,
}: {
  copy: PhoneCopy
  compact?: boolean
  style?: CSSProperties
}) {
  return (
    <Box
      data-chat-accepted=""
      alignSelf="center"
      textAlign="center"
      color="text.muted"
      style={style}
    >
      <Text fontSize="12px" lineHeight="17px">
        <Text as="span" fontWeight={500} color="text.default">
          {copy.hire.acceptedTitle}
        </Text>
        {` · ${copy.hire.price} · ${copy.hire.when}`}
      </Text>
      {compact ? null : (
        <Text fontSize="12px" lineHeight="17px">
          {copy.chat.acceptedBody}
        </Text>
      )}
    </Box>
  )
}

function TypingBubble() {
  return (
    <HStack
      alignSelf="flex-start"
      gap="4px"
      px="14px"
      py="12px"
      borderRadius="16px"
      borderBottomLeftRadius="6px"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      aria-hidden
    >
      {[0, 1, 2].map((n) => (
        <Box
          key={n}
          w="7px"
          h="7px"
          borderRadius="full"
          bg="text.subtle"
          animation={`typing-dot 1.1s ease-in-out ${n * 0.15}s infinite`}
        />
      ))}
    </HStack>
  )
}

/**
 * The task thread once a quote is accepted, laid out as the app's thread is
 * (FE-544): the other person over the task's title, the booking card pinned
 * under the header, the accepted line and a short chat on the grey timeline,
 * then the message box with Send. The visitor sends the draft and the worker
 * replies. `compact` is the cropped phone's layout: the bar, the booking
 * card as one row, the accepted line, then the message the visitor sends and
 * its reply, over a composer that ends above the crop.
 */
export function ChatScreen({
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
  const { entered, done, trigger, reduced } = useDemoBeat(active, intro)
  const [reply, setReply] = useState<'none' | 'typing' | 'sent'>('none')
  const t = copy.chat

  useEffect(() => {
    if (!done) {
      setReply('none')
      return
    }
    if (reduced) {
      setReply('sent')
      return
    }
    const typing = window.setTimeout(() => setReply('typing'), 700)
    const sent = window.setTimeout(() => setReply('sent'), 1900)
    return () => {
      window.clearTimeout(typing)
      window.clearTimeout(sent)
    }
  }, [done, reduced])

  // What the beat adds, the same in both layouts: the visitor's message, the
  // worker typing, then the reply. The full layout shows their times.
  const arrivals = (
    <>
      {done ? (
        <Bubble
          mine
          compact={compact}
          arriving
          time={compact ? undefined : TIMES.sent}
        >
          {t.sent}
        </Bubble>
      ) : null}
      {reply === 'typing' ? <TypingBubble /> : null}
      {reply === 'sent' ? (
        <Bubble
          mine={false}
          compact={compact}
          arriving
          time={compact ? undefined : TIMES.reply}
        >
          {t.reply}
        </Bubble>
      ) : null}
    </>
  )

  if (compact) {
    return (
      <Box position="absolute" inset={0} bg="bg.subtle">
        <CompactBar icon="back" title={t.worker} sub={copy.tasks.hedge.title} />
        <BookingCard copy={copy} compact />
        {/* A new thread is short: it sits at the top of its pane. */}
        <Stack gap="8px" px="12px" pt="8px">
          <AcceptedLine copy={copy} compact style={enterStyle(entered, 0)} />
          {arrivals}
        </Stack>
        <HStack
          position="absolute"
          left={0}
          right={0}
          top={`${PHONE_CROP_SCREEN_H - COMPACT_COMPOSER_H}px`}
          bottom={0}
          align="flex-start"
          gap="8px"
          px="10px"
          pt="10px"
          borderTopWidth="1px"
          borderColor="border.default"
          bg="bg.surface"
        >
          <Composer copy={copy} done={done} compact onSend={trigger} />
        </HStack>
      </Box>
    )
  }

  return (
    <Stack position="absolute" inset={0} gap={0} bg="bg.surface">
      {/* The app's thread header: back, the other person over the task, the menu. */}
      <HStack
        gap="8px"
        px="8px"
        py="10px"
        borderBottomWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        flexShrink={0}
      >
        <Box
          w="40px"
          h="40px"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          <LuArrowLeft size={20} />
        </Box>
        <InitialAvatar initials={copy.quotes.items[0].initials} size={24} />
        <Stack gap={0} flex={1} minW={0}>
          <Text
            fontSize="16px"
            lineHeight="24px"
            fontWeight={500}
            lineClamp={1}
          >
            {t.worker}
          </Text>
          <Text
            fontSize="12px"
            lineHeight="18px"
            color="text.muted"
            lineClamp={1}
          >
            {copy.tasks.hedge.title}
          </Text>
        </Stack>
        <Box
          w="40px"
          h="40px"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          <LuEllipsis size={20} />
        </Box>
      </HStack>

      <BookingCard copy={copy} />

      {/* The thread has just opened, so it is short: it sits at the top. */}
      <Stack
        flex={1}
        gap="8px"
        px="12px"
        py="16px"
        bg="bg.subtle"
        overflow="hidden"
      >
        <Text
          alignSelf="center"
          fontSize="12px"
          lineHeight="16px"
          color="text.muted"
          fontWeight={500}
        >
          {t.today}
        </Text>
        <AcceptedLine copy={copy} style={enterStyle(entered, 0)} />
        <Bubble mine={false} time={TIMES.theirs} style={enterStyle(entered, 1)}>
          {t.theirs}
        </Bubble>
        {/* One time per run: once the visitor sends, the run goes on. */}
        <Bubble
          mine
          time={done ? undefined : TIMES.mine}
          style={enterStyle(entered, 2)}
        >
          {t.mine}
        </Bubble>
        {arrivals}
      </Stack>

      <HStack
        align="flex-end"
        gap="8px"
        px="12px"
        pt="12px"
        pb="40px"
        borderTopWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        flexShrink={0}
      >
        <Composer copy={copy} done={done} onSend={trigger} />
      </HStack>
    </Stack>
  )
}
