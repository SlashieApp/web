'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCheck, LuMapPin, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'

import type { PhoneCopy } from '../phoneCopy'
import {
  CompactBar,
  CompactToast,
  DemoCard,
  DemoPrimary,
  Hotspot,
} from '../phoneParts'
import { enterStyle, useDemoBeat, useTypewriter } from '../useDemoBeat'

/**
 * The worker's quote form: price, a short message, "Send quote". `compact` is
 * the cropped phone's layout: the task in two lines, the price in a row (with
 * the customer's budget under its label), the message and the button.
 */
export function WorkerQuoteScreen({
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
  const message = useTypewriter(copy.worker.message, entered, reduced, 500)
  const t = copy.worker
  const task = copy.tasks.wardrobe
  // The button says what it shows: "Send quote", then "Quote sent".
  const submit = done ? t.sentTitle : t.submit

  if (compact) {
    return (
      <Stack position="absolute" inset={0} gap={0} bg="bg.canvas">
        <CompactBar icon="close" title={t.header} />
        {/* 18px under the bar: the toast may be two lines on a narrow phone. */}
        <Stack gap="8px" px="12px" pt="18px">
          <Box style={enterStyle(entered, 0)}>
            <Text
              fontSize="13px"
              lineHeight="18px"
              fontWeight={500}
              lineClamp={1}
            >
              {task.title}
            </Text>
            <Text
              fontSize="11px"
              lineHeight="15px"
              color="text.muted"
              lineClamp={1}
            >
              {task.area} · {t.postedBy}
            </Text>
          </Box>
          <HStack justify="space-between" style={enterStyle(entered, 1)}>
            <Box color="text.muted">
              <Text fontSize="12px" lineHeight="16px" fontWeight={500}>
                {t.priceLabel}
              </Text>
              <Text fontSize="11px" lineHeight="15px">
                {formatMessage(t.budget, { price: task.price })}
              </Text>
            </Box>
            <Box
              px="10px"
              py="3px"
              borderRadius="8px"
              borderWidth="1px"
              borderColor="border.focus"
              boxShadow="0 0 0 1px var(--chakra-colors-border-focus)"
              bg="bg.surface"
              fontSize="18px"
              lineHeight="26px"
              fontWeight={600}
              fontVariantNumeric="tabular-nums"
            >
              {t.price}
            </Box>
          </HStack>
          <Box
            minH="54px"
            px="10px"
            py="8px"
            borderRadius="8px"
            borderWidth="1px"
            borderColor="border.strong"
            bg="bg.surface"
            fontSize="13px"
            lineHeight="18px"
            style={enterStyle(entered, 2)}
          >
            {message}
          </Box>
          <Box pt="2px" style={enterStyle(entered, 3)}>
            <Hotspot
              label={submit}
              onPress={trigger}
              pulse={!done}
              w="full"
              borderRadius="full"
            >
              <DemoPrimary h="44px" fontSize="14px">
                {done ? <LuCheck size={16} aria-hidden /> : null}
                {submit}
              </DemoPrimary>
            </Hotspot>
          </Box>
        </Stack>
        {done ? <CompactToast title={t.sentTitle} body={t.sentBody} /> : null}
      </Stack>
    )
  }

  return (
    <Stack position="absolute" inset={0} gap={0} bg="bg.canvas">
      <HStack
        h="52px"
        px="16px"
        justify="space-between"
        borderBottomWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
      >
        <Box display="inline-flex" aria-hidden>
          <LuX size={22} />
        </Box>
        <Text fontSize="16px" fontWeight={500} letterSpacing="-0.01em">
          {t.header}
        </Text>
        <Box w="22px" />
      </HStack>

      <Stack gap="12px" p="16px" flex={1}>
        <DemoCard style={enterStyle(entered, 0)}>
          <Text fontSize="16px" fontWeight={500} letterSpacing="-0.01em">
            {task.title}
          </Text>
          <HStack mt="4px" gap="4px" fontSize="13px" color="text.muted">
            <LuMapPin size={13} aria-hidden />
            <Text>{task.area}</Text>
            <Text aria-hidden>·</Text>
            <Text>{t.postedBy}</Text>
          </HStack>
          <Text mt="8px" fontSize="13px" fontWeight={500} color="text.muted">
            {formatMessage(t.budget, { price: task.price })}
          </Text>
        </DemoCard>

        <DemoCard style={enterStyle(entered, 1)}>
          <Text fontSize="13px" fontWeight={500} color="text.muted" mb="6px">
            {t.priceLabel}
          </Text>
          <Box
            px="12px"
            py="8px"
            borderRadius="8px"
            borderWidth="1px"
            borderColor="border.focus"
            boxShadow="0 0 0 1px var(--chakra-colors-border-focus)"
            bg="bg.surface"
            fontSize="26px"
            fontWeight={600}
            fontVariantNumeric="tabular-nums"
          >
            {t.price}
          </Box>
        </DemoCard>

        <DemoCard style={enterStyle(entered, 2)}>
          <Text fontSize="13px" fontWeight={500} color="text.muted" mb="6px">
            {t.messageLabel}
          </Text>
          <Box
            minH="88px"
            px="12px"
            py="10px"
            borderRadius="8px"
            borderWidth="1px"
            borderColor="border.strong"
            bg="bg.surface"
            fontSize="14px"
            lineHeight={1.45}
          >
            {message}
          </Box>
        </DemoCard>
      </Stack>

      {done ? (
        <Box
          position="absolute"
          left="16px"
          right="16px"
          top="62px"
          zIndex={3}
          css={{ animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both' }}
        >
          <DemoCard
            display="flex"
            gap="12px"
            alignItems="center"
            bg="status.success.soft"
            borderColor="status.success.border"
          >
            <Box
              w="36px"
              h="36px"
              borderRadius="full"
              bg="action.primary"
              color="text.onGreen"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <LuCheck size={20} aria-hidden />
            </Box>
            <Stack gap={0}>
              <Text fontSize="15px" fontWeight={500}>
                {t.sentTitle}
              </Text>
              <Text fontSize="13px" color="text.muted">
                {t.sentBody}
              </Text>
            </Stack>
          </DemoCard>
        </Box>
      ) : null}

      <Box px="16px" pb="44px" style={enterStyle(entered, 3)}>
        <Hotspot
          label={submit}
          onPress={trigger}
          pulse={!done}
          w="full"
          borderRadius="full"
        >
          <DemoPrimary>
            {done ? <LuCheck size={18} aria-hidden /> : null}
            {submit}
          </DemoPrimary>
        </Hotspot>
      </Box>
    </Stack>
  )
}
