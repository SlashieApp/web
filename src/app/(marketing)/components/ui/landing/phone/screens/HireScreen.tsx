'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LuEye } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'

import { PHONE_CROP_SCREEN_H, phoneCropFade } from '../PhoneFrame'
import type { PhoneCopy } from '../phoneCopy'
import { CompactBar, Hotspot } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'
import {
  AcceptPill,
  AppQuoteRow,
  PinnedAction,
  PinnedBar,
  QuoteDisc,
  QuotesHead,
  TaskAppBar,
} from './taskPageParts'

/**
 * What the screen shows: the quotes, the accept sheet over them, its Accept
 * quote being pressed, then the booked page.
 */
type Phase = 'list' | 'sheet' | 'confirming' | 'booked'

/** The sheet is read for this long, then Accept quote is pressed, then the booking lands. */
const CONFIRM_MS = 1300
const BOOKED_MS = 1750

/** How much of the cropped phone the compact accept sheet covers. */
const COMPACT_SHEET_H = 142

/** One of the times the worker offered: a radio row, as the app's slot picker. */
function SlotOption({
  label,
  selected,
  compact = false,
}: {
  label: string
  selected: boolean
  compact?: boolean
}) {
  return (
    <HStack
      gap="10px"
      h={compact ? '40px' : '48px'}
      px="12px"
      borderRadius="8px"
      borderWidth="1px"
      borderColor={selected ? 'accent.active' : 'border.default'}
      bg="bg.surface"
    >
      <Box
        w="18px"
        h="18px"
        flexShrink={0}
        borderRadius="full"
        borderWidth={selected ? '5px' : '1.5px'}
        borderColor={selected ? 'accent.active' : 'border.strong'}
        bg="bg.surface"
        aria-hidden
      />
      <Text
        fontSize={compact ? '12px' : '14px'}
        lineHeight={compact ? '16px' : '20px'}
        fontWeight={selected ? 500 : 400}
        fontVariantNumeric="tabular-nums"
        lineClamp={1}
      >
        {label}
      </Text>
    </HStack>
  )
}

/**
 * The app's accept sheet (`SafetyConfirmDialog`, a bottom sheet on a phone):
 * "Accept this quote?", what accepting means, the worker's times to pick
 * from, then Accept quote. It rises over a scrim. The cropped phone keeps the
 * title, the picked time and the button.
 */
function AcceptSheet({
  copy,
  open,
  pressing,
  compact = false,
}: {
  copy: PhoneCopy['hire']
  open: boolean
  pressing: boolean
  compact?: boolean
}) {
  return (
    <>
      <Box
        position="absolute"
        inset={0}
        zIndex={2}
        bg="blackAlpha.500"
        opacity={open ? 1 : 0}
        pointerEvents="none"
        transition="opacity 320ms cubic-bezier(0.2, 0, 0, 1)"
        aria-hidden
      />
      <Stack
        data-accept-sheet=""
        aria-hidden={!open}
        position="absolute"
        left={0}
        right={0}
        top={compact ? `${PHONE_CROP_SCREEN_H - COMPACT_SHEET_H}px` : undefined}
        bottom={0}
        zIndex={3}
        gap={0}
        px={compact ? '12px' : '16px'}
        pt="8px"
        pb={compact ? '12px' : '34px'}
        bg="bg.surface"
        borderTopRadius="16px"
        transform={open ? 'none' : 'translateY(105%)'}
        visibility={open ? 'visible' : 'hidden'}
        transition="transform 360ms cubic-bezier(0.2, 0, 0, 1), visibility 0s linear"
        transitionDelay={open ? '0s' : '0s, 360ms'}
      >
        <Box
          alignSelf="center"
          w="36px"
          h="4px"
          borderRadius="full"
          bg="border.strong"
          mb={compact ? '8px' : '12px'}
          aria-hidden
        />
        <Text
          fontSize={compact ? '15px' : '20px'}
          lineHeight={compact ? '20px' : '26px'}
          fontWeight={600}
          letterSpacing="-0.01em"
        >
          {copy.acceptTitle}
        </Text>
        {compact ? null : (
          <>
            <Text fontSize="14px" lineHeight="21px" color="text.muted" mt="8px">
              {copy.acceptHint}
            </Text>
            <Text fontSize="14px" lineHeight="17px" fontWeight={500} mt="24px">
              {copy.pickSlot}
            </Text>
          </>
        )}
        <Stack gap="8px" mt="8px">
          <SlotOption label={copy.slot} selected compact={compact} />
          {compact ? null : (
            <SlotOption label={copy.otherSlot} selected={false} />
          )}
        </Stack>
        <Box
          mt={compact ? '8px' : '20px'}
          h={compact ? '40px' : '48px'}
          borderRadius="full"
          bg="action.primary"
          color="text.onGreen"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize={compact ? '13px' : '15px'}
          fontWeight={500}
          transform={pressing ? 'scale(0.97)' : 'none'}
          filter={pressing ? 'brightness(0.94)' : 'none'}
          transition="transform 140ms ease-out, filter 140ms ease-out"
        >
          {copy.acceptCta}
        </Box>
      </Stack>
    </>
  )
}

/** A label and its value, as the booked page's rows. */
function BookedRow({
  label,
  value,
  strong = false,
  compact = false,
}: {
  label: string
  value: string
  strong?: boolean
  compact?: boolean
}) {
  return (
    <HStack
      justify="space-between"
      gap="12px"
      py={compact ? '4px' : '12px'}
      borderTopWidth={compact ? 0 : '1px'}
      borderColor="border.default"
    >
      <Text
        fontSize={compact ? '12px' : '14px'}
        lineHeight={compact ? '16px' : '20px'}
        color="text.muted"
        flexShrink={0}
      >
        {label}
      </Text>
      <Text
        fontSize={compact ? '12px' : '14px'}
        lineHeight={compact ? '16px' : '20px'}
        fontWeight={strong ? 600 : 500}
        fontVariantNumeric="tabular-nums"
        textAlign="end"
        lineClamp={1}
      >
        {value}
      </Text>
    </HStack>
  )
}

/** The status pill of a booked task: Awarded. */
function AwardedPill({ label, compact }: { label: string; compact: boolean }) {
  return (
    <HStack
      alignSelf="flex-start"
      gap="6px"
      px="8px"
      borderRadius="full"
      bg="status.success.soft"
      color="status.success.fg"
      fontSize={compact ? '11px' : '12px'}
      lineHeight="20px"
      fontWeight={500}
    >
      <Box w="6px" h="6px" borderRadius="full" bg="action.primary" />
      {label}
    </HStack>
  )
}

/**
 * Hiring, as the app does it: on the task page's quotes the customer taps
 * Accept on the one they like, the accept sheet rises (what accepting means
 * and the worker's times), Accept quote is pressed, and the page shows the
 * booking: Awarded, "Worker booked", their worker with Message, the time and
 * the agreed total. `compact` is the cropped phone's layout of the same
 * three states.
 */
export function HireScreen({
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
  const [phase, setPhase] = useState<Phase>('list')
  const task = copy.tasks.hedge
  const q = copy.quotes
  const t = copy.hire
  const [best, ...rest] = q.items

  useEffect(() => {
    if (!done) {
      setPhase('list')
      return
    }
    if (reduced) {
      setPhase('booked')
      return
    }
    setPhase('sheet')
    const confirm = window.setTimeout(() => setPhase('confirming'), CONFIRM_MS)
    const booked = window.setTimeout(() => setPhase('booked'), BOOKED_MS)
    return () => {
      window.clearTimeout(confirm)
      window.clearTimeout(booked)
    }
  }, [done, reduced])

  const booked = phase === 'booked'
  const sheetOpen = phase === 'sheet' || phase === 'confirming'

  // The quotes, with Accept on the best one as the screen's tap target.
  const list = (
    <>
      <QuotesHead label={q.heading} count={q.items.length} compact={compact} />
      <Box style={enterStyle(entered, 0)}>
        <AppQuoteRow
          quote={best}
          copy={q}
          best
          compact={compact}
          accept={
            <Hotspot
              label={q.accept}
              onPress={trigger}
              pulse={!done}
              borderRadius="full"
            >
              <AcceptPill label={q.accept} compact={compact} />
            </Hotspot>
          }
        />
      </Box>
      {rest.map((quote, index) => (
        <Box key={quote.name} style={enterStyle(entered, index + 1)}>
          <AppQuoteRow
            quote={quote}
            copy={q}
            compact={compact}
            divider={index < rest.length - 1}
          />
        </Box>
      ))}
    </>
  )

  if (compact) {
    return (
      <Box position="absolute" inset={0} bg="bg.surface" overflow="hidden">
        <CompactBar
          icon="back"
          title={task.title}
          sub={
            booked
              ? t.awarded
              : `${task.area} · ${formatMessage(copy.search.quotes, { count: q.items.length })}`
          }
        />
        {booked ? (
          <Stack
            data-booked=""
            gap="6px"
            px="12px"
            pt="10px"
            css={{
              animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <AwardedPill label={t.awarded} compact />
            <Text fontSize="15px" lineHeight="20px" fontWeight={600}>
              {t.bookedHeadline}
            </Text>
            <HStack
              gap="10px"
              p="10px"
              mt="4px"
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="12px"
            >
              <QuoteDisc name={best.name} size={32} />
              <Box flex={1} minW={0}>
                <Text fontSize="11px" lineHeight="14px" color="text.muted">
                  {t.yourWorker}
                </Text>
                <Text fontSize="13px" lineHeight="18px" fontWeight={500}>
                  {best.name}
                </Text>
              </Box>
              <Box
                h="36px"
                px="14px"
                borderRadius="full"
                bg="action.primary"
                color="text.onGreen"
                display="flex"
                alignItems="center"
                fontSize="13px"
                fontWeight={500}
              >
                {t.message}
              </Box>
            </HStack>
            <Box pt="2px">
              <BookedRow label={t.schedule} value={t.slot} compact />
              <BookedRow label={t.agreedTotal} value={t.price} strong compact />
            </Box>
          </Stack>
        ) : (
          <Stack gap={0} px="12px" pt="10px" css={phoneCropFade(44)}>
            {list}
          </Stack>
        )}
        <AcceptSheet
          copy={t}
          open={sheetOpen}
          pressing={phase === 'confirming'}
          compact
        />
      </Box>
    )
  }

  return (
    <Box position="absolute" inset={0} bg="bg.surface" overflow="hidden">
      <TaskAppBar title={task.title} />
      {booked ? (
        <>
          <Stack
            data-booked=""
            gap="8px"
            px="16px"
            pt="20px"
            css={{
              animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <AwardedPill label={t.awarded} compact={false} />
            <Text
              fontSize="22px"
              lineHeight="28px"
              fontWeight={600}
              letterSpacing="-0.015em"
            >
              {t.bookedHeadline}
            </Text>
            <Text fontSize="14px" lineHeight="21px" color="text.muted">
              {t.bookedSubline}
            </Text>
            <Box pt="12px">
              <HStack
                justify="space-between"
                gap="12px"
                py="12px"
                borderTopWidth="1px"
                borderColor="border.default"
              >
                <Text fontSize="14px" lineHeight="20px" color="text.muted">
                  {t.yourWorker}
                </Text>
                <HStack gap="8px" minW={0}>
                  <QuoteDisc name={best.name} size={24} />
                  <Text fontSize="14px" lineHeight="20px" fontWeight={500}>
                    {best.name}
                  </Text>
                </HStack>
              </HStack>
              <BookedRow label={t.schedule} value={t.slot} />
              <BookedRow label={t.agreedTotal} value={t.price} strong />
            </Box>
          </Stack>
          {/* The page's pinned action: their worker, and Message. */}
          <PinnedBar>
            <HStack gap="12px">
              <Box flex={1} minW={0}>
                <Text fontSize="12px" lineHeight="16px" color="text.muted">
                  {t.yourWorker}
                </Text>
                <Text fontSize="15px" lineHeight="20px" fontWeight={500}>
                  {best.name}
                </Text>
              </Box>
              <Box
                h="48px"
                px="24px"
                borderRadius="full"
                bg="action.primary"
                color="text.onGreen"
                display="flex"
                alignItems="center"
                fontSize="15px"
                fontWeight={500}
              >
                {t.message}
              </Box>
            </HStack>
          </PinnedBar>
        </>
      ) : (
        <>
          <Stack gap={0} px="16px" pt="16px">
            {list}
          </Stack>
          <PinnedBar>
            <PinnedAction icon={<LuEye size={16} aria-hidden />}>
              {q.preview}
            </PinnedAction>
          </PinnedBar>
        </>
      )}
      <AcceptSheet
        copy={t}
        open={sheetOpen}
        pressing={phase === 'confirming'}
      />
    </Box>
  )
}
