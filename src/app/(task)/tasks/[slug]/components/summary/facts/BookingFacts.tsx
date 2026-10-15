'use client'

import { Box, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuReceipt, LuUser } from 'react-icons/lu'

import { type C2CReview, reviewCanEdit } from '@/content/reviews/reviewModel'
import { ReportControl } from '@/content/trust/ReportControl'
import { useI11n } from '@/i18n/useI11n'
import { formatDate } from '@/utils/dashboardHelpers'
import {
  type OrderTimelineStep,
  formatOrderAgreedPrice,
  orderTimelineSteps,
} from '@/utils/orderHelpers'
import { Avatar, Button, DetailRow, Link, RatingStars } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  formatTaskBudgetPaymentMethodLabel,
  orderCounterpart,
} from '../../../helpers/taskDetailUtils'
import bag from '../../../i11n.json'

/** Your worker / Your customer: name, phone, and email. */
export function OtherPartyFact() {
  const { task, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)
  if (!task || !myOrder) return null
  const party = orderCounterpart(task, myOrder, permissions.isOwner, t)
  const contact = [party.phone, party.email].filter(Boolean).join(' · ')

  return (
    <DetailRow
      icon={<LuUser />}
      label={permissions.isOwner ? t.booking.yourWorker : t.cta.yourCustomer}
    >
      <Stack gap={1}>
        <HStack gap={2} align="center">
          <Avatar
            size="xs"
            name={party.name}
            src={party.avatarUrl ?? undefined}
          />
          <Text as="span">{party.name}</Text>
        </HStack>
        {contact ? (
          <Text
            fontSize="sm"
            fontWeight={400}
            color="text.muted"
            overflowWrap="anywhere"
          >
            {contact}
          </Text>
        ) : null}
      </Stack>
    </DetailRow>
  )
}

/** Agreed total and payment method. */
export function AgreedPriceFact() {
  const { myOrder } = useTaskDetail()
  const t = useI11n(bag)
  if (!myOrder) return null
  const payment = myOrder.snapshot.paymentMethod?.trim()

  return (
    <DetailRow
      icon={<LuReceipt />}
      label={t.order.agreedTotal}
      subLine={
        payment ? formatTaskBudgetPaymentMethodLabel(payment) : undefined
      }
    >
      {formatOrderAgreedPrice(myOrder)}
    </DetailRow>
  )
}

function IconRailCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Complete</title>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Order closed</title>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Order created</title>
      <path
        d="M8 4h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 4v4h4M10 13h6M10 17h4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function IconWrench() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Tools</title>
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const TIMELINE_STEP_ICONS: Record<string, () => ReactNode> = {
  created: IconDocument,
  booked: IconWrench,
  closed: IconLock,
  cancelled: IconLock,
}

const RAIL_COLUMN_W = 28
const RAIL_DOT_SIZE = 20

function OrderRecordTimeline({ steps }: { steps: OrderTimelineStep[] }) {
  return (
    <Stack gap={0}>
      {steps.map((step, index) => {
        const StepIcon = TIMELINE_STEP_ICONS[step.key] ?? IconDocument
        const isFirst = index === 0
        const isLast = index === steps.length - 1

        return (
          <HStack
            key={step.key}
            align="center"
            gap={3}
            minH="3.75rem"
            position="relative"
          >
            <Box
              w={`${RAIL_COLUMN_W}px`}
              flexShrink={0}
              alignSelf="stretch"
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {!isFirst ? (
                <Box
                  position="absolute"
                  top={0}
                  left="50%"
                  transform="translateX(-50%)"
                  w="2px"
                  h="50%"
                  bg="status.success.soft"
                  aria-hidden
                />
              ) : null}
              {!isLast ? (
                <Box
                  position="absolute"
                  bottom={0}
                  left="50%"
                  transform="translateX(-50%)"
                  w="2px"
                  h="50%"
                  bg="status.success.soft"
                  aria-hidden
                />
              ) : null}
              <Flex
                w={`${RAIL_DOT_SIZE}px`}
                h={`${RAIL_DOT_SIZE}px`}
                align="center"
                justify="center"
                borderRadius="full"
                bg={step.done ? 'action.primary' : 'bg.surface'}
                borderWidth="2px"
                borderColor={step.done ? 'action.primary' : 'border.default'}
                color="text.onGreen"
                flexShrink={0}
                zIndex={1}
                lineHeight={0}
              >
                {step.done ? <IconRailCheck /> : null}
              </Flex>
            </Box>
            <Flex
              w="10"
              h="10"
              align="center"
              justify="center"
              borderRadius="full"
              bg="status.success.soft"
              color="status.success.fg"
              flexShrink={0}
            >
              <StepIcon />
            </Flex>
            <Stack gap={0.5} flex={1} minW={0}>
              <Text fontSize="sm" fontWeight={700} color="text.default">
                {step.label}
              </Text>
              {step.at ? (
                <Text fontSize="xs" color="text.muted">
                  {formatDate(step.at)}
                </Text>
              ) : null}
            </Stack>
          </HStack>
        )
      })}
    </Stack>
  )
}

/** The booking record: created, booked, then completed or cancelled, with dates. */
export function RecordFact() {
  const { myOrder } = useTaskDetail()
  const t = useI11n(bag)
  if (!myOrder) return null

  return (
    <Stack gap={1} py={3}>
      <Text fontSize="sm" fontWeight={500} color="text.muted">
        {t.order.timeline}
      </Text>
      <OrderRecordTimeline steps={orderTimelineSteps(myOrder)} />
    </Stack>
  )
}

function ReviewBlock({
  label,
  review,
  action,
}: {
  label: string
  review: C2CReview
  action?: ReactNode
}) {
  const comment = review.comment?.trim()
  return (
    <Stack gap={2}>
      <HStack justify="space-between" gap={3} align="center">
        <Text fontSize="sm" fontWeight={700} color="text.default">
          {label}
        </Text>
        <RatingStars value={review.stars} label={label} size="sm" />
      </HStack>
      {comment ? (
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {comment}
        </Text>
      ) : null}
      {action}
    </Stack>
  )
}

/**
 * Completed-order reviews: yours (editable for 48 hours), then theirs once
 * the API returns it.
 */
export function ReviewsFact() {
  const { task, myOrder, orderReview, viewerHasSubmittedReview } =
    useTaskDetail()
  const r = useI11n(bag).reviews
  if (!task || !myOrder) return null
  const { viewerReview, counterpartyReview } = orderReview

  return (
    <Stack gap={4} py={3}>
      <Text fontSize="sm" fontWeight={500} color="text.muted">
        {r.heading}
      </Text>
      {viewerReview ? (
        <ReviewBlock
          label={r.yours}
          review={viewerReview}
          action={
            reviewCanEdit(viewerReview) ? (
              <Button
                asChild
                size="sm"
                variant="secondary"
                alignSelf="flex-start"
              >
                <Link
                  href={`/tasks/${task.id}/review?orderId=${encodeURIComponent(myOrder.id)}`}
                  _hover={{ textDecoration: 'none' }}
                >
                  {r.edit}
                </Link>
              </Button>
            ) : (
              <Text fontSize="xs" color="text.muted">
                {r.locked}
              </Text>
            )
          }
        />
      ) : (
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {r.empty}
        </Text>
      )}
      {counterpartyReview ? (
        <ReviewBlock
          label={r.theirs}
          review={counterpartyReview}
          action={
            <ReportControl
              kind="review"
              targetId={counterpartyReview.id}
              targetTitle={r.theirs}
              variant="button"
            />
          }
        />
      ) : viewerHasSubmittedReview ? (
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {r.waiting}
        </Text>
      ) : null}
    </Stack>
  )
}
