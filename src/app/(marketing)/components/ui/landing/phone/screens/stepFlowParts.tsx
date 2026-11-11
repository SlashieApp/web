'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuArrowLeft, LuArrowRight, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'

import { PHONE_CROP_SCREEN_H } from '../PhoneFrame'
import { CompactBar } from '../phoneParts'

/**
 * The app's step flows (Post a task, Send a quote, Review) for the phone
 * demos: the close bar, the progress track with "Step N of M · Name", one
 * question per step with its line under it, the step's fields, and Continue
 * pinned at the foot. Replicas in SDL tokens; the labels are the flows' own
 * strings (`phoneAppCopy.test.ts`).
 */

/** The compact action bar: 8px over the button, the button (44px) and the rest, down to the crop. */
const COMPACT_ACTION_H = 62

/** "Step 3 of 7 · Details", from the flow's own pattern. */
export function stepCaption(
  pattern: string,
  step: number,
  total: number,
  label: string,
): string {
  return formatMessage(pattern, { step, total, label })
}

/** The progress track under the bar: its fill grows with the step. */
function ProgressTrack({
  value,
  compact,
}: { value: number; compact: boolean }) {
  return (
    <Box
      h={compact ? '3px' : '4px'}
      borderRadius="full"
      bg="bg.subtle"
      overflow="hidden"
      aria-hidden
    >
      <Box
        h="full"
        borderRadius="full"
        bg="action.primary"
        style={{ width: `${Math.round(value * 100)}%` }}
        transition="width 360ms cubic-bezier(0.2, 0, 0, 1)"
      />
    </Box>
  )
}

/** The pinned main button of a step: Continue with its arrow, or the flow's last action. */
export function FlowAction({
  label,
  arrow = true,
  pressing = false,
  compact = false,
}: {
  label: string
  arrow?: boolean
  pressing?: boolean
  compact?: boolean
}) {
  return (
    <HStack
      h={compact ? '44px' : '48px'}
      gap="8px"
      justify="center"
      borderRadius="full"
      bg="action.primary"
      color="text.onGreen"
      fontSize={compact ? '14px' : '15px'}
      fontWeight={500}
      transform={pressing ? 'scale(0.97)' : 'none'}
      filter={pressing ? 'brightness(0.94)' : 'none'}
      transition="transform 140ms ease-out, filter 140ms ease-out"
    >
      {label}
      {arrow ? <LuArrowRight size={16} aria-hidden /> : null}
    </HStack>
  )
}

/**
 * One step of a flow. `stepKey` re-plays the body's entrance when the step
 * changes; `action` is the pinned button (the screen wraps it in its tap
 * target on the step the visitor acts on). `compact` is the cropped phone's
 * layout: the flow and its step in the bar, the question, the fields, and the
 * button above the crop.
 */
export function FlowShell({
  title,
  caption,
  progress,
  heading,
  description,
  stepKey,
  back = false,
  intro,
  action,
  children,
  compact = false,
}: {
  title: string
  caption: string
  /** 0 to 1. */
  progress: number
  heading: string
  description?: string
  stepKey: string
  /** Steps after the first have a back arrow beside the button. */
  back?: boolean
  /** What the flow shows above its steps (the task a quote is for). Full layout only. */
  intro?: ReactNode
  action: ReactNode
  children?: ReactNode
  compact?: boolean
}) {
  const entrance = {
    animation: 'fade-rise 320ms cubic-bezier(0.2, 0, 0, 1) both',
  }
  if (compact) {
    return (
      <Box
        position="absolute"
        inset={0}
        bg="bg.surface"
        data-flow-step={stepKey}
      >
        <CompactBar icon="close" title={title} sub={caption} />
        <ProgressTrack value={progress} compact />
        <Stack key={stepKey} gap="8px" px="12px" pt="10px" css={entrance}>
          <Text
            fontSize="15px"
            lineHeight="20px"
            fontWeight={600}
            letterSpacing="-0.01em"
          >
            {heading}
          </Text>
          {children}
        </Stack>
        <HStack
          position="absolute"
          left={0}
          right={0}
          top={`${PHONE_CROP_SCREEN_H - COMPACT_ACTION_H}px`}
          bottom={0}
          align="flex-start"
          gap="8px"
          px="12px"
          pt="8px"
          bg="bg.surface"
        >
          <Box flex={1} minW={0}>
            {action}
          </Box>
        </HStack>
      </Box>
    )
  }

  return (
    <Stack
      position="absolute"
      inset={0}
      gap={0}
      bg="bg.surface"
      data-flow-step={stepKey}
    >
      <HStack h="52px" flexShrink={0} px="8px" gap="4px">
        <Box
          w="40px"
          h="40px"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          <LuX size={20} />
        </Box>
        <Text fontSize="15px" lineHeight="20px" fontWeight={500}>
          {title}
        </Text>
      </HStack>
      {intro}
      <Box
        px="16px"
        pb="12px"
        borderBottomWidth="1px"
        borderColor="border.default"
        flexShrink={0}
      >
        <ProgressTrack value={progress} compact={false} />
        <Text fontSize="12px" lineHeight="16px" color="text.muted" mt="8px">
          {caption}
        </Text>
      </Box>

      <Stack
        key={stepKey}
        flex={1}
        minH={0}
        gap={0}
        px="16px"
        pt="20px"
        overflow="hidden"
        css={entrance}
      >
        <Text
          fontSize="22px"
          lineHeight="28px"
          fontWeight={600}
          letterSpacing="-0.015em"
        >
          {heading}
        </Text>
        {description ? (
          <Text fontSize="14px" lineHeight="21px" color="text.muted" mt="8px">
            {description}
          </Text>
        ) : null}
        <Stack gap="16px" mt="24px">
          {children}
        </Stack>
      </Stack>

      <HStack gap="8px" px="16px" pt="12px" pb="34px" flexShrink={0}>
        {back ? (
          <Box
            w="40px"
            h="48px"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            color="status.success.fg"
            aria-hidden
          >
            <LuArrowLeft size={20} />
          </Box>
        ) : null}
        <Box flex={1} minW={0}>
          {action}
        </Box>
      </HStack>
    </Stack>
  )
}

/** A labelled field with its value (or an empty box), as the flows' inputs. */
export function FlowField({
  label,
  prefix,
  value,
  helper,
  tall = false,
  compact = false,
}: {
  label: string
  prefix?: string
  value: ReactNode
  helper?: string
  /** A message box rather than one line. */
  tall?: boolean
  compact?: boolean
}) {
  return (
    <Stack gap={compact ? '4px' : '8px'}>
      <Text
        fontSize={compact ? '12px' : '14px'}
        lineHeight={compact ? '16px' : '17px'}
        fontWeight={500}
      >
        {label}
      </Text>
      <HStack
        gap="8px"
        minH={compact ? '40px' : tall ? '96px' : '48px'}
        align={tall ? 'flex-start' : 'center'}
        px="12px"
        py={tall ? '12px' : 0}
        borderRadius="8px"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        fontSize={compact ? '13px' : '16px'}
        lineHeight={compact ? '18px' : '24px'}
      >
        {prefix ? (
          <Text as="span" color="text.muted">
            {prefix}
          </Text>
        ) : null}
        <Text as="span" flex={1} minW={0} fontVariantNumeric="tabular-nums">
          {value}
        </Text>
      </HStack>
      {helper && !compact ? (
        <Text fontSize="12px" lineHeight="18px" color="text.muted">
          {helper}
        </Text>
      ) : null}
    </Stack>
  )
}

/** One choice of a radio group, as the flows draw it: a bordered row, tinted when picked. */
export function FlowRadio({
  label,
  selected = false,
  compact = false,
}: {
  label: string
  selected?: boolean
  compact?: boolean
}) {
  return (
    <HStack
      gap="10px"
      h={compact ? '36px' : '44px'}
      px="12px"
      borderRadius="8px"
      borderWidth="1px"
      borderColor={selected ? 'accent.active' : 'border.default'}
      bg={selected ? 'status.success.soft' : 'bg.surface'}
    >
      <Box
        w="16px"
        h="16px"
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
        lineClamp={1}
      >
        {label}
      </Text>
    </HStack>
  )
}

/** A group's small label over its choices. */
export function FlowGroup({
  label,
  children,
  compact = false,
}: {
  label: string
  children: ReactNode
  compact?: boolean
}) {
  return (
    <Stack gap={compact ? '4px' : '8px'}>
      <Text
        fontSize={compact ? '12px' : '14px'}
        lineHeight={compact ? '16px' : '17px'}
        fontWeight={500}
      >
        {label}
      </Text>
      {children}
    </Stack>
  )
}

/** A label over its value: one line of a review step's summary. */
export function FlowSummary({
  label,
  value,
  compact = false,
}: {
  label: string
  value: ReactNode
  compact?: boolean
}) {
  return (
    <Box
      pb={compact ? '6px' : '12px'}
      borderBottomWidth="1px"
      borderColor="border.default"
    >
      <Text
        fontSize={compact ? '11px' : '12px'}
        lineHeight="16px"
        color="text.muted"
      >
        {label}
      </Text>
      <Text
        fontSize={compact ? '13px' : '15px'}
        lineHeight={compact ? '18px' : '22px'}
        fontWeight={500}
        lineClamp={compact ? 1 : 2}
      >
        {value}
      </Text>
    </Box>
  )
}

/**
 * The task page a flow lands on, at its top: the collapsed bar is the
 * screen's, this is the status pill, the headline and the line under it.
 */
export function ResultHead({
  pill,
  tone = 'success',
  headline,
  subline,
  compact = false,
}: {
  pill: string
  /** Open and Awarded are green; a finished task's pill is neutral. */
  tone?: 'success' | 'neutral'
  headline: string
  subline?: string
  compact?: boolean
}) {
  const live = tone === 'success'
  return (
    <Stack gap={compact ? '6px' : '8px'}>
      <HStack
        alignSelf="flex-start"
        gap="6px"
        px="8px"
        borderRadius="full"
        bg={live ? 'status.success.soft' : 'bg.subtle'}
        color={live ? 'status.success.fg' : 'text.muted'}
        fontSize={compact ? '11px' : '12px'}
        lineHeight="20px"
        fontWeight={500}
      >
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg={live ? 'action.primary' : 'text.subtle'}
        />
        {pill}
      </HStack>
      <Text
        fontSize={compact ? '15px' : '22px'}
        lineHeight={compact ? '20px' : '28px'}
        fontWeight={600}
        letterSpacing="-0.015em"
      >
        {headline}
      </Text>
      {subline ? (
        <Text
          fontSize={compact ? '12px' : '14px'}
          lineHeight={compact ? '17px' : '21px'}
          color="text.muted"
        >
          {subline}
        </Text>
      ) : null}
    </Stack>
  )
}

/** A label and its value on the right: a row of the task page's details. */
export function ResultRow({
  label,
  value,
  strong = false,
  compact = false,
}: {
  label: string
  value: ReactNode
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
