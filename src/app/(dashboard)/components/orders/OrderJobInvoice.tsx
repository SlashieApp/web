'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

import { formatDate } from '@/utils/dashboardHelpers'
import {
  type OrderItem,
  formatOrderAgreedPrice,
  orderLocationLabel,
  orderSnapshotDatetime,
} from '@/utils/orderHelpers'
import { formatTaskScheduleLabel } from '@/utils/taskJobSchedule'
import { Button } from '@ui'

type OrderJobInvoiceProps = {
  order: OrderItem
  workerName: string
  /** When true, only the print trigger is shown (invoice body is print-only). */
  printTriggerOnly?: boolean
}

export function OrderJobInvoice({
  order,
  workerName,
  printTriggerOnly = false,
}: OrderJobInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const onPrint = useCallback(() => {
    window.print()
  }, [])

  const schedule = formatTaskScheduleLabel(orderSnapshotDatetime(order))
  const location = orderLocationLabel(order)

  return (
    <Stack gap={3}>
      <Button type="button" size="sm" variant="secondary" onClick={onPrint}>
        Review invoice
      </Button>

      <Box
        ref={printRef}
        id="slashie-order-invoice"
        display={printTriggerOnly ? 'none' : 'block'}
        className="slashie-order-invoice"
        p={5}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        css={{
          '@media print': {
            display: 'block !important',
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            border: 'none',
            borderRadius: 0,
            padding: '24px',
          },
        }}
      >
        <Stack gap={4}>
          <Stack gap={1}>
            <Text fontSize="xs" fontWeight={700} color="text.muted">
              JOB SUMMARY · REFERENCE ONLY
            </Text>
            <Heading size="md">{order.snapshot.title}</Heading>
            <Text fontSize="sm" color="text.muted">
              Order {order.id.slice(-8).toUpperCase()}
              {order.closedAt ? ` · Closed ${formatDate(order.closedAt)}` : ''}
            </Text>
          </Stack>

          <Stack gap={2} fontSize="sm">
            <Text>
              <strong>Worker:</strong> {workerName}
            </Text>
            <Text>
              <strong>Agreed price:</strong> {formatOrderAgreedPrice(order)}
            </Text>
            {schedule ? (
              <Text>
                <strong>Schedule:</strong> {schedule}
              </Text>
            ) : null}
            <Text>
              <strong>Location:</strong> {location}
            </Text>
          </Stack>

          <Box
            p={3}
            borderRadius="md"
            bg="neutral.100"
            fontSize="xs"
            color="text.muted"
          >
            This summary is for your records only. Slashie does not process
            payments between customers and workers — agree and settle payment
            directly with each other. This is not a platform invoice or tax
            document.
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}
