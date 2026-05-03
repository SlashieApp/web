'use client'

import {
  Box,
  HStack,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'

import { IconDocument } from '@/icons/taskMeta'
import { Badge, Button, Card } from '@ui'

import { priceToPence } from '@/utils/price'

import { useTaskDetail } from '../context/TaskDetailProvider'
import {
  formatPoundsFromPence,
  normaliseTaskStatusForBadge,
} from './taskDetailUtils'

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

export function TaskDetailWorkerCtas() {
  const { isOwner, task, isAuthenticated, scrollToQuoteForm } = useTaskDetail()
  const [saveNote, setSaveNote] = useState<string | null>(null)

  if (isOwner || !task) return null

  const loginHref = `/login?next=${encodeURIComponent(`/task/${task.id}#task-quote`)}`

  return (
    <Card p={{ base: 5, md: 5 }} maxW="full" w="full">
      <Stack gap={3}>
        {isAuthenticated ? (
          <Button type="button" w="full" onClick={scrollToQuoteForm}>
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
            <Link
              as={NextLink}
              href={loginHref}
              _hover={{ textDecoration: 'none' }}
            >
              <Button w="full">Log in to make a quote</Button>
            </Link>
            <Button
              type="button"
              variant="secondary"
              w="full"
              borderColor="primary.200"
              color="primary.700"
              bg="primary.50"
              onClick={scrollToQuoteForm}
            >
              Preview quote form
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="secondary"
          w="full"
          borderColor="cardBorder"
          color="cardFg"
          bg="white"
          _hover={{ bg: 'cardBg' }}
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
    </Card>
  )
}

export function TaskDetailWorkerQuotePanel() {
  const {
    isOwner,
    task,
    isAuthenticated,
    myQuote,
    canAccessWorkerTools,
    quoteAmountInput,
    quoteMessageInput,
    setQuoteAmountInput,
    setQuoteMessageInput,
    onSubmitQuote,
    quoting,
    quoteError,
    quoteSuccess,
  } = useTaskDetail()

  if (isOwner || !task) return null

  const loginHref = `/login?next=${encodeURIComponent(`/task/${task.id}#task-quote`)}`

  return (
    <Box id="task-quote" scrollMarginTop="96px">
      {!isAuthenticated ? (
        <Card p={6} maxW="full" w="full">
          <Stack gap={4}>
            <Heading size="md">Log in to make a quote</Heading>
            <Text color="formLabelMuted">
              Sign in to send your quote and message to the task owner.
            </Text>
            <Link
              as={NextLink}
              href={loginHref}
              _hover={{ textDecoration: 'none' }}
            >
              <Button w="full">Log in</Button>
            </Link>
          </Stack>
        </Card>
      ) : myQuote ? (
        <Card p={6} maxW="full" w="full">
          <Stack gap={3}>
            <Heading size="md">Your quote</Heading>
            <Text color="formLabelMuted">
              You submitted{' '}
              {formatPoundsFromPence(priceToPence(myQuote.price) ?? 0)}
              {myQuote.message ? ` — “${myQuote.message}”` : '.'}
            </Text>
            <Badge bg="cardBg" color="cardFg" w="fit-content">
              Status: {normaliseTaskStatusForBadge(myQuote.status)}
            </Badge>
          </Stack>
        </Card>
      ) : !canAccessWorkerTools ? (
        <Card
          p={6}
          maxW="full"
          w="full"
          bg="primary.50"
          borderColor="primary.100"
        >
          <Stack gap={4}>
            <Heading size="md">Become a worker to send a quote</Heading>
            <Text color="formLabelMuted">
              Create your worker profile to unlock quoting and worker tools.
            </Text>
            <Link
              as={NextLink}
              href="/dashboard/worker/register"
              _hover={{ textDecoration: 'none' }}
            >
              <Button w="full">Create worker profile</Button>
            </Link>
          </Stack>
        </Card>
      ) : (
        <Card p={6} maxW="full" w="full">
          <Stack gap={4}>
            <Heading size="md">Submit a quote</Heading>
            <Text color="formLabelMuted">
              Share your price and a short message for the client.
            </Text>
            <Stack gap={3}>
              <Input
                placeholder="Quote price (pence)"
                value={quoteAmountInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuoteAmountInput(e.target.value)
                }
              />
              <Input
                placeholder="Short message to the client"
                value={quoteMessageInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuoteMessageInput(e.target.value)
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
        </Card>
      )}
    </Box>
  )
}
