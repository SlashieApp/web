'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { IdentityVerificationStatus } from '@codegen/schema'
import {
  LuCalendar,
  LuCheck,
  LuClock,
  LuLock,
  LuSend,
  LuShieldCheck,
} from 'react-icons/lu'

import { Badge, Card } from '@ui'

import { useWorkerProfile } from '../context/WorkerProfileContext'
import {
  formatMemberSince,
  workerFirstName,
} from '../helpers/workerProfileHelpers'
import { WorkerContactButton } from './WorkerContactButton'

/**
 * Trust row. A check mark renders ONLY when verified — unverified rows get a
 * hollow grey circle and muted copy, never a check (a grey check still reads
 * as "verified" at a glance and erodes trust).
 */
function CheckRow({ label, verified }: { label: string; verified: boolean }) {
  return (
    <HStack gap={2.5}>
      <Box
        boxSize="20px"
        borderRadius="full"
        bg={verified ? 'action.primary' : 'transparent'}
        borderWidth={verified ? 0 : '2px'}
        borderColor="border.strong"
        color="text.onGreen"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        aria-hidden
      >
        {verified ? <LuCheck size={11} strokeWidth={3.2} /> : null}
      </Box>
      <Text
        fontSize="sm"
        color={verified ? 'text.default' : 'text.muted'}
        fontWeight={verified ? 500 : 400}
      >
        {label}
      </Text>
    </HStack>
  )
}

function GlanceRow({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <HStack gap={2.5} color="text.default">
      <Box as="span" display="inline-flex" color="text.muted" aria-hidden>
        {icon}
      </Box>
      <Text fontSize="sm" fontWeight={500}>
        {label}
      </Text>
    </HStack>
  )
}

/** Sidebar: Trust & verification → At a glance → Get in touch. */
export function WorkerProfileSidebar() {
  const { worker } = useWorkerProfile()
  const firstName = workerFirstName(worker)
  const memberSince = formatMemberSince(
    worker.memberSince ?? worker.user.createdAt,
  )
  const years = worker.yearsExperience
  const avgResponse = worker.averageResponseTime?.trim()
  const quotesSent = worker.quotesSentCount
  const qualifications = worker.qualifications
    .map((q) => q.trim())
    .filter(Boolean)

  return (
    <Stack gap={5}>
      <Card layout="section" heading="Trust & verification">
        <Stack gap={3}>
          {/* NOT_STARTED is hidden — a "not verified" row on every new
              profile reads as a warning, not information. */}
          {worker.identityVerification ===
          IdentityVerificationStatus.Verified ? (
            <CheckRow label="Identity verified" verified />
          ) : worker.identityVerification ===
            IdentityVerificationStatus.Pending ? (
            <CheckRow label="Identity verification pending" verified={false} />
          ) : null}
          <CheckRow
            label={
              worker.phoneVerified ? 'Phone verified' : 'Phone not yet verified'
            }
            verified={worker.phoneVerified}
          />
          <CheckRow
            label={
              worker.emailVerified ? 'Email verified' : 'Email not yet verified'
            }
            verified={worker.emailVerified}
          />
          {memberSince ? (
            <HStack
              gap={2.5}
              pt={2}
              borderTopWidth="1px"
              borderColor="border.default"
              color="text.muted"
            >
              <Box as="span" display="inline-flex" aria-hidden>
                <LuCalendar size={15} strokeWidth={2} />
              </Box>
              <Text fontSize="sm">Member since {memberSince}</Text>
            </HStack>
          ) : null}
        </Stack>
      </Card>

      {years != null ||
      avgResponse ||
      quotesSent > 0 ||
      qualifications.length > 0 ? (
        <Card layout="section" heading="At a glance">
          <Stack gap={3}>
            {years != null && years > 0 ? (
              <GlanceRow
                icon={<LuShieldCheck size={15} strokeWidth={2} />}
                label={`${years} year${years === 1 ? '' : 's'} experience`}
              />
            ) : null}
            {quotesSent > 0 ? (
              <GlanceRow
                icon={<LuSend size={15} strokeWidth={2} />}
                label={`${quotesSent} quote${quotesSent === 1 ? '' : 's'} sent`}
              />
            ) : null}
            {avgResponse ? (
              <GlanceRow
                icon={<LuClock size={15} strokeWidth={2} />}
                label={`Avg response ${avgResponse}`}
              />
            ) : null}
            {qualifications.length > 0 ? (
              <HStack
                gap={1.5}
                flexWrap="wrap"
                pt={years != null || avgResponse || quotesSent > 0 ? 1 : 0}
              >
                {qualifications.map((qualification) => (
                  <Badge
                    key={qualification}
                    variant="neutral"
                    shape="pill"
                    size="sm"
                  >
                    {qualification}
                  </Badge>
                ))}
              </HStack>
            ) : null}
          </Stack>
        </Card>
      ) : null}

      <Card layout="section" heading="Get in touch">
        <Stack gap={4}>
          <Text fontSize="sm" color="text.muted" lineHeight="1.55">
            Contact {firstName} through Slashie. Details unlock after you accept
            a quote on a task.
          </Text>
          <WorkerContactButton />
          <HStack gap={2} color="text.muted" align="flex-start">
            <Box as="span" display="inline-flex" aria-hidden pt="1px">
              <LuLock size={13} strokeWidth={2} />
            </Box>
            <Text fontSize="xs" lineHeight="1.5">
              Your details are safe. We never share contact details unless you
              choose to.
            </Text>
          </HStack>
        </Stack>
      </Card>
    </Stack>
  )
}
