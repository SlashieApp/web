'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  IconButton,
  Link,
  NativeSelect,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import {
  LoginMethod,
  TaskContactMethod,
  type UpdateMyProfileMutation,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useUserStore } from '@/app/(auth)/store/user'
import { ME_QUERY } from '@/graphql/auth'
import { UPDATE_MY_PROFILE_MUTATION } from '@/graphql/users'
import { IconCalendar } from '@/icons/taskMeta'
import {
  loadCustomerProfileExtras,
  saveCustomerProfileExtras,
} from '@/utils/customerProfileExtras'
import {
  type TaskItem,
  formatPounds,
  isTaskCompleted,
  taskBudgetPence,
} from '@/utils/dashboardHelpers'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { formatTaskContactMethodLabel } from '@/utils/taskLocationDisplay'
import { Badge, Button, FormField, Input } from '@ui'

import { useCustomerAccount } from '../context'
import {
  displayNameFromMe,
  initialDisplayNameForForm,
  joinMonthYear,
} from './profileDisplayHelpers'
import {
  type ProfileApiFormValues,
  profileApiFormSchema,
  profileFormToMutationInput,
} from './profileFormSchema'

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

export default function CustomerProfilePage() {
  const router = useRouter()
  const logout = useUserStore((s) => s.logout)
  const {
    me,
    meLoading,
    meErrorMessage,
    myPostedTasks,
    tasksLoading,
    tasksErrorMessage,
    refetchCustomerAccount,
  } = useCustomerAccount()

  const [editingSection, setEditingSection] = useState<
    | 'none'
    | 'all'
    | 'displayName'
    | 'location'
    | 'bio'
    | 'phone'
    | 'preferredContact'
  >('none')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saveOk, setSaveOk] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [localSaveOk, setLocalSaveOk] = useState<string | null>(null)
  const [localSaveError, setLocalSaveError] = useState<string | null>(null)

  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const formValues = useMemo((): ProfileApiFormValues => {
    if (!me) {
      return {
        displayName: '',
        contactNumber: '',
        defaultPreferredContactMethod: TaskContactMethod.InApp,
      }
    }
    return {
      displayName: initialDisplayNameForForm(me),
      contactNumber: me.profile?.contactNumber?.trim() ?? '',
      defaultPreferredContactMethod:
        me.profile?.defaultPreferredContactMethod ?? TaskContactMethod.InApp,
    }
  }, [me])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileApiFormValues>({
    resolver: zodResolver(profileApiFormSchema),
    values: formValues,
  })

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
    () => myPostedTasks.filter((t: TaskItem) => isTaskCompleted(t.status)),
    [myPostedTasks],
  )

  const totalTasksPosted = myPostedTasks.length
  const totalSpendPence = useMemo(
    () =>
      completedPosted.reduce(
        (sum: number, task: TaskItem) => sum + taskBudgetPence(task),
        0,
      ),
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

  async function onSubmitProfile(values: ProfileApiFormValues) {
    if (!me) return
    setSaveError(null)
    setSaveOk(null)
    setLocalSaveOk(null)
    setLocalSaveError(null)
    try {
      await updateMyProfile({
        variables: {
          input: profileFormToMutationInput(values),
        },
      })
      setSaveOk('Profile saved.')
      setEditingSection('none')
      void refetchCustomerAccount()
    } catch (err: unknown) {
      setSaveError(
        getFriendlyErrorMessage(err, 'Could not save your profile. Try again.'),
      )
    }
  }

  function saveLocalExtrasOnly() {
    if (!me) return
    setLocalSaveError(null)
    setLocalSaveOk(null)
    try {
      persistExtras()
      setLocalSaveOk('Saved on this device.')
    } catch {
      setLocalSaveError('Could not save. Check browser storage permissions.')
    }
  }

  function handleAvatarFile(file: File | null) {
    if (!file || !me) return
    if (!file.type.startsWith('image/')) {
      setLocalSaveError('Please choose an image file.')
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
      setLocalSaveOk('Photo updated for this session on this device.')
      setLocalSaveError(null)
    }
    reader.readAsDataURL(file)
  }

  const forgotHref = me?.email
    ? `/forgot-password?email=${encodeURIComponent(me.email)}`
    : '/forgot-password'

  const inner =
    meLoading && !me ? (
      <Stack gap={4} py={10}>
        <Text color="formLabelMuted" fontSize="sm">
          Loading your account…
        </Text>
      </Stack>
    ) : meErrorMessage && !me ? (
      <Stack gap={3} py={8}>
        <Text color="red.500" fontSize="sm">
          {meErrorMessage}
        </Text>
        <Text fontSize="sm" color="formLabelMuted">
          Try refreshing the page. If the problem continues, sign in again.
        </Text>
      </Stack>
    ) : !me ? null : (
      <Stack gap={{ base: 8, md: 10 }}>
        {meErrorMessage ? (
          <Text color="orange.600" fontSize="sm">
            {meErrorMessage}
          </Text>
        ) : null}

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
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
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
                aria-label="Choose a preview image for this device"
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
                <Heading size="xl">{displayNameFromMe(me)}</Heading>
                <Badge
                  bg="cardBg"
                  color="cardFg"
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
              <Text color="formLabelMuted">{me.email}</Text>
              {joinMonthYear(me.createdAt) ? (
                <HStack gap={2} color="formLabelMuted" fontSize="sm">
                  <IconCalendar w="16px" h="16px" />
                  <Text>Joined {joinMonthYear(me.createdAt)}</Text>
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

        <Box
          p={{ base: 5, md: 6 }}
          bg="cardBg"
          borderWidth="1px"
          borderColor="cardBorder"
          borderRadius="xl"
        >
          <Stack gap={4} mb={5}>
            <Heading size="sm" color="formLabelMuted" fontWeight={700}>
              Account details
            </Heading>
            <Grid
              templateColumns={{ base: '1fr', sm: 'repeat(3, minmax(0,1fr))' }}
              gap={3}
            >
              <Stack gap={1}>
                <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                  Email
                </Text>
                <Text fontWeight={600} wordBreak="break-word">
                  {me.email}
                </Text>
              </Stack>
              <Stack gap={1}>
                <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                  First name
                </Text>
                <Text fontWeight={600}>{me.firstName || '—'}</Text>
              </Stack>
              <Stack gap={1}>
                <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                  Last name
                </Text>
                <Text fontWeight={600}>{me.lastName || '—'}</Text>
              </Stack>
            </Grid>
            <Text fontSize="xs" color="formLabelMuted">
              Name and email come from your account. Change password via
              security below; contact support if your legal name needs updating.
            </Text>
          </Stack>
        </Box>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmitProfile)(e)
          }}
          noValidate
        >
          <Box
            p={{ base: 5, md: 6 }}
            bg="cardBg"
            borderWidth="1px"
            borderColor="cardBorder"
            borderRadius="xl"
          >
            <Stack gap={5}>
              <HStack
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={3}
              >
                <Heading size="md">Profile on Slashie</Heading>
                <Link
                  as="button"
                  type="button"
                  fontWeight={700}
                  color="primary.600"
                  onClick={() => {
                    setEditingSection((prev) =>
                      prev === 'all' ? 'none' : 'all',
                    )
                    setSaveError(null)
                    setSaveOk(null)
                  }}
                >
                  {editingSection === 'all' ? 'Done' : 'Edit all'}
                </Link>
              </HStack>

              <Text fontSize="sm" color="formLabelMuted">
                Saved to your account and used across quotes and tasks.
              </Text>

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
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                }}
                gap={3}
              >
                <InfoRow
                  label="Display name"
                  value={
                    initialDisplayNameForForm(me).trim() ||
                    displayNameFromMe(me) ||
                    '—'
                  }
                  expanded={
                    editingSection === 'all' || editingSection === 'displayName'
                  }
                  onActivate={() => {
                    setEditingSection('displayName')
                    setSaveError(null)
                  }}
                >
                  <FormField
                    label="Display name"
                    errorText={errors.displayName?.message}
                  >
                    <Input
                      {...register('displayName')}
                      placeholder="How you want to appear"
                      aria-label="Display name"
                    />
                  </FormField>
                </InfoRow>

                <InfoRow
                  label="Phone"
                  value={me.profile?.contactNumber?.trim() || '—'}
                  expanded={
                    editingSection === 'all' || editingSection === 'phone'
                  }
                  onActivate={() => {
                    setEditingSection('phone')
                    setSaveError(null)
                  }}
                >
                  <FormField
                    label="Phone number"
                    helperText="Optional. Shared only when you allow contact by phone."
                    errorText={errors.contactNumber?.message}
                  >
                    <Input
                      {...register('contactNumber')}
                      placeholder="+44 7000 000000"
                      inputMode="tel"
                      aria-label="Phone number"
                    />
                  </FormField>
                </InfoRow>
              </Grid>

              <InfoRow
                label="Default contact when posting a task"
                value={formatTaskContactMethodLabel(
                  formValues.defaultPreferredContactMethod,
                )}
                expanded={
                  editingSection === 'all' ||
                  editingSection === 'preferredContact'
                }
                onActivate={() => {
                  setEditingSection('preferredContact')
                  setSaveError(null)
                }}
                fullWidth
              >
                <Stack gap={3} align="stretch">
                  <Text fontSize="sm" color="formLabelMuted">
                    You can override this on each task. Matches{' '}
                    <Link
                      as={NextLink}
                      href="/tasks/create"
                      color="primary.600"
                    >
                      post a task
                    </Link>{' '}
                    prefill.
                  </Text>
                  <Controller
                    name="defaultPreferredContactMethod"
                    control={control}
                    render={({ field }) => (
                      <NativeSelect.Root w="full" maxW="320px">
                        <NativeSelect.Field
                          {...field}
                          aria-label="Default contact method for new tasks"
                        >
                          <option value={TaskContactMethod.InApp}>
                            In-app chat
                          </option>
                          <option value={TaskContactMethod.Phone}>Phone</option>
                          <option value={TaskContactMethod.Email}>Email</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    )}
                  />
                </Stack>
              </InfoRow>

              {editingSection !== 'none' ? (
                <HStack gap={3} flexWrap="wrap">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={profileSaving || isSubmitting}
                  >
                    Save profile
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingSection('none')
                      setSaveError(null)
                      setSaveOk(null)
                      reset(formValues)
                    }}
                  >
                    Cancel
                  </Button>
                </HStack>
              ) : null}
            </Stack>
          </Box>
        </form>

        <Box
          p={{ base: 5, md: 6 }}
          bg="cardBg"
          borderWidth="1px"
          borderColor="cardBorder"
          borderRadius="xl"
        >
          <Stack gap={5}>
            <Stack gap={1}>
              <Heading size="md">On this device only</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Bio, location label, and the preview photo above are stored
                locally in your browser—they are not sent to Slashie yet. Use
                them as personal notes while we expand profile sync.
              </Text>
            </Stack>

            {localSaveOk || localSaveError ? (
              <Stack gap={1}>
                {localSaveError ? (
                  <Text color="red.500" fontSize="sm">
                    {localSaveError}
                  </Text>
                ) : null}
                {localSaveOk ? (
                  <Text color="green.700" fontSize="sm">
                    {localSaveOk}
                  </Text>
                ) : null}
              </Stack>
            ) : null}

            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              }}
              gap={3}
            >
              <InfoRow
                label="Location (local)"
                value={location.trim() || '—'}
                expanded={
                  editingSection === 'all' || editingSection === 'location'
                }
                onActivate={() => {
                  setEditingSection('location')
                  setLocalSaveError(null)
                }}
              >
                <FormField label="City or area">
                  <Input
                    value={location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLocation(e.target.value)
                    }
                    placeholder="City or region"
                    aria-label="Local location note"
                  />
                </FormField>
              </InfoRow>
            </Grid>

            <InfoRow
              label="Bio (local)"
              value={bio.trim() || 'Add a short note'}
              expanded={editingSection === 'all' || editingSection === 'bio'}
              onActivate={() => {
                setEditingSection('bio')
                setLocalSaveError(null)
              }}
              fullWidth
            >
              <FormField label="Bio">
                <Textarea
                  minH="120px"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Notes for yourself—workers don’t see this from the server yet."
                  bg="neutral.100"
                  borderColor="cardBorder"
                  borderRadius="lg"
                />
              </FormField>
            </InfoRow>

            <Button
              type="button"
              variant="secondary"
              alignSelf="flex-start"
              onClick={() => saveLocalExtrasOnly()}
            >
              Save local notes
            </Button>
          </Stack>
        </Box>

        <Stack gap={4}>
          <Heading size="md">Account security</Heading>
          <Box
            p={0}
            overflow="hidden"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="cardBorder"
          >
            <SecurityRow
              icon={<IconEnvelope />}
              title="Email address"
              status={<ConnectedBadge />}
              action={
                <Link
                  as={NextLink}
                  href={forgotHref}
                  fontWeight={700}
                  color="primary.600"
                >
                  Change
                </Link>
              }
            />
          </Box>

          <Box
            p={4}
            bg="cardBg"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="cardBorder"
          >
            <Link
              as={NextLink}
              href={forgotHref}
              _hover={{ textDecoration: 'none' }}
              display="block"
            >
              <Button
                as="span"
                variant="secondary"
                width="full"
                justifyContent="center"
                gap={2}
              >
                <IconLockOutline />
                Change password
              </Button>
            </Link>
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
            bg="primary.600"
            color="white"
            position="relative"
            overflow="hidden"
            borderRadius="xl"
          >
            <Stack gap={1} position="relative" zIndex={1}>
              <Text
                fontSize="xs"
                fontWeight={800}
                letterSpacing="0.08em"
                opacity={0.9}
              >
                Tasks posted
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
          <Box
            p={6}
            bg="neutral.100"
            position="relative"
            overflow="hidden"
            borderRadius="xl"
          >
            <Stack gap={1} position="relative" zIndex={1}>
              <Text
                fontSize="xs"
                fontWeight={800}
                letterSpacing="0.08em"
                color="formLabelMuted"
              >
                Total spent
              </Text>
              <Text fontSize="3xl" fontWeight={800} color="primary.800">
                {tasksLoading ? '…' : formatPounds(totalSpendPence)}
              </Text>
              <Text fontSize="xs" color="formLabelMuted">
                From completed tasks you posted (payments are arranged outside
                Slashie).
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
            _hover={{ textDecoration: 'none' }}
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
              borderRadius="xl"
              _hover={{ boxShadow: 'md' }}
            >
              <Heading size="md" color="primary.900">
                My requests
              </Heading>
              <Text color="formLabelMuted" mt={2} maxW="sm">
                Track quotes and status on tasks you posted.
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
            _hover={{ textDecoration: 'none' }}
            color="inherit"
          >
            <Box
              p={6}
              bg="cardBg"
              borderColor="cardBorder"
              borderWidth="1px"
              position="relative"
              overflow="hidden"
              display="block"
              borderRadius="xl"
              _hover={{ boxShadow: 'md' }}
            >
              <Heading size="md" color="cardFg">
                Worker dashboard
              </Heading>
              <Text color="cardFg" opacity={0.9} mt={2} maxW="sm">
                Send quotes and manage work you offer on the marketplace.
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
            Sign out
          </Button>
        </HStack>
      </Stack>
    )

  return (
    <Box as="section" py={{ base: 6, md: 10 }}>
      <Container maxW="container.lg">{inner}</Container>
    </Box>
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
      bg="neutral.100"
      borderWidth="1px"
      borderColor="cardBorder"
      borderRadius="lg"
    >
      {!expanded ? (
        <Box asChild w="full">
          <button
            type="button"
            onClick={onActivate}
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              font: 'inherit',
              color: 'inherit',
            }}
          >
            <HStack justify="space-between" align="flex-start" gap={3}>
              <Stack gap={1} align="flex-start" minW={0}>
                <Text
                  fontSize="xs"
                  fontWeight={800}
                  letterSpacing="0.06em"
                  color="formLabelMuted"
                >
                  {label}
                </Text>
                <Text fontWeight={600} color="cardFg" wordBreak="break-word">
                  {value}
                </Text>
              </Stack>
              <ChevronRight />
            </HStack>
          </button>
        </Box>
      ) : (
        <Stack gap={3} align="stretch">
          <HStack justify="space-between">
            <Text
              fontSize="xs"
              fontWeight={800}
              letterSpacing="0.06em"
              color="formLabelMuted"
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
      <HStack gap={3} align="center" minW={0}>
        {icon}
        <Text fontWeight={700}>{title}</Text>
        {status}
      </HStack>
      <Box flexShrink={0}>{action}</Box>
    </HStack>
  )
}
