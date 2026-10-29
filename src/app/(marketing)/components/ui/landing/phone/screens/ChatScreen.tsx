'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { type CSSProperties, useEffect, useState } from 'react'
import { LuArrowLeft, LuSendHorizontal } from 'react-icons/lu'

import type { PhoneCopy } from '../phoneCopy'
import { Hotspot } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

function Bubble({
  mine,
  children,
  style,
}: {
  mine: boolean
  children: string
  style?: CSSProperties
}) {
  return (
    <Box
      style={style}
      alignSelf={mine ? 'flex-end' : 'flex-start'}
      maxW="78%"
      px="14px"
      py="9px"
      borderRadius="18px"
      borderBottomRightRadius={mine ? '6px' : '18px'}
      borderBottomLeftRadius={mine ? '18px' : '6px'}
      bg={mine ? 'action.primary' : 'bg.surface'}
      color={mine ? 'text.onGreen' : 'text.default'}
      borderWidth={mine ? 0 : '1px'}
      borderColor="border.default"
      fontSize="15px"
      lineHeight={1.35}
    >
      {children}
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

/** The task thread: a quote flash, a short chat, then the visitor sends. */
export function ChatScreen({
  copy,
  active,
  intro,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
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

      <Stack
        flex={1}
        gap="10px"
        px="14px"
        py="14px"
        overflow="hidden"
        justify="flex-end"
      >
        <Text
          alignSelf="center"
          fontSize="12px"
          color="text.subtle"
          fontWeight={500}
        >
          {t.today}
        </Text>
        <Box
          alignSelf="center"
          w="88%"
          p="14px"
          borderRadius="12px"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.subtle"
          style={enterStyle(entered, 0)}
        >
          <Text fontSize="14px" fontWeight={500}>
            {t.flashTitle}
          </Text>
          <Text fontSize="13px" color="text.muted" mt="2px">
            {t.flashBody}
          </Text>
          <Box
            mt="10px"
            display="inline-flex"
            px="14px"
            py="6px"
            borderRadius="full"
            borderWidth="1px"
            borderColor="border.strong"
            bg="bg.surface"
            fontSize="13px"
            fontWeight={500}
          >
            {t.viewTask}
          </Box>
        </Box>
        <Bubble mine={false} style={enterStyle(entered, 1)}>
          {t.theirs}
        </Bubble>
        <Bubble mine style={enterStyle(entered, 2)}>
          {t.mine}
        </Bubble>
        {done ? (
          <Box
            alignSelf="flex-end"
            maxW="78%"
            css={{
              animation: 'fade-rise 300ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <Bubble mine>{t.sent}</Bubble>
          </Box>
        ) : null}
        {reply === 'typing' ? <TypingBubble /> : null}
        {reply === 'sent' ? (
          <Box
            alignSelf="flex-start"
            maxW="78%"
            css={{
              animation: 'fade-rise 300ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <Bubble mine={false}>{t.reply}</Bubble>
          </Box>
        ) : null}
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
