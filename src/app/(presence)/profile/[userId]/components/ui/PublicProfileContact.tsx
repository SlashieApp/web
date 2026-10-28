'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  MOBILE_BOTTOM_NAV_MAX_W,
  MOBILE_BOTTOM_NAV_OFFSET,
} from '@/ui/MobileBottomNav/mobileBottomNavLayout'
import { Button, Card, Link, SafetyNotice } from '@ui'

import type { PublicProfileModel } from '../../helpers/publicProfileModel'
import bag from '../../i11n.json'
import type { PublicProfilePageConfig } from '../../views'

export type ProfileContactProps = {
  contact: NonNullable<PublicProfilePageConfig['contact']>
  href: string
  /** First name for the button and helper copy. */
  firstName: string
}

function useContactCopy({ contact, firstName }: ProfileContactProps) {
  const t = useI11n(bag).contact
  return {
    heading: t.heading,
    label: formatMessage(t.actions[contact.action], { name: firstName }),
    helper: formatMessage(t.helpers[contact.helper], { name: firstName }),
  }
}

function ContactButton({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild w="full" size="lg">
      <Link href={href} _hover={{ textDecoration: 'none' }}>
        {label}
      </Link>
    </Button>
  )
}

/** Desktop sidebar: the one main action for this viewer. */
export function ProfileContactCard(props: ProfileContactProps) {
  const copy = useContactCopy(props)
  return (
    <Card
      layout="section"
      heading={copy.heading}
      display={{ base: 'none', lg: 'block' }}
    >
      <Text fontSize="sm" color="text.muted">
        {copy.helper}
      </Text>
      <ContactButton href={props.href} label={copy.label} />
      <SafetyNotice variant="inline" />
    </Card>
  )
}

/** Phones: the same action in a bar above the bottom nav. */
export function ProfileContactBar(props: ProfileContactProps) {
  const copy = useContactCopy(props)
  return (
    <Box
      display={{ base: 'block', lg: 'none' }}
      position="fixed"
      insetX={4}
      bottom={MOBILE_BOTTOM_NAV_OFFSET}
      zIndex={10}
      maxW={MOBILE_BOTTOM_NAV_MAX_W}
      mx="auto"
    >
      <Stack gap={2} p={3} bg="bg.surface" borderRadius="xl" boxShadow="e3">
        <Text fontSize="xs" color="text.muted" textAlign="center">
          {copy.helper}
        </Text>
        <ContactButton href={props.href} label={copy.label} />
      </Stack>
    </Box>
  )
}

function CheckRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <HStack gap={2.5}>
      <Box
        boxSize="20px"
        borderRadius="full"
        bg={checked ? 'action.primary' : 'transparent'}
        borderWidth={checked ? 0 : '2px'}
        borderColor="border.strong"
        color="text.onGreen"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        aria-hidden
      >
        {checked ? <LuCheck size={11} strokeWidth={3.2} /> : null}
      </Box>
      <Text fontSize="sm" color={checked ? 'text.default' : 'text.muted'}>
        {label}
      </Text>
    </HStack>
  )
}

/** Contact checks only; the stats strip carries experience and jobs. */
export function ProfileTrustCard({
  model,
}: {
  model: Pick<
    PublicProfileModel,
    'verified' | 'phoneVerified' | 'emailVerified'
  >
}) {
  const t = useI11n(bag).trust
  return (
    <Card layout="section" heading={t.heading}>
      <Stack gap={3}>
        {model.verified ? <CheckRow label={t.identity} checked /> : null}
        <CheckRow
          label={model.phoneVerified ? t.phone : t.phoneOff}
          checked={model.phoneVerified}
        />
        <CheckRow
          label={model.emailVerified ? t.email : t.emailOff}
          checked={model.emailVerified}
        />
      </Stack>
      <Text fontSize="xs" color="text.muted">
        {t.note}
      </Text>
    </Card>
  )
}
