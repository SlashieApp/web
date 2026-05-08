'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  Grid,
  HStack,
  Heading,
  Link,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  TaskContactMethod,
  type UpdateMyProfileMutation,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useUserStore } from '@/app/(auth)/store/user'
import { ME_QUERY } from '@/graphql/auth'
import { UPDATE_MY_PROFILE_MUTATION } from '@/graphql/users'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Badge, Button, FormField, Input, SectionCard } from '@ui'

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

function ProfileForm() {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)

  const formValues = useMemo<ProfileApiFormValues>(() => {
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
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileApiFormValues>({
    resolver: zodResolver(profileApiFormSchema),
    values: formValues,
  })

  const [updateMyProfile, { loading: saving, error: mutationError }] =
    useMutation<UpdateMyProfileMutation>(UPDATE_MY_PROFILE_MUTATION, {
      refetchQueries: [{ query: ME_QUERY }],
      awaitRefetchQueries: true,
    })

  if (!me) return null

  const onSubmit = async (values: ProfileApiFormValues) => {
    try {
      const result = await updateMyProfile({
        variables: { input: profileFormToMutationInput(values) },
      })
      const updated = result.data?.updateMyProfile?.profile
      if (updated && me.profile) {
        patchMe({
          profile: {
            ...me.profile,
            name: updated.name ?? me.profile.name,
            contactNumber:
              updated.contactNumber ?? me.profile.contactNumber ?? null,
            defaultPreferredContactMethod:
              updated.defaultPreferredContactMethod ??
              me.profile.defaultPreferredContactMethod ??
              null,
          },
        })
      }
      reset(values)
    } catch {
      // Surfaced via mutationError below
    }
  }

  const errorMessage = mutationError
    ? getFriendlyErrorMessage(mutationError, 'Could not save your profile.')
    : null

  return (
    <SectionCard p={{ base: 5, md: 6 }}>
      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event)
        }}
        noValidate
      >
        <Stack gap={5}>
          <Stack gap={1}>
            <Heading size="md">Profile on Slashie</Heading>
            <Text fontSize="sm" color="formLabelMuted">
              These fields are saved to your account and shared with workers and
              posters as appropriate.
            </Text>
          </Stack>

          {errorMessage ? (
            <Text color="red.500" fontSize="sm">
              {errorMessage}
            </Text>
          ) : null}

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={4}>
            <FormField
              label="Display name"
              errorText={errors.displayName?.message}
            >
              <Input
                {...register('displayName')}
                placeholder="How you want to appear"
              />
            </FormField>
            <FormField
              label="Phone"
              helperText="Optional. Shared only when you allow contact by phone."
              errorText={errors.contactNumber?.message}
            >
              <Input
                {...register('contactNumber')}
                placeholder="+44 7000 000000"
                inputMode="tel"
              />
            </FormField>
          </Grid>

          <FormField
            label="Default contact when posting a task"
            helperText="Used as the prefill on new task posts. Override per task as needed."
          >
            <Controller
              control={control}
              name="defaultPreferredContactMethod"
              render={({ field }) => (
                <NativeSelect.Root w="full" maxW="320px">
                  <NativeSelect.Field
                    {...field}
                    aria-label="Default contact method"
                  >
                    <option value={TaskContactMethod.InApp}>In-app chat</option>
                    <option value={TaskContactMethod.Phone}>Phone</option>
                    <option value={TaskContactMethod.Email}>Email</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              )}
            />
          </FormField>

          <HStack gap={3} justify="flex-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => reset(formValues)}
              disabled={!isDirty || saving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving || isSubmitting}
              disabled={!isDirty}
            >
              Save profile
            </Button>
          </HStack>
        </Stack>
      </form>
    </SectionCard>
  )
}

function WorkerSetupCard() {
  const me = useUserStore((s) => s.me)
  if (!me) return null
  const worker = me.worker
  const isActive = Boolean(worker?.id)

  return (
    <SectionCard p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <HStack justify="space-between" gap={3} flexWrap="wrap">
          <Stack gap={1}>
            <Heading size="md">Worker profile</Heading>
            <Text fontSize="sm" color="formLabelMuted">
              {isActive
                ? 'Your worker profile is live. Keep it sharp to win more work.'
                : 'Set up a worker profile to start sending quotes on tasks.'}
            </Text>
          </Stack>
          <Badge
            bg={isActive ? 'primary.100' : 'badgeBg'}
            color={isActive ? 'primary.800' : 'cardFg'}
          >
            {isActive ? 'Active' : 'Not set up'}
          </Badge>
        </HStack>
        {isActive && worker ? (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={3}>
            <Stack gap={0}>
              <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                Tagline
              </Text>
              <Text fontSize="sm">{worker.tagline?.trim() || '—'}</Text>
            </Stack>
            <Stack gap={0}>
              <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                Years experience
              </Text>
              <Text fontSize="sm">
                {typeof worker.yearsExperience === 'number'
                  ? `${worker.yearsExperience}+`
                  : '—'}
              </Text>
            </Stack>
            <Stack gap={0}>
              <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                Service area
              </Text>
              <Text fontSize="sm">{worker.locationAddress?.trim() || '—'}</Text>
            </Stack>
            <Stack gap={0}>
              <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                Verified
              </Text>
              <Text fontSize="sm">{worker.isVerified ? 'Yes' : 'Pending'}</Text>
            </Stack>
          </Grid>
        ) : null}
        <HStack gap={3}>
          <Link
            as={NextLink}
            href="/worker/setup"
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm" variant={isActive ? 'secondary' : 'primary'}>
              {isActive ? 'Edit worker profile' : 'Become a worker'}
            </Button>
          </Link>
        </HStack>
      </Stack>
    </SectionCard>
  )
}

export default function ProfilePage() {
  const me = useUserStore((s) => s.me)
  if (!me) return null

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <HStack gap={3} align="flex-start" flexWrap="wrap">
          <Box
            w={{ base: 16, md: 20 }}
            h={{ base: 16, md: 20 }}
            borderRadius="full"
            bg="primary.100"
            color="primary.800"
            display="grid"
            placeItems="center"
            fontWeight={800}
            fontSize="xl"
            overflow="hidden"
            flexShrink={0}
          >
            {me.profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.profile.avatarUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              displayNameFromMe(me).charAt(0).toUpperCase() || '?'
            )}
          </Box>
          <Stack gap={1} flex="1" minW={0}>
            <Heading size="xl">{displayNameFromMe(me)}</Heading>
            <Text color="formLabelMuted">{me.email}</Text>
            {joinMonthYear(me.createdAt) ? (
              <Text fontSize="sm" color="formLabelMuted">
                Joined {joinMonthYear(me.createdAt)}
              </Text>
            ) : null}
          </Stack>
        </HStack>
      </Stack>

      <ProfileForm />
      <WorkerSetupCard />
    </Stack>
  )
}
