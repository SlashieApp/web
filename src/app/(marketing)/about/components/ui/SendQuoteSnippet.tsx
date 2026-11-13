'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCalendar, LuCheck } from 'react-icons/lu'

import { SnippetPanel } from '@/app/(marketing)/components/ui/landing/bento/BentoSnippets'
import {
  snippetConfirm,
  snippetEnter,
  useSnippetEntrance,
} from '@/app/(marketing)/components/ui/landing/bento/useSnippetEntrance'
import type { PhoneCopy } from '@/app/(marketing)/components/ui/landing/phone/phoneCopy'
import { sdlFigure } from '@/theme/styles'
import { Card } from '@ui'

/**
 * A worker sends a quote (FE-554), the worker's side of Home's bento: the
 * task they found nearby, their quote (the price, the time they offer, a
 * line to the customer) and the quote sent. It plays once when scrolled into
 * view, like Home's snippets. Every word is Home's demo copy
 * (`landing.phone`): the wardrobe task and the worker's quote flow.
 */
export function SendQuoteSnippet({
  phone,
  labelledBy,
}: {
  phone: PhoneCopy
  labelledBy: string
}) {
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()
  const task = phone.tasks.wardrobe
  const flow = phone.worker.flow
  return (
    <SnippetPanel snippet="send-quote" labelledBy={labelledBy} panelRef={ref}>
      <Stack gap={3}>
        {/* The task, as the worker found it on the map. */}
        <Card p={3} maxW="full" style={snippetEnter(phase, 0)}>
          <HStack gap={3} align="center">
            <Stack gap={0.5} flex={1} minW={0}>
              <Text textStyle="text-sm" fontWeight={500} lineClamp={1}>
                {task.title}
              </Text>
              <Text textStyle="text-xs" color="text.muted">
                {task.area} · {task.distance}
              </Text>
            </Stack>
            <Stack gap={0} align="flex-end" flexShrink={0}>
              <Text textStyle="text-xs" color="text.muted">
                {phone.post.flow.detailBudget}
              </Text>
              <Text as="span" fontSize="15px" lineHeight="20px" {...sdlFigure}>
                {flow.budget}
              </Text>
            </Stack>
          </HStack>
        </Card>

        {/* Their quote. */}
        <Card
          p={4}
          maxW="full"
          data-about-quote=""
          style={snippetEnter(phase, 1)}
        >
          <Stack gap={3}>
            <HStack justify="space-between" align="baseline">
              <Text textStyle="label-md">{flow.yourQuote}</Text>
              <Text as="span" fontSize="20px" lineHeight="26px" {...sdlFigure}>
                {flow.price}
              </Text>
            </HStack>
            <HStack gap={2} color="text.default">
              <Box as="span" display="inline-flex" color="text.muted">
                <LuCalendar size={14} aria-hidden />
              </Box>
              <Text textStyle="text-sm">{flow.slot}</Text>
            </HStack>
            <Text
              textStyle="text-sm"
              color="text.muted"
              ps={3}
              borderStartWidth="2px"
              borderColor="border.default"
            >
              {flow.message}
            </Text>
          </Stack>
        </Card>

        {/* Sent: a state, so the soft success tint, never a green fill. */}
        <HStack
          data-about-quote-sent=""
          gap={3}
          p={3}
          bg="status.success.soft"
          borderWidth="1px"
          borderColor="status.success.border"
          borderRadius="lg"
          style={snippetEnter(phase, 2)}
        >
          <Box
            aria-hidden
            boxSize="28px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            bg="bg.surface"
            color="status.success.fg"
            borderWidth="1px"
            borderColor="status.success.border"
            style={snippetConfirm(phase, 2)}
          >
            <LuCheck size={16} strokeWidth={2.5} />
          </Box>
          <Stack gap={0} minW={0}>
            <Text textStyle="label-md">{flow.sentHeadline}</Text>
            <Text textStyle="text-xs" color="text.muted">
              {flow.sentSubline}
            </Text>
          </Stack>
        </HStack>
      </Stack>
    </SnippetPanel>
  )
}
