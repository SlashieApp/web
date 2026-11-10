'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { type CSSProperties, useEffect, useState } from 'react'
import { LuArrowLeft, LuSendHorizontal } from 'react-icons/lu'

import { PHONE_CROP_SCREEN_H } from '../PhoneFrame'
import type { PhoneCopy } from '../phoneCopy'
import { CompactBar, Hotspot } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

/** The compact composer: 10px over the field, the field (44px, 46px with a two-line draft) and the rest under it, down to the crop. */
const COMPACT_COMPOSER_H = 70

function Bubble({
  mine,
  compact = false,
  arriving = false,
  children,
  style,
}: {
  mine: boolean
  compact?: boolean
  /** A message the beat adds: it fades and rises in. */
  arriving?: boolean
  children: string
  style?: CSSProperties
}) {
  return (
    <Box
      style={style}
      css={
        arriving
          ? { animation: 'fade-rise 300ms cubic-bezier(0.2, 0, 0, 1) both' }
          : undefined
      }
      alignSelf={mine ? 'flex-end' : 'flex-start'}
      maxW="78%"
      px={compact ? '12px' : '14px'}
      py={compact ? '7px' : '9px'}
      borderRadius="18px"
      borderBottomRightRadius={mine ? '6px' : '18px'}
      borderBottomLeftRadius={mine ? '18px' : '6px'}
      bg={mine ? 'action.primary' : 'bg.surface'}
      color={mine ? 'text.onGreen' : 'text.default'}
      borderWidth={mine ? 0 : '1px'}
      borderColor="border.default"
      fontSize={compact ? '13px' : '15px'}
      lineHeight={1.35}
    >
      {children}
    </Box>
  )
}

/**
 * Where the thread starts: the quote was accepted, so the two can message.
 * One short centred line, as the app's own thread draws it (the title in ink,
 * then the price and the booked slot), over a line that says what it opens.
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
      <Text fontSize={compact ? '12px' : '13px'} lineHeight={1.4}>
        <Text as="span" fontWeight={500} color="text.default">
          {copy.hire.acceptedTitle}
        </Text>
        {` · ${copy.hire.price} · ${copy.hire.when}`}
      </Text>
      <Text fontSize={compact ? '11px' : '13px'} lineHeight={1.4}>
        {copy.chat.acceptedBody}
      </Text>
    </Box>
  )
}

function TypingBubble() {
  return (
    <HStack
      alignSelf="flex-start"
      gap="4px"
      px="14px"
      py="13px"
      borderRadius="18px"
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
 * The task thread, which opens when a quote is accepted: the accepted line, a
 * short chat, then the visitor sends. `compact` is the cropped phone's
 * layout: the accepted line, then the message the visitor sends and its
 * reply, over a composer that ends above the crop.
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
  // worker typing, then the reply.
  const arrivals = (
    <>
      {done ? (
        <Bubble mine compact={compact} arriving>
          {t.sent}
        </Bubble>
      ) : null}
      {reply === 'typing' ? <TypingBubble /> : null}
      {reply === 'sent' ? (
        <Bubble mine={false} compact={compact} arriving>
          {t.reply}
        </Bubble>
      ) : null}
    </>
  )

  if (compact) {
    return (
      <Box position="absolute" inset={0} bg="bg.canvas">
        <CompactBar icon="back" title={copy.tasks.hedge.title} sub={t.worker} />
        {/* A new thread is short: it sits at the top of its pane. */}
        <Stack gap="8px" px="12px" pt="12px">
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
          {/* The draft is whole: on the narrowest phones it takes two lines. */}
          <Box
            flex={1}
            minW={0}
            minH="44px"
            px="14px"
            py="5px"
            borderRadius="22px"
            borderWidth="1px"
            borderColor="border.default"
            display="flex"
            alignItems="center"
            fontSize="13px"
            lineHeight="17px"
            color={done ? 'text.subtle' : 'text.default'}
          >
            {done ? t.composer : t.sent}
          </Box>
          <Hotspot
            label={t.sendLabel}
            onPress={trigger}
            pulse={!done}
            borderRadius="full"
            flexShrink={0}
          >
            <Box
              w="44px"
              h="44px"
              borderRadius="full"
              bg="action.primary"
              color="text.onGreen"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <LuSendHorizontal size={18} aria-hidden />
            </Box>
          </Hotspot>
        </HStack>
      </Box>
    )
  }

  return (
    <Stack position="absolute" inset={0} gap={0} bg="bg.canvas">
      <HStack
        h="58px"
        px="12px"
        gap="10px"
        borderBottomWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
      >
        <Box display="inline-flex" aria-hidden>
          <LuArrowLeft size={22} />
        </Box>
        <Stack gap={0} flex={1} minW={0}>
          <Text
            fontSize="15px"
            fontWeight={500}
            letterSpacing="-0.01em"
            lineClamp={1}
          >
            {copy.tasks.hedge.title}
          </Text>
          <Text fontSize="12px" color="text.muted">
            {t.worker}
          </Text>
        </Stack>
        <Text fontSize="13px" fontWeight={500} color="text.link">
          {t.viewTask}
        </Text>
      </HStack>

      {/* The thread has just opened, so it is short: it sits at the top. */}
      <Stack flex={1} gap="10px" px="14px" py="14px" overflow="hidden">
        <Text
          alignSelf="center"
          fontSize="12px"
          color="text.subtle"
          fontWeight={500}
        >
          {t.today}
        </Text>
        <AcceptedLine copy={copy} style={enterStyle(entered, 0)} />
        <Bubble mine={false} style={enterStyle(entered, 1)}>
          {t.theirs}
        </Bubble>
        <Bubble mine style={enterStyle(entered, 2)}>
          {t.mine}
        </Bubble>
        {arrivals}
      </Stack>

      <HStack
        gap="8px"
        px="12px"
        pt="10px"
        pb="40px"
        borderTopWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
      >
        <Box
          flex={1}
          h="44px"
          px="14px"
          borderRadius="22px"
          borderWidth="1px"
          borderColor="border.default"
          display="flex"
          alignItems="center"
          fontSize="15px"
          color={done ? 'text.subtle' : 'text.default'}
        >
          {done ? t.composer : t.sent}
        </Box>
        <Hotspot
          label={t.sendLabel}
          onPress={trigger}
          pulse={!done}
          borderRadius="full"
        >
          <Box
            w="44px"
            h="44px"
            borderRadius="full"
            bg="action.primary"
            color="text.onGreen"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <LuSendHorizontal size={20} aria-hidden />
          </Box>
        </Hotspot>
      </HStack>
    </Stack>
  )
}
