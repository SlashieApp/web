'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import type { Price, QuoteStatus } from '@codegen/schema'
import NextLink from 'next/link'
import { useState } from 'react'

import {
  Badge,
  Button,
  GlassCard,
  Heading,
  IconDocument,
  Text,
  TextInput,
} from '@ui'

import { priceToPence } from '@/utils/price'
import { formatPoundsFromPence } from './taskDetailUtils'

function IconBookmark(props: { size?: number }) {
  const s = props.size ?? 18
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Bookmark</title>
      <path
        d="M6 4h12v16l-6-4-6 4V4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function normaliseStatus(status: string) {
  return status.replaceAll('_', ' ').toUpperCase()
}

export type TaskDetailWorkerCtasProps = {
  onScrollToQuoteForm: () => void
}

export function TaskDetailWorkerCtas({
  onScrollToQuoteForm,
}: TaskDetailWorkerCtasProps) {
  const [saveNote, setSaveNote] = useState<string | null>(null)

  return (
    <GlassCard p={{ base: 5, md: 5 }} borderColor="border" boxShadow="ambient">
      <Stack gap={3}>
        <Button type="button" w="full" onClick={onScrollToQuoteForm}>
          <HStack gap={2} justify="center">
            <IconDocument />
            <span>Make a quote</span>
          </HStack>
        </Button>
        <Button
          type="button"
          variant="outline"
          w="full"
          borderColor="border"
          color="fg"
          bg="white"
          _hover={{ bg: 'surfaceContainerLow' }}
          onClick={() => {
            setSaveNote('Task watchlists are not available on web yet.')
          }}
        >
          <HStack gap={2} justify="center">
            <IconBookmark />
            <span>Save for later</span>
          </HStack>
        </Button>
        {saveNote ? (
          <Text fontSize="xs" color="muted">
            {saveNote}
          </Text>
        ) : null}
      </Stack>
    </GlassCard>
  )
}

export type TaskDetailWorkerQuotePanelProps = {
  myQuote: {
    price?: Price | null
    message?: string | null
    status: QuoteStatus
  } | null
  canAccessWorkerTools: boolean
  mePresent: boolean
  loginHref: string
  pricePence: string
  message: string
  onPriceChange: (v: string) => void
  onMessageChange: (v: string) => void
  onSubmitQuote: () => void
  quoting: boolean
  quoteError: string | null
  quoteSuccess: string | null
}

export function TaskDetailWorkerQuotePanel({
  myQuote,
  canAccessWorkerTools,
  mePresent,
  loginHref,
  pricePence,
  message,
  onPriceChange,
  onMessageChange,
  onSubmitQuote,
  quoting,
  quoteError,
  quoteSuccess,
}: TaskDetailWorkerQuotePanelProps) {
  return (
    <Box id="task-quote" scrollMarginTop="96px">
      {!mePresent ? (
        <GlassCard p={6} borderColor="border" boxShadow="ambient">
          <Stack gap={4}>
            <Heading size="md">Log in to make a quote</Heading>
            <Text color="muted">
              Sign in to send your quote and message to the task owner.
            </Text>
            <Button as={NextLink} href={loginHref} w="full">
              Log in
            </Button>
          </Stack>
        </GlassCard>
      ) : myQuote ? (
        <GlassCard p={6} borderColor="border" boxShadow="ambient">
          <Stack gap={3}>
            <Heading size="md">Your quote</Heading>
            <Text color="muted">
              You submitted{' '}
              {formatPoundsFromPence(priceToPence(myQuote.price) ?? 0)}
              {myQuote.message ? ` — “${myQuote.message}”` : '.'}
            </Text>
            <Badge bg="surfaceContainerLow" color="fg" w="fit-content">
              Status: {normaliseStatus(myQuote.status)}
            </Badge>
          </Stack>
        </GlassCard>
      ) : !canAccessWorkerTools ? (
        <GlassCard
          p={6}
          bg="primary.50"
          borderColor="primary.100"
          boxShadow="ambient"
        >
          <Stack gap={4}>
            <Heading size="md">Become a worker to send a quote</Heading>
            <Text color="muted">
              Create your worker profile to unlock quoting and worker tools.
            </Text>
            <Button as={NextLink} href="/dashboard/worker/register" w="full">
              Create worker profile
            </Button>
          </Stack>
        </GlassCard>
      ) : (
        <GlassCard p={6} borderColor="border" boxShadow="ambient">
          <Stack gap={4}>
            <Heading size="md">Submit a quote</Heading>
            <Text color="muted">
              Share your price and a short message for the client.
            </Text>
            <Stack gap={3}>
              <TextInput
                placeholder="Quote price (pence)"
                value={pricePence}
                onChange={(e) => onPriceChange(e.target.value)}
              />
              <TextInput
                placeholder="Short message to the client"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
              />
              <Button
                background="linkBlue.600"
                color="white"
                loading={quoting}
                onClick={() => void onSubmitQuote()}
              >
                Submit quote
              </Button>
              {quoteError ? (
                <Text color="red.400" fontSize="sm">
                  {quoteError}
                </Text>
              ) : null}
              {quoteSuccess ? (
                <Text color="green.600" fontSize="sm">
                  {quoteSuccess}
                </Text>
              ) : null}
            </Stack>
          </Stack>
        </GlassCard>
      )}
    </Box>
  )
}
