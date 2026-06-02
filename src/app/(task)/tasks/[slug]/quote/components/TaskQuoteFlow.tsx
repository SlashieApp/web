'use client'

import {
  Box,
  HStack,
  Heading,
  Link,
  NativeSelect,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import {
  LuArrowLeft,
  LuCalendar,
  LuCircleCheck,
  LuPlus,
  LuX,
} from 'react-icons/lu'

import { formatBudgetAmount } from '@/utils/price'
import { Button, FormField, IconButton, Input } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskQuotePrivateCallout } from './TaskQuotePrivateCallout'
import { TaskQuoteSummaryCard } from './TaskQuoteSummaryCard'

const MESSAGE_MAX = 250

const AVAILABILITY_PRESETS = [
  'Tomorrow, 9:00 AM – 12:00 PM',
  'Tomorrow, 1:00 PM – 5:00 PM',
  'This week (flexible)',
  'Next week (flexible)',
  "Let's discuss",
] as const

type Step = 'compose' | 'review' | 'sent'

function FormErrorText({ children }: { children: string }) {
  return (
    <Text fontSize="sm" color="red.400" role="alert">
      {children}
    </Text>
  )
}

function BackToTaskLink({ href }: { href: string }) {
  return (
    <Link
      as={NextLink}
      href={href}
      fontSize="sm"
      fontWeight={600}
      color="secondary.600"
      display="inline-flex"
      alignItems="center"
      gap={1}
      w="fit-content"
      _hover={{ textDecoration: 'none', color: 'secondary.700' }}
    >
      <LuArrowLeft size={16} aria-hidden />
      Back to task
    </Link>
  )
}

export function TaskQuoteFlow() {
  const router = useRouter()
  const {
    task,
    isOwner,
    myQuote,
    isAuthenticated,
    meLoading,
    canAccessWorkerTools,
    quoteAmountInput,
    quoteMessageInput,
    quoteAvailabilityInput,
    setQuoteAmountInput,
    setQuoteMessageInput,
    setQuoteAvailabilityInput,
    onSubmitQuote,
    quoting,
    quoteError,
  } = useTaskDetail()

  const [step, setStep] = useState<Step>('compose')
  const [poundsInput, setPoundsInput] = useState('')
  const [composeError, setComposeError] = useState<string | null>(null)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const redirectedRef = useRef(false)

  const revokeUrl = useCallback((url: string) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }, [])

  const shellRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !task || redirectedRef.current) return
      if (isAuthenticated && meLoading) return
      if (isOwner) {
        redirectedRef.current = true
        router.replace(`/tasks/${task.id}`)
      }
    },
    [isAuthenticated, isOwner, meLoading, router, task],
  )

  const removePhotoAt = useCallback(
    (index: number) => {
      setPhotoUrls((prev) => {
        const next = [...prev]
        const [removed] = next.splice(index, 1)
        if (removed) revokeUrl(removed)
        return next
      })
    },
    [revokeUrl],
  )

  const onPhotoFiles = useCallback((list: FileList | null) => {
    if (!list?.length) return
    setPhotoUrls((prev) => {
      const next = [...prev]
      for (const file of Array.from(list)) {
        if (next.length >= 6) break
        if (!file.type.startsWith('image/')) continue
        next.push(URL.createObjectURL(file))
      }
      return next
    })
  }, [])

  const goReview = useCallback(() => {
    setComposeError(null)
    const raw = poundsInput.trim().replace(/[£,\s]/g, '')
    const pounds = Number.parseFloat(raw)
    if (!Number.isFinite(pounds) || pounds <= 0) {
      setComposeError('Enter a valid total price.')
      return
    }
    const msg = quoteMessageInput.trim()
    if (msg.length > MESSAGE_MAX) {
      setComposeError(`Message must be ${MESSAGE_MAX} characters or fewer.`)
      return
    }
    setQuoteAmountInput(String(Math.round(pounds * 100)))
    setStep('review')
  }, [poundsInput, quoteMessageInput, setQuoteAmountInput])

  const sendQuote = useCallback(async () => {
    const ok = await onSubmitQuote()
    if (ok) setStep('sent')
  }, [onSubmitQuote])

  if (!task) return null

  const loginHref = `/login?next=${encodeURIComponent(`/tasks/${task.id}/quote`)}`
  const backToTask = `/tasks/${task.id}`
  const priceHelperText = task.budget
    ? `Customer budget: ${formatBudgetAmount(task.budget)}. Enter the total price you'd like to charge.`
    : "Enter the total price you'd like to charge."

  if (isAuthenticated && meLoading) {
    return (
      <Box ref={shellRef}>
        <Stack py={10} align="center">
          <Text color="formLabelMuted">Loading…</Text>
        </Stack>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return (
      <Box ref={shellRef}>
        <Stack gap={6} py={{ base: 6, md: 8 }}>
          <Stack gap={1}>
            <Heading size="lg" color="secondary.900">
              Send quote
            </Heading>
            <Text color="formLabelMuted">
              Sign in to send a quote for this task.
            </Text>
          </Stack>
          <TaskQuoteSummaryCard />
          <Link
            as={NextLink}
            href={loginHref}
            _hover={{ textDecoration: 'none' }}
          >
            <Button w="full">Log in</Button>
          </Link>
          <BackToTaskLink href={backToTask} />
        </Stack>
      </Box>
    )
  }

  if (isOwner) {
    return (
      <Box ref={shellRef}>
        <Stack py={10} align="center">
          <Text color="formLabelMuted">Redirecting…</Text>
        </Stack>
      </Box>
    )
  }

  if (myQuote && step !== 'sent') {
    return (
      <Box ref={shellRef}>
        <Stack gap={6} py={{ base: 6, md: 8 }}>
          <BackToTaskLink href={backToTask} />
          <Stack gap={1}>
            <Heading size="lg" color="secondary.900">
              Quote already sent
            </Heading>
            <Text color="formLabelMuted">
              You&apos;ve already quoted on this task. Track it from My Quotes.
            </Text>
          </Stack>
          <TaskQuoteSummaryCard />
          <Stack gap={3}>
            <Link
              as={NextLink}
              href="/quotes"
              _hover={{ textDecoration: 'none' }}
            >
              <Button w="full">View my quotes</Button>
            </Link>
            <Link
              as={NextLink}
              href={backToTask}
              _hover={{ textDecoration: 'none' }}
            >
              <Button w="full" variant="secondary">
                Back to task
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Box>
    )
  }

  if (!canAccessWorkerTools) {
    return (
      <Box ref={shellRef}>
        <Stack gap={6} py={{ base: 6, md: 8 }}>
          <Stack gap={1}>
            <Heading size="lg" color="secondary.900">
              Send quote
            </Heading>
            <Text color="formLabelMuted">
              Create your worker profile before you can send quotes.
            </Text>
          </Stack>
          <TaskQuoteSummaryCard />
          <Link
            as={NextLink}
            href="/profile#profile-worker"
            _hover={{ textDecoration: 'none' }}
          >
            <Button w="full">Create worker profile</Button>
          </Link>
          <BackToTaskLink href={backToTask} />
        </Stack>
      </Box>
    )
  }

  const pence = Number(quoteAmountInput) || 0
  const reviewPriceLabel =
    pence > 0
      ? new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(pence / 100)
      : '—'

  return (
    <Box ref={shellRef}>
      <Stack gap={6} py={{ base: 6, md: 8 }}>
        <BackToTaskLink href={backToTask} />

        {step === 'compose' ? (
          <>
            <Stack gap={1}>
              <Heading size="lg" color="secondary.900">
                Send quote
              </Heading>
              <Text color="formLabelMuted">
                Enter your price, message, and when you can do the work.
              </Text>
            </Stack>
            <TaskQuoteSummaryCard />

            <Stack gap={5}>
              <FormField label="Your quote" helperText={priceHelperText}>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={poundsInput}
                  onChange={(e) => setPoundsInput(e.target.value)}
                  startElement={
                    <Text fontWeight={700} fontSize="sm" color="formControlFg">
                      £
                    </Text>
                  }
                />
              </FormField>

              <FormField
                label="Message to customer"
                helperText="Introduce yourself and explain how you'll complete the job."
              >
                <Box position="relative">
                  <Textarea
                    rows={5}
                    value={quoteMessageInput}
                    maxLength={MESSAGE_MAX}
                    onChange={(e) => setQuoteMessageInput(e.target.value)}
                    placeholder="Hi! I can help with…"
                    bg="formControlBg"
                    borderWidth="1px"
                    borderColor="cardBorder"
                    borderRadius="lg"
                    color="formControlFg"
                    pb={8}
                    resize="vertical"
                    transitionProperty="border-color"
                    transitionDuration="160ms"
                    _placeholder={{ color: 'formControlPlaceholder' }}
                    _focusVisible={{
                      borderColor: 'formControlFocusBorder',
                      outline: 'none',
                      boxShadow: 'none',
                    }}
                  />
                  <Text
                    position="absolute"
                    right={3}
                    bottom={2}
                    fontSize="xs"
                    color="formLabelMuted"
                    pointerEvents="none"
                  >
                    {quoteMessageInput.length}/{MESSAGE_MAX}
                  </Text>
                </Box>
              </FormField>

              <FormField
                label="Availability"
                helperText="When can you get this done?"
                icon={<LuCalendar size={20} />}
              >
                <NativeSelect.Root w="full">
                  <NativeSelect.Field
                    bg="formControlBg"
                    borderWidth="1px"
                    borderColor="cardBorder"
                    borderRadius="lg"
                    minH={{ base: 10, md: 11 }}
                    value={quoteAvailabilityInput}
                    onChange={(e) => setQuoteAvailabilityInput(e.target.value)}
                    _focusVisible={{
                      borderColor: 'formControlFocusBorder',
                    }}
                  >
                    <option value="">Select a time window</option>
                    {AVAILABILITY_PRESETS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </FormField>

              <FormField
                label="Add photos (optional)"
                helperText="Add photos of your previous work if you like. They are not sent with the quote yet — uploads are coming soon."
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    onPhotoFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
                <HStack gap={2} flexWrap="wrap">
                  {photoUrls.map((url, i) => (
                    <Box key={url} position="relative" w="72px" h="72px">
                      <Box w="full" h="full" rounded="lg" overflow="hidden">
                        <img
                          src={url}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                      <IconButton
                        aria-label="Remove photo"
                        size="xs"
                        position="absolute"
                        top={1}
                        right={1}
                        variant="solid"
                        bg="blackAlpha.700"
                        color="white"
                        onClick={() => removePhotoAt(i)}
                      >
                        <LuX size={14} />
                      </IconButton>
                    </Box>
                  ))}
                  {photoUrls.length < 6 ? (
                    <IconButton
                      aria-label="Add photo"
                      variant="outline"
                      w="72px"
                      h="72px"
                      minW="72px"
                      minH="72px"
                      rounded="lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <LuPlus size={22} />
                    </IconButton>
                  ) : null}
                </HStack>
              </FormField>
            </Stack>

            <TaskQuotePrivateCallout />

            {composeError ? (
              <FormErrorText>{composeError}</FormErrorText>
            ) : null}
            {quoteError ? <FormErrorText>{quoteError}</FormErrorText> : null}

            <Button w="full" onClick={goReview}>
              Review quote
            </Button>
          </>
        ) : null}

        {step === 'review' ? (
          <>
            <Stack gap={1}>
              <Heading size="lg" color="secondary.900">
                Review quote
              </Heading>
              <Text color="formLabelMuted">
                Check your quote details before sending it.
              </Text>
            </Stack>
            <TaskQuoteSummaryCard />

            <Stack gap={3}>
              <Text fontWeight={700} fontSize="sm" color="secondary.900">
                Your quote
              </Text>
              <Text fontSize="md" color="secondary.900">
                {reviewPriceLabel}
              </Text>
              {quoteAvailabilityInput.trim() ? (
                <Text fontSize="sm" color="formLabelMuted">
                  Availability: {quoteAvailabilityInput.trim()}
                </Text>
              ) : null}
            </Stack>

            <Stack gap={2}>
              <Text fontWeight={700} fontSize="sm" color="secondary.900">
                Message to customer
              </Text>
              <Text fontSize="sm" color="secondary.900" whiteSpace="pre-wrap">
                {quoteMessageInput.trim() || '—'}
              </Text>
            </Stack>

            {photoUrls.length > 0 ? (
              <Stack gap={2}>
                <Text fontWeight={700} fontSize="sm" color="secondary.900">
                  Photos
                </Text>
                <HStack gap={2} flexWrap="wrap">
                  {photoUrls.map((url) => (
                    <Box
                      key={url}
                      w="72px"
                      h="72px"
                      rounded="lg"
                      overflow="hidden"
                    >
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                </HStack>
              </Stack>
            ) : null}

            <TaskQuotePrivateCallout />

            {quoteError ? <FormErrorText>{quoteError}</FormErrorText> : null}

            <Stack gap={3}>
              <Button
                w="full"
                loading={quoting}
                onClick={() => void sendQuote()}
              >
                Send quote
              </Button>
              <Button
                w="full"
                variant="secondary"
                onClick={() => {
                  setComposeError(null)
                  const p = Number(quoteAmountInput) || 0
                  setPoundsInput(p > 0 ? (p / 100).toString() : poundsInput)
                  setStep('compose')
                }}
              >
                Edit quote
              </Button>
            </Stack>

            <Text fontSize="xs" color="formLabelMuted" textAlign="center">
              By sending, you agree to Slashie&apos;s{' '}
              <Link as={NextLink} href="/terms" color="secondary.600">
                Terms of Service
              </Link>
              .
            </Text>
          </>
        ) : null}

        {step === 'sent' ? (
          <>
            <Stack align="center" gap={4} pt={4}>
              <Box
                w={16}
                h={16}
                rounded="full"
                bg="primary"
                color="black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="primary"
              >
                <LuCircleCheck size={32} aria-hidden />
              </Box>
              <Stack gap={1} textAlign="center">
                <Heading size="lg" color="secondary.900">
                  Quote sent!
                </Heading>
                <Text color="formLabelMuted">
                  Your quote has been sent to the customer.
                </Text>
              </Stack>
            </Stack>

            <TaskQuoteSummaryCard />

            <Stack gap={3}>
              <HStack justify="space-between">
                <Text fontWeight={700} fontSize="sm" color="secondary.900">
                  Your quote
                </Text>
                <Text fontSize="sm" color="secondary.900">
                  {reviewPriceLabel}
                </Text>
              </HStack>
              {quoteAvailabilityInput.trim() ? (
                <HStack justify="space-between" align="start">
                  <Text fontWeight={700} fontSize="sm" color="secondary.900">
                    Availability
                  </Text>
                  <Text fontSize="sm" textAlign="right" color="secondary.900">
                    {quoteAvailabilityInput.trim()}
                  </Text>
                </HStack>
              ) : null}
              <Stack gap={1}>
                <Text fontWeight={700} fontSize="sm" color="secondary.900">
                  Message
                </Text>
                <Text fontSize="sm" whiteSpace="pre-wrap" color="secondary.900">
                  {quoteMessageInput.trim()}
                </Text>
              </Stack>
            </Stack>

            <Stack gap={3}>
              <Link
                as={NextLink}
                href="/quotes"
                _hover={{ textDecoration: 'none' }}
              >
                <Button w="full">View my quotes</Button>
              </Link>
              <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
                <Button w="full" variant="secondary">
                  Browse more tasks
                </Button>
              </Link>
            </Stack>
          </>
        ) : null}
      </Stack>
    </Box>
  )
}
