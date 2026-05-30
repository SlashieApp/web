'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type {
  ConfirmEmailVerificationMutation,
  ConfirmPhoneVerificationMutation,
  RequestEmailVerificationMutation,
  RequestPhoneVerificationMutation,
  UpdatePhoneNumberMutation,
} from '@codegen/schema'
import { useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import ConfirmEmailVerification from '@/app/(dashboard)/graphql/ConfirmEmailVerification.gql'
import ConfirmPhoneVerification from '@/app/(dashboard)/graphql/ConfirmPhoneVerification.gql'
import RequestEmailVerification from '@/app/(dashboard)/graphql/RequestEmailVerification.gql'
import RequestPhoneVerification from '@/app/(dashboard)/graphql/RequestPhoneVerification.gql'
import UpdatePhoneNumber from '@/app/(dashboard)/graphql/UpdatePhoneNumber.gql'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Badge, Button, FormField, Input, SectionCard } from '@ui'

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <Badge
      bg={verified ? 'primary.100' : 'badgeBg'}
      color={verified ? 'primary.800' : 'cardFg'}
    >
      {verified ? 'Verified' : 'Unverified'}
    </Badge>
  )
}

function EmailRow() {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const [requestVerification, { loading: requesting }] =
    useMutation<RequestEmailVerificationMutation>(RequestEmailVerification)
  const [confirmVerification, { loading: confirming }] =
    useMutation<ConfirmEmailVerificationMutation>(ConfirmEmailVerification)

  if (!me) return null
  const verified = Boolean(me.profile?.emailVerified)

  const start = async () => {
    setError(null)
    setHint(null)
    setOpen(true)
    try {
      const result = await requestVerification()
      const devCode = result.data?.requestEmailVerification?.devCode
      if (devCode) {
        setToken(devCode)
        setHint(`Dev code: ${devCode}`)
      } else {
        setHint('We sent a verification link/token to your email.')
      }
    } catch (e) {
      setError(
        getFriendlyErrorMessage(e, 'Could not start email verification.'),
      )
    }
  }

  const confirm = async () => {
    const trimmed = token.trim()
    if (!trimmed) {
      setError('Enter the verification token from your email.')
      return
    }
    setError(null)
    try {
      const result = await confirmVerification({
        variables: { token: trimmed },
      })
      const updated = result.data?.confirmEmailVerification
      if (updated && me.profile) {
        patchMe({
          profile: {
            ...me.profile,
            emailVerified: updated.profile.emailVerified,
          },
          workerEligibility: updated.workerEligibility,
        })
      }
      setOpen(false)
      setToken('')
      setHint(null)
    } catch (e) {
      setError(
        getFriendlyErrorMessage(e, 'That token did not work. Try again.'),
      )
    }
  }

  return (
    <Stack gap={3} borderBottomWidth="1px" borderColor="cardBorder" pb={4}>
      <HStack
        justify="space-between"
        align="flex-start"
        gap={3}
        flexWrap="wrap"
      >
        <Stack gap={0}>
          <Text fontSize="sm" fontWeight={700}>
            Email
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            {me.email}
          </Text>
        </Stack>
        <HStack gap={3}>
          <VerifiedBadge verified={verified} />
          {!verified && !open ? (
            <Button size="sm" variant="secondary" onClick={() => void start()}>
              Verify email
            </Button>
          ) : null}
        </HStack>
      </HStack>

      {open ? (
        <Stack gap={3}>
          <FormField
            label="Verification token"
            helperText={hint ?? 'Paste the token from your verification email.'}
          >
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Verification token"
            />
          </FormField>
          <HStack gap={3}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => void confirm()}
              loading={confirming}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void start()}
              loading={requesting}
            >
              Resend
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setOpen(false)
                setError(null)
              }}
            >
              Cancel
            </Button>
          </HStack>
        </Stack>
      ) : null}

      {error ? (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      ) : null}
    </Stack>
  )
}

function PhoneRow() {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const [editing, setEditing] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const [updatePhone, { loading: savingPhone }] =
    useMutation<UpdatePhoneNumberMutation>(UpdatePhoneNumber)
  const [requestVerification, { loading: requesting }] =
    useMutation<RequestPhoneVerificationMutation>(RequestPhoneVerification)
  const [confirmVerification, { loading: confirming }] =
    useMutation<ConfirmPhoneVerificationMutation>(ConfirmPhoneVerification)

  if (!me) return null
  const phone = me.profile?.contactNumber?.trim() || ''
  const verified = Boolean(me.profile?.phoneVerified)

  const savePhone = async () => {
    const trimmed = phoneInput.trim()
    if (!trimmed) {
      setError('Enter a phone number.')
      return
    }
    setError(null)
    try {
      const result = await updatePhone({
        variables: { contactNumber: trimmed },
      })
      const updated = result.data?.updatePhoneNumber
      if (updated && me.profile) {
        patchMe({
          profile: {
            ...me.profile,
            contactNumber: updated.profile.contactNumber,
            phoneVerified: updated.profile.phoneVerified,
          },
          workerEligibility: updated.workerEligibility,
        })
      }
      setEditing(false)
      setPhoneInput('')
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not save your phone number.'))
    }
  }

  const startVerify = async () => {
    setError(null)
    setHint(null)
    setVerifyOpen(true)
    try {
      const result = await requestVerification()
      const devCode = result.data?.requestPhoneVerification?.devCode
      if (devCode) {
        setCode(devCode)
        setHint(`Dev code: ${devCode}`)
      } else {
        setHint('We sent a code by SMS to your phone.')
      }
    } catch (e) {
      setError(
        getFriendlyErrorMessage(e, 'Could not start phone verification.'),
      )
    }
  }

  const confirmVerify = async () => {
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Enter the code we sent by SMS.')
      return
    }
    setError(null)
    try {
      const result = await confirmVerification({ variables: { code: trimmed } })
      const updated = result.data?.confirmPhoneVerification
      if (updated && me.profile) {
        patchMe({
          profile: {
            ...me.profile,
            contactNumber: updated.profile.contactNumber,
            phoneVerified: updated.profile.phoneVerified,
          },
          workerEligibility: updated.workerEligibility,
        })
      }
      setVerifyOpen(false)
      setCode('')
      setHint(null)
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'That code did not work. Try again.'))
    }
  }

  return (
    <Stack gap={3}>
      <HStack
        justify="space-between"
        align="flex-start"
        gap={3}
        flexWrap="wrap"
      >
        <Stack gap={0}>
          <Text fontSize="sm" fontWeight={700}>
            Phone
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            {phone || 'Not set'}
          </Text>
        </Stack>
        <HStack gap={3} flexWrap="wrap">
          {phone ? <VerifiedBadge verified={verified} /> : null}
          {!editing ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setPhoneInput(phone)
                setEditing(true)
                setError(null)
              }}
            >
              {phone ? 'Edit phone' : 'Add phone'}
            </Button>
          ) : null}
          {phone && !verified && !verifyOpen && !editing ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void startVerify()}
            >
              Verify phone
            </Button>
          ) : null}
        </HStack>
      </HStack>

      {editing ? (
        <Stack gap={3}>
          <FormField
            label="Phone number"
            helperText="Saving a new number resets verification until you re-verify."
          >
            <Input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+44 7000 000000"
              inputMode="tel"
            />
          </FormField>
          <HStack gap={3}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => void savePhone()}
              loading={savingPhone}
            >
              Save phone
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false)
                setError(null)
              }}
            >
              Cancel
            </Button>
          </HStack>
        </Stack>
      ) : null}

      {verifyOpen ? (
        <Stack gap={3}>
          <FormField
            label="SMS code"
            helperText={hint ?? 'Enter the code we sent to your phone.'}
          >
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
            />
          </FormField>
          <HStack gap={3}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => void confirmVerify()}
              loading={confirming}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void startVerify()}
              loading={requesting}
            >
              Resend
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setVerifyOpen(false)
                setError(null)
              }}
            >
              Cancel
            </Button>
          </HStack>
        </Stack>
      ) : null}

      {error ? (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      ) : null}
    </Stack>
  )
}

export function AccountContactCard() {
  return (
    <SectionCard p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading size="md">Contact methods</Heading>
          <Text fontSize="sm" color="formLabelMuted">
            Verify a contact method to unlock it as a default on your profile
            and to become a worker.
          </Text>
        </Stack>
        <EmailRow />
        <PhoneRow />
      </Stack>
    </SectionCard>
  )
}
