'use client'

import { Box, HStack, Heading, Input, Stack, Text } from '@chakra-ui/react'
import type { Price, QuoteStatus } from '@codegen/schema'
import NextLink from 'next/link'
import { useState } from 'react'

import { IconDocument } from '@/icons/taskMeta'
import { Badge, Button } from '@ui'

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
  isAuthenticated: boolean
  loginHref: string
  onScrollToQuoteForm: () => void
}

export function TaskDetailWorkerCtas({
  isAuthenticated,
  loginHref,
  onScrollToQuoteForm,
}: TaskDetailWorkerCtasProps) {
  const [saveNote, setSaveNote] = useState<string | null>(null)

  return (
    <Box p={{ base: 5, md: 5 }} borderColor="jobCardBorder" boxShadow="ambient">
      <Stack gap={3}>
        {isAuthenticated ? (
          <Button type="button" w="full" onClick={onScrollToQuoteForm}>
            <HStack gap={2} justify="center">
              <IconDocument />
              <span>Make a quote</span>
            </HStack>
          </Button>
        ) : (
          <>
            <Text fontSize="sm" color="formLabelMuted">
              Log in with your worker account to send a quote and message the
              client.
            </Text>
            <NextLink href={loginHref} passHref legacyBehavior>
              <Button as="a" w="full">
                Log in to make a quote
              </Button>
            </NextLink>
            <Button
              type="button"
              variant="secondary"
              w="full"
              borderColor="primary.200"
              color="primary.700"
              bg="primary.50"
              onClick={onScrollToQuoteForm}
            >
              Preview quote form
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="secondary"
          w="full"
          borderColor="jobCardBorder"
          color="jobCardTitle"
          bg="white"
          _hover={{ bg: 'jobCardBg' }}
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
          <Text fontSize="xs" color="formLabelMuted">
            {saveNote}
          </Text>
        ) : null}
      </Stack>
    </Box>
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
        <Box p={6} borderColor="jobCardBorder" boxShadow="ambient">
          <Stack gap={4}>
            <Heading size="md">Log in to make a quote</Heading>
            <Text color="formLabelMuted">
              Sign in to send your quote and message to the task owner.
            </Text>
            <NextLink href={loginHref} passHref legacyBehavior>
              <Button as="a" w="full">
                Log in
              </Button>
            </NextLink>
          </Stack>
        </Box>
      ) : myQuote ? (
        <Box p={6} borderColor="jobCardBorder" boxShadow="ambient">
          <Stack gap={3}>
            <Heading size="md">Your quote</Heading>
            <Text color="formLabelMuted">
              You submitted{' '}
              {formatPoundsFromPence(priceToPence(myQuote.price) ?? 0)}
              {myQuote.message ? ` — “${myQuote.message}”` : '.'}
            </Text>
            <Badge bg="jobCardBg" color="jobCardTitle" w="fit-content">
              Status: {normaliseStatus(myQuote.status)}
            </Badge>
          </Stack>
        </Box>
      ) : !canAccessWorkerTools ? (
        <Box
          p={6}
          bg="primary.50"
          borderColor="primary.100"
          boxShadow="ambient"
        >
          <Stack gap={4}>
            <Heading size="md">Become a worker to send a quote</Heading>
            <Text color="formLabelMuted">
              Create your worker profile to unlock quoting and worker tools.
            </Text>
            <NextLink href="/dashboard/worker/register" passHref legacyBehavior>
              <Button as="a" w="full">
                Create worker profile
              </Button>
            </NextLink>
          </Stack>
        </Box>
      ) : (
        <Box p={6} borderColor="jobCardBorder" boxShadow="ambient">
          <Stack gap={4}>
            <Heading size="md">Submit a quote</Heading>
            <Text color="formLabelMuted">
              Share your price and a short message for the client.
            </Text>
            <Stack gap={3}>
              <Input
                placeholder="Quote price (pence)"
                value={pricePence}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onPriceChange(e.target.value)
                }
              />
              <Input
                placeholder="Short message to the client"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onMessageChange(e.target.value)
                }
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
        </Box>
      )}
    </Box>
  )
}
