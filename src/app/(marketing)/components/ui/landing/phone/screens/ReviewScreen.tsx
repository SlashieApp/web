'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuArrowLeft, LuCheck, LuStar } from 'react-icons/lu'

import type { PhoneCopy } from '../phoneCopy'
import { DemoPrimary, Hotspot, InitialAvatar } from '../phoneParts'
import { enterStyle, useDemoBeat, useTypewriter } from '../useDemoBeat'

/** The review prompt flash: tap the stars, the words follow. */
export function ReviewScreen({
  copy,
  active,
  intro,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
}) {
  const { entered, done, trigger, reduced } = useDemoBeat(active, intro)
  const text = useTypewriter(copy.review.text, done, reduced, 700)
  const t = copy.review
  const quote = copy.quotes.items[0]

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
            {copy.chat.worker}
          </Text>
        </Stack>
      </HStack>

      <Stack flex={1} justify="center" px="16px" gap="12px">
        <Stack
          align="center"
          gap="14px"
          p="20px"
          borderRadius="16px"
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          style={enterStyle(entered, 0)}
        >
          <InitialAvatar initials={quote.initials} size={56} />
          <Stack gap="2px" align="center">
            <Text fontSize="18px" fontWeight={500} letterSpacing="-0.01em">
              {t.title}
            </Text>
            <Text fontSize="14px" color="text.muted">
              {t.body}
            </Text>
          </Stack>

          <Hotspot
            label={t.rate}
            onPress={trigger}
            pulse={!done}
            px="6px"
            py="4px"
          >
            <HStack gap="6px">
              {[0, 1, 2, 3, 4].map((n) => (
                <Box
                  key={n}
                  display="inline-flex"
                  color={done ? 'status.warning.solid' : 'border.strong'}
                  style={{
                    transform: done ? 'scale(1)' : 'scale(0.9)',
                    transition: `transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1) ${n * 80}ms, color 200ms ease ${n * 80}ms`,
                  }}
                >
                  <LuStar
                    size={34}
                    fill={done ? 'currentColor' : 'none'}
                    strokeWidth={1.8}
                    aria-hidden
                  />
                </Box>
              ))}
            </HStack>
          </Hotspot>

          <Box
            w="full"
            minH="76px"
            px="12px"
            py="10px"
            borderRadius="8px"
            borderWidth="1px"
            borderColor="border.strong"
            bg="bg.surface"
            fontSize="14px"
            color={done ? 'text.default' : 'text.subtle'}
          >
            {done ? text : t.placeholder}
          </Box>

          <DemoPrimary w="full" opacity={done ? 1 : 0.5}>
            {t.submit}
          </DemoPrimary>
        </Stack>

        {done && text === t.text ? (
          <HStack
            alignSelf="center"
            gap="6px"
            color="status.success.fg"
            fontSize="14px"
            fontWeight={500}
            css={{
              animation: 'fade-rise 320ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <LuCheck size={16} aria-hidden />
            <Text>{t.thanks}</Text>
          </HStack>
        ) : null}
      </Stack>
    </Stack>
  )
}
