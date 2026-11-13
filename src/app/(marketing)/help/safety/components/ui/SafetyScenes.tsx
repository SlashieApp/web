'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuEllipsisVertical, LuFlag, LuShieldCheck } from 'react-icons/lu'

import { SnippetPanel } from '@/app/(marketing)/components/ui/landing/bento/BentoSnippets'
import {
  snippetEnter,
  useSnippetEntrance,
} from '@/app/(marketing)/components/ui/landing/bento/useSnippetEntrance'
import type { PhoneCopy } from '@/app/(marketing)/components/ui/landing/phone/phoneCopy'
import { sdlElevation, sdlFigure } from '@/theme/styles'
import { Avatar, Button } from '@ui'

import type reportMessages from '@/ui/ReportDialog/i11n.json'

export type ReportCopy = (typeof reportMessages)['en']

/**
 * A dialog as the product draws it, shown as a picture: white, a hairline,
 * 16px corners, `e3`. Its buttons are spans (`Button asChild`), so nothing in
 * a scene can be clicked or focused.
 */
function DialogCard({
  title,
  children,
  style,
}: {
  title: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <Stack
      gap={4}
      p={5}
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      boxShadow={sdlElevation.e3}
      style={style}
    >
      <Text textStyle="heading-sm">{title}</Text>
      {children}
    </Stack>
  )
}

/** A choice row drawn like the product's radio card: the chosen one has an ink ring. */
function ChoiceRow({ label, chosen }: { label: string; chosen: boolean }) {
  return (
    <HStack
      data-safety-choice={chosen ? 'chosen' : ''}
      gap={3}
      px={3}
      minH="40px"
      borderWidth={chosen ? '2px' : '1px'}
      borderColor={chosen ? 'text.default' : 'border.default'}
      borderRadius="md"
      bg="bg.surface"
    >
      <Box
        aria-hidden
        boxSize="16px"
        flexShrink={0}
        borderRadius="full"
        borderWidth={chosen ? '5px' : '1px'}
        borderColor={chosen ? 'text.default' : 'border.strong'}
      />
      <Text textStyle="text-sm">{label}</Text>
    </HStack>
  )
}

/**
 * An inert button in a scene: the product's shape, not a control. It is the
 * outline pill, not the app's green: green on this page would be an action
 * that does nothing (FE-555).
 */
function SceneButton({ label }: { label: string }) {
  return (
    <Button asChild size="md" variant="secondary" w="full" pointerEvents="none">
      <span>{label}</span>
    </Button>
  )
}

/**
 * Meeting safely (FE-555): the dialog a customer sees before accepting a
 * quote, with the safety note that sends them to this page. The worker, the
 * price, the two times on offer, the note, then Accept quote. Home's demo
 * copy (`landing.phone`), so the scene says exactly what the app says.
 */
export function AcceptDialogScene({
  phone,
  labelledBy,
}: {
  phone: PhoneCopy
  labelledBy: string
}) {
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()
  const hire = phone.hire
  const worker = phone.quotes.items[0]
  if (!worker) return null
  return (
    <SnippetPanel
      snippet="accept-dialog"
      labelledBy={labelledBy}
      panelRef={ref}
    >
      <DialogCard title={hire.acceptTitle} style={snippetEnter(phase, 0)}>
        <HStack gap={3}>
          <Avatar name={worker.name} size="md" />
          <Text textStyle="text-sm" fontWeight={500} flex={1} minW={0}>
            {worker.name}
          </Text>
          <Text as="span" fontSize="17px" lineHeight="22px" {...sdlFigure}>
            {hire.price}
          </Text>
        </HStack>
        <Stack gap={2}>
          <Text textStyle="label-md" color="text.muted">
            {hire.pickSlot}
          </Text>
          <ChoiceRow label={hire.slot} chosen />
          <ChoiceRow label={hire.otherSlot} chosen={false} />
        </Stack>
        <HStack
          data-safety-hint=""
          gap={3}
          p={3}
          align="flex-start"
          bg="bg.subtle"
          borderRadius="md"
          style={snippetEnter(phase, 1)}
        >
          <Box
            as="span"
            display="inline-flex"
            color="accent.active"
            mt="2px"
            flexShrink={0}
          >
            <LuShieldCheck size={18} aria-hidden />
          </Box>
          <Text textStyle="text-sm" color="text.default">
            {hire.acceptHint}
          </Text>
        </HStack>
        <SceneButton label={hire.acceptCta} />
      </DialogCard>
    </SnippetPanel>
  )
}

/** The reasons the scene lists, in the dialog's order; the chosen one is Scam. */
const REASONS = ['SPAM', 'HARASSMENT', 'SCAM', 'OTHER'] as const
const CHOSEN_REASON = 'SCAM'

/**
 * How to report (FE-555): the task page's ⋮ menu with Report task, then the
 * report dialog: a reason chosen, the details box, Send report. Every word
 * is the report dialog's own copy (`ui/ReportDialog`) and the demo task's
 * title.
 */
export function ReportScene({
  report,
  taskTitle,
  labelledBy,
}: {
  report: ReportCopy
  taskTitle: string
  labelledBy: string
}) {
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()
  return (
    <SnippetPanel snippet="report" labelledBy={labelledBy} panelRef={ref}>
      <Stack gap={3}>
        {/* The task page's header row and its open ⋮ menu. */}
        <Stack gap={1.5} style={snippetEnter(phase, 0)}>
          <HStack
            gap={3}
            px={4}
            minH="48px"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="lg"
          >
            <Text textStyle="text-sm" fontWeight={500} flex={1} lineClamp={1}>
              {taskTitle}
            </Text>
            <Box
              aria-hidden
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              boxSize="32px"
              borderRadius="full"
              bg="bg.subtle"
            >
              <LuEllipsisVertical size={16} />
            </Box>
          </HStack>
          <HStack
            data-safety-menu-item=""
            alignSelf="flex-end"
            gap={2}
            px={3}
            minH="40px"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="md"
            boxShadow={sdlElevation.e2}
          >
            <LuFlag size={14} aria-hidden />
            <Text textStyle="text-sm">{report.reportTask}</Text>
          </HStack>
        </Stack>

        <DialogCard title={report.titleTask} style={snippetEnter(phase, 1)}>
          <Stack gap={2}>
            <Text textStyle="label-md" color="text.muted">
              {report.reasonLabel}
            </Text>
            {REASONS.map((reason) => (
              <ChoiceRow
                key={reason}
                label={report.reasons[reason]}
                chosen={reason === CHOSEN_REASON}
              />
            ))}
          </Stack>
          <Stack gap={2}>
            <Text textStyle="label-md" color="text.muted">
              {report.detailsLabel}
            </Text>
            <Box
              px={3}
              py={2.5}
              minH="64px"
              borderWidth="1px"
              borderColor="border.strong"
              borderRadius="md"
            >
              <Text textStyle="text-sm" color="text.subtle">
                {report.detailsPlaceholder}
              </Text>
            </Box>
          </Stack>
          <SceneButton label={report.submit} />
        </DialogCard>
      </Stack>
    </SnippetPanel>
  )
}
