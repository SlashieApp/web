'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  Grid,
  HStack,
  Heading,
  IconButton,
  Input,
  Link,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { LoginMethod, type UpdateMyProfileMutation } from '@codegen/schema'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { ME_QUERY } from '@/graphql/auth'
import { UPDATE_MY_PROFILE_MUTATION } from '@/graphql/users'
import { IconCalendar } from '@/icons/taskMeta'
import {
  loadCustomerProfileExtras,
  saveCustomerProfileExtras,
} from '@/utils/customerProfileExtras'
import {
  formatPounds,
  getDisplayNameFromEmail,
  isTaskCompleted,
  taskBudgetPence,
} from '@/utils/dashboardHelpers'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Badge, Button } from '@ui'

import { useCustomerAccount } from '../context'

function displayNameFromMe(me: {
  firstName: string
  lastName: string
  profile?: { name?: string | null } | null
  email: string
}) {
  const combined = `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim()
  if (combined) return combined
  const profileName = me.profile?.name?.trim()
  if (profileName) return profileName
  return getDisplayNameFromEmail(me.email)
}

function joinMonthYear(iso: unknown) {
  const d =
    typeof iso === 'string' || typeof iso === 'number'
      ? new Date(iso)
      : iso instanceof Date
        ? iso
        : null
  if (!d || Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(d)
}

function ChevronRight() {
  return (
    <Box as="span" color="primary.600" flexShrink={0} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Opens editor</title>
        <path
          d="m9 6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function IconGoogle() {
  return (
    <Box
      w={9}
      h={9}
      borderRadius="md"
      bg="white"
      display="grid"
      placeItems="center"
      boxShadow="sm"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <title>Google</title>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    </Box>
  )
}

function IconEnvelope() {
  return (
    <Box color="primary.700" display="flex" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <title>Email</title>
        <path
          d="M4 6h16v12H4V6Zm0 0 8 6 8-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function IconLockOutline() {
  return (
    <Box color="primary.700" display="flex" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>Password</title>
        <path
          d="M12 3a6 6 0 0 0-6 6v3H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V9a6 6 0 0 0-6-6Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 9.5a3.5 3.5 0 1 0-7 0V12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

function IconSignOut() {
  return (
    <Box color="red.500" display="flex" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Sign out</title>
        <path
          d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function IconPencil() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Edit</title>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ConnectedBadge() {
  return (
    <HStack gap={1}>
      <Box w={2} h={2} borderRadius="full" bg="green.600" />
      <Text fontSize="sm" fontWeight={600} color="green.700">
        Connected
      </Text>
    </HStack>
  )
}

export default function CustomerProfilePage() {
  const router = useRouter()
  const logout = useUserStore((s) => s.logout)
  const {
    me,
    myPostedTasks,
    tasksLoading,
    tasksErrorMessage,
    refetchCustomerAccount,
  } = useCustomerAccount()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [editingSection, setEditingSection] = useState<
    'none' | 'all' | 'name' | 'location' | 'bio' | 'phone'
  >('none')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saveOk, setSaveOk] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [updateMyProfile, { loading: profileSaving }] =
    useMutation<UpdateMyProfileMutation>(UPDATE_MY_PROFILE_MUTATION, {
      refetchQueries: [{ query: ME_QUERY }],
      awaitRefetchQueries: true,
    })

  const prevMeRef = useRef<typeof me | undefined>(undefined)
  if (me !== prevMeRef.current) {
    prevMeRef.current = me
    if (me) {
      const extras = loadCustomerProfileExtras(me.id)
      setLocation(extras.location)
      setBio(extras.bio)
      setAvatarPreview(extras.avatarOverride ?? null)
      setFullName(displayNameFromMe(me))
      setPhoneNumber(me.profile?.contactNumber?.trim() ?? '')
    }
  }

  const persistExtras = useCallback(() => {
    if (!me) return
    saveCustomerProfileExtras(me.id, {
      location,
      bio,
      avatarOverride: avatarPreview,
    })
  }, [me, location, bio, avatarPreview])

  const completedPosted = useMemo(
    () => myPostedTasks.filter((t) => isTaskCompleted(t.status)),
    [myPostedTasks],
  )

  const totalTasksPosted = myPostedTasks.length
  const totalSpendPence = useMemo(
    () => completedPosted.reduce((sum, task) => sum + taskBudgetPence(task), 0),
    [completedPosted],
  )

  const passwordConnected = Boolean(
    me?.enabledLoginMethods?.includes(LoginMethod.Password),
  )

  const avatarSrc =
    avatarPreview?.trim() || me?.profile?.avatarUrl?.trim() || undefined

  const headerInitial =
    displayNameFromMe(
      me ?? {
        firstName: '',
        lastName: '',
        profile: null,
        email: '',
      },
    )
      .charAt(0)
      .toUpperCase() || '?'

  async function persistProfileToApi() {
    if (!me) return
    const trimmedName = fullName.trim()
    if (!trimmedName) {
      setSaveError('Please enter your full name.')
      return
    }

    setSaveError(null)
    setSaveOk(null)

    try {
      await updateMyProfile({
        variables: {
          input: {
            name: trimmedName,
            contactNumber: phoneNumber.trim() || undefined,
          },
        },
      })
      persistExtras()
      setSaveOk('Profile updated.')
      setEditingSection('none')
      void refetchCustomerAccount()
    } catch (err) {
      setSaveError(
        getFriendlyErrorMessage(err, 'Could not save your profile. Try again.'),
      )
    }
  }

  function handleAvatarFile(file: File | null) {
    if (!file || !me) return
    if (!file.type.startsWith('image/')) {
      setSaveError('Please choose an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      setAvatarPreview(result)
      const current = loadCustomerProfileExtras(me.id)
      saveCustomerProfileExtras(me.id, {
        ...current,
        avatarOverride: result,
      })
      setSaveOk('Photo updated for this session.')
      setSaveError(null)
    }
    reader.readAsDataURL(file)
  }

  const forgotHref = me?.email
    ? `/forgot-password?email=${encodeURIComponent(me.email)}`
    : '/forgot-password'

  return (
    <Stack gap={{ base: 8, md: 10 }} maxW="960px" mx="auto">
      <Stack gap={2}>
        <HStack gap={3} align="flex-start" flexWrap="wrap">
          <Box position="relative">
            <Box
              w={{ base: '88px', md: '104px' }}
              h={{ base: '88px', md: '104px' }}
              borderRadius="full"
              bg="primary.100"
              display="grid"
              placeItems="center"
              fontSize="2xl"
              fontWeight={800}
              color="primary.800"
              overflow="hidden"
              borderWidth="3px"
              borderColor="neutral.100"
              boxShadow="sm"
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                headerInitial
              )}
            </Box>
            <IconButton
              position="absolute"
              bottom={0}
              right={0}
              size="xs"
              borderRadius="full"
              colorPalette="blue"
              aria-label="Change profile photo"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconPencil />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                handleAvatarFile(e.target.files?.[0] ?? null)
                e.target.value = ''
              }}
            />
          </Box>

          <Stack gap={1} flex="1" minW={0} pt={1}>
            <HStack gap={2} flexWrap="wrap" align="center">
              <Heading size="xl">
                {me ? displayNameFromMe(me) : 'Account'}
              </Heading>
              <Badge
                bg="jobCardBg"
                color="jobCardTitle"
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight={800}
                letterSpacing="0.04em"
              >
                CUSTOMER
              </Badge>
            </HStack>
            <Text color="formLabelMuted">{me?.email}</Text>
            {joinMonthYear(me?.createdAt) ? (
              <HStack gap={2} color="formLabelMuted" fontSize="sm">
                <IconCalendar w="16px" h="16px" />
                <Text>Joined {joinMonthYear(me?.createdAt)}</Text>
              </HStack>
            ) : null}
          </Stack>
        </HStack>
      </Stack>

      {tasksErrorMessage ? (
        <Text color="red.400" fontSize="sm">
          {tasksErrorMessage}
        </Text>
      ) : null}

      <Box p={{ base: 5, md: 6 }} bg="jobCardBg">
        <Stack gap={5}>
          <HStack
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
          >
            <Heading size="md">Basic Information</Heading>
            <Link
              as="button"
              type="button"
              fontWeight={700}
              color="primary.700"
              onClick={() => {
                setEditingSection((prev) => (prev === 'all' ? 'none' : 'all'))
                setSaveError(null)
              }}
            >
              {editingSection === 'all' ? 'Done' : 'Edit All'}
            </Link>
          </HStack>

          {(saveOk || saveError) && editingSection !== 'none' ? (
            <Stack gap={1}>
              {saveError ? (
                <Text color="red.500" fontSize="sm">
                  {saveError}
                </Text>
              ) : null}
              {saveOk ? (
                <Text color="green.700" fontSize="sm">
                  {saveOk}
                </Text>
              ) : null}
            </Stack>
          ) : null}

          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
            gap={3}
          >
            <InfoRow
              label="Full Name"
              value={fullName || '—'}
              expanded={editingSection === 'all' || editingSection === 'name'}
              onActivate={() => {
                setEditingSection('name')
                setSaveError(null)
              }}
            >
              <Input
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFullName(e.target.value)
                }
                aria-label="Full name"
                bg="neutral.100"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="formControlBorder"
              />
            </InfoRow>
            <InfoRow
              label="Location"
              value={location.trim() || '—'}
              expanded={
                editingSection === 'all' || editingSection === 'location'
              }
              onActivate={() => {
                setEditingSection('location')
                setSaveError(null)
              }}
            >
              <Input
                value={location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocation(e.target.value)
                }
                placeholder="City or region"
                aria-label="Location"
                bg="neutral.100"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="formControlBorder"
              />
            </InfoRow>
          </Grid>

          <InfoRow
            label="Bio"
            value={bio.trim() || 'Add a short bio'}
            expanded={editingSection === 'all' || editingSection === 'bio'}
            onActivate={() => {
              setEditingSection('bio')
              setSaveError(null)
            }}
            fullWidth
          >
            <Textarea
              minH="120px"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell workers a little about what you are looking for."
              bg="neutral.100"
              borderColor="jobCardBorder"
              borderRadius="lg"
            />
          </InfoRow>

          <InfoRow
            label="Phone Number"
            value={phoneNumber.trim() || '—'}
            expanded={editingSection === 'all' || editingSection === 'phone'}
            onActivate={() => {
              setEditingSection('phone')
              setSaveError(null)
            }}
          >
            <Input
              value={phoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPhoneNumber(e.target.value)
              }
              placeholder="+44 7000 000000"
              inputMode="tel"
              aria-label="Phone number"
              bg="neutral.100"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="formControlBorder"
            />
          </InfoRow>

          {editingSection !== 'none' ? (
            <HStack gap={3} flexWrap="wrap">
              <Button
                onClick={() => void persistProfileToApi()}
                loading={profileSaving}
              >
                Save changes
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingSection('none')
                  setSaveError(null)
                  setSaveOk(null)
                }}
              >
                Cancel
              </Button>
            </HStack>
          ) : null}
        </Stack>
      </Box>

      <Stack gap={4}>
        <Heading size="md">Account Security</Heading>
        <Box p={0} overflow="hidden">
          {/* Google login method is intentionally hidden until rollout is ready. */}
          {/* <SecurityRow
            icon={<IconGoogle />}
            title="Google"
            status={<ConnectedBadge />}
            action={
              googleConnected ? (
                <Text fontSize="sm" color="formLabelMuted">
                  Managed in Slashie settings soon
                </Text>
              ) : (
                <Text fontSize="sm" color="formLabelMuted">
                  Not connected
                </Text>
              )
            }
          />
          <Box h="1px" bg="jobCardBorder" /> */}
          <SecurityRow
            icon={<IconEnvelope />}
            title="Email Address"
            status={<ConnectedBadge />}
            action={
              <Link
                as={NextLink}
                href={forgotHref}
                fontWeight={700}
                color="primary.700"
              >
                Change
              </Link>
            }
          />
        </Box>

        <Box p={4} bg="jobCardBg">
          <NextLink href={forgotHref} passHref legacyBehavior>
            <Button
              as="a"
              variant="secondary"
              width="full"
              justifyContent="center"
              gap={2}
            >
              <IconLockOutline />
              Change Password
            </Button>
          </NextLink>
          {!passwordConnected ? (
            <Text fontSize="sm" color="formLabelMuted" mt={3}>
              Password sign-in is not enabled on this account. Use your
              connected provider, or contact support to add a password.
            </Text>
          ) : null}
        </Box>
      </Stack>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
        gap={4}
      >
        <Box
          p={6}
          bg="primary.700"
          color="white"
          position="relative"
          overflow="hidden"
        >
          <Stack gap={1} position="relative" zIndex={1}>
            <Text
              fontSize="xs"
              fontWeight={800}
              letterSpacing="0.08em"
              opacity={0.9}
            >
              TOTAL TASKS POSTED
            </Text>
            <Text fontSize="4xl" fontWeight={800} lineHeight={1.1}>
              {tasksLoading ? '…' : totalTasksPosted}
            </Text>
          </Stack>
          <Box
            position="absolute"
            right={4}
            bottom={4}
            opacity={0.2}
            fontSize="4xl"
            aria-hidden
          >
            📋
          </Box>
        </Box>
        <Box p={6} bg="badgeBg" position="relative" overflow="hidden">
          <Stack gap={1} position="relative" zIndex={1}>
            <Text
              fontSize="xs"
              fontWeight={800}
              letterSpacing="0.08em"
              color="formLabelMuted"
            >
              TOTAL SPENT
            </Text>
            <Text fontSize="3xl" fontWeight={800} color="primary.800">
              {tasksLoading ? '…' : formatPounds(totalSpendPence)}
            </Text>
            <Text fontSize="xs" color="formLabelMuted">
              Based on completed tasks you posted.
            </Text>
          </Stack>
          <Box
            position="absolute"
            right={4}
            bottom={2}
            opacity={0.15}
            fontSize="4xl"
            aria-hidden
          >
            💷
          </Box>
        </Box>
      </Grid>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
        gap={4}
      >
        <Link
          as={NextLink}
          href="/requests"
          textDecoration="none"
          color="inherit"
        >
          <Box
            p={6}
            bg="primary.50"
            borderColor="primary.100"
            borderWidth="1px"
            position="relative"
            overflow="hidden"
            display="block"
            _hover={{ boxShadow: 'md' }}
          >
            <Heading size="md" color="primary.900">
              My Requests
            </Heading>
            <Text color="formLabelMuted" mt={2} maxW="sm">
              Track your ongoing and completed service requests.
            </Text>
            <Box
              position="absolute"
              right={2}
              bottom={0}
              opacity={0.12}
              fontSize="5xl"
            >
              📋
            </Box>
          </Box>
        </Link>
        <Link
          as={NextLink}
          href="/dashboard"
          textDecoration="none"
          color="inherit"
        >
          <Box
            p={6}
            bg="jobCardBg"
            borderColor="jobCardBg"
            borderWidth="1px"
            position="relative"
            overflow="hidden"
            display="block"
            _hover={{ boxShadow: 'md' }}
          >
            <Heading size="md" color="jobCardTitle">
              Switch to Worker Mode
            </Heading>
            <Text color="jobCardTitle" opacity={0.9} mt={2} maxW="sm">
              Start earning by offering your skills to the community.
            </Text>
            <Box
              position="absolute"
              right={2}
              bottom={0}
              opacity={0.15}
              fontSize="5xl"
            >
              👷
            </Box>
          </Box>
        </Link>
      </Grid>

      <HStack justify="center" py={4}>
        <Button
          variant="ghost"
          colorPalette="red"
          onClick={() => {
            logout()
            router.push('/')
          }}
          gap={2}
        >
          <IconSignOut />
          Sign Out
        </Button>
      </HStack>
    </Stack>
  )
}

function InfoRow({
  label,
  value,
  expanded,
  onActivate,
  fullWidth,
  children,
}: {
  label: string
  value: string
  expanded: boolean
  onActivate: () => void
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <Box
      gridColumn={fullWidth ? { base: '1 / -1', md: '1 / -1' } : undefined}
      p={4}
      bg="primary.50"
      borderWidth="1px"
      borderColor="primary.100"
    >
      {!expanded ? (
        <Box
          as="button"
          w="full"
          cursor="pointer"
          textAlign="left"
          bg="transparent"
          border="none"
          p={0}
          onClick={onActivate}
        >
          <HStack justify="space-between" align="flex-start" gap={3}>
            <Stack gap={1} align="flex-start" minW={0}>
              <Text
                fontSize="xs"
                fontWeight={800}
                letterSpacing="0.06em"
                color="primary.800"
              >
                {label}
              </Text>
              <Text
                fontWeight={600}
                color="jobCardTitle"
                wordBreak="break-word"
              >
                {value}
              </Text>
            </Stack>
            <ChevronRight />
          </HStack>
        </Box>
      ) : (
        <Stack gap={3} align="stretch">
          <HStack justify="space-between">
            <Text
              fontSize="xs"
              fontWeight={800}
              letterSpacing="0.06em"
              color="primary.800"
            >
              {label}
            </Text>
            <ChevronRight />
          </HStack>
          {children}
        </Stack>
      )}
    </Box>
  )
}

function SecurityRow({
  icon,
  title,
  status,
  action,
}: {
  icon: React.ReactNode
  title: string
  status: React.ReactNode
  action: React.ReactNode
}) {
  return (
    <HStack
      px={5}
      py={4}
      gap={4}
      align="center"
      flexWrap="wrap"
      justify="space-between"
    >
      <HStack gap={3} align="center">
        {icon}
        <Text fontWeight={700}>{title}</Text>
        {status}
      </HStack>
      <Box flexShrink={0}>{action}</Box>
    </HStack>
  )
}
