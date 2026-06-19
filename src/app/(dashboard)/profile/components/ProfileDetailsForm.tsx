'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import {
  TaskContactMethod,
  type UpdateMyProfileMutation,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMyProfile from '@/app/(dashboard)/profile/graphql/UpdateMyProfile.gql'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, Card, FormField, Input, Select } from '@ui'

import { initialDisplayNameForForm } from '../profileDisplayHelpers'
import { getContactOptions } from '../profileEligibility'
import {
  type ProfileApiFormValues,
  dateInputValueFromIso,
  profileApiFormSchema,
  profileFormToMutationInput,
} from '../profileFormSchema'

const TODAY = new Date().toISOString().slice(0, 10)

export function ProfileDetailsForm() {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)

  const formValues = useMemo<ProfileApiFormValues>(() => {
    if (!me) {
      return {
        displayName: '',
        dateOfBirth: '',
        defaultPreferredContactMethod: TaskContactMethod.InApp,
      }
    }
    return {
      displayName: initialDisplayNameForForm(me),
      dateOfBirth: dateInputValueFromIso(me.profile?.dateOfBirth),
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
    useMutation<UpdateMyProfileMutation>(UpdateMyProfile)

  const contactOptions = useMemo(() => (me ? getContactOptions(me) : []), [me])
  const hasUnverifiedContact = contactOptions.some((option) => !option.enabled)

  if (!me) return null

  const onSubmit = async (values: ProfileApiFormValues) => {
    try {
      const result = await updateMyProfile({
        variables: { input: profileFormToMutationInput(values) },
      })
      const updated = result.data?.updateMyProfile
      if (updated?.profile && me.profile) {
        patchMe({
          profile: { ...me.profile, ...updated.profile },
          workerEligibility: updated.workerEligibility,
        })
      }
      trackFlowSucceeded(EVENTS.profile_update_success)
      reset(values)
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.profile_update_fail, error, {
        flow: 'profile_update',
        action: 'updateMyProfile',
        operation: 'UpdateMyProfile',
        route: '/profile',
      })
    }
  }

  const errorMessage = mutationError
    ? getFriendlyErrorMessage(mutationError, 'Could not save your profile.')
    : null

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event)
      }}
      noValidate
    >
      <Stack gap={6}>
        {errorMessage ? (
          <Text color="red.500" fontSize="sm">
            {errorMessage}
          </Text>
        ) : null}

        <Card layout="section" p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <Stack gap={1}>
              <Heading size="md">Name</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Your display name is shown publicly on your profile, tasks, and
                quotes.
              </Text>
            </Stack>
            <FormField
              label="Display name"
              errorText={errors.displayName?.message}
            >
              <Input
                {...register('displayName')}
                placeholder="How you want to appear"
              />
            </FormField>
          </Stack>
        </Card>

        <Card layout="section" id="profile-about" p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <Stack gap={1}>
              <Heading size="md">Private details</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Used to confirm you meet the minimum age to work. Not shown
                publicly.
              </Text>
            </Stack>
            <FormField
              label="Date of birth"
              errorText={errors.dateOfBirth?.message}
            >
              <Input
                {...register('dateOfBirth')}
                type="date"
                max={TODAY}
                rootProps={{ maxW: '260px' }}
              />
            </FormField>
          </Stack>
        </Card>

        <Card layout="section" p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <Stack gap={1}>
              <Heading size="md">Default contact preference</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Pre-fills how you&apos;re contacted on new tasks. Only verified
                methods can be selected.
              </Text>
            </Stack>
            <FormField label="Default contact method">
              <Controller
                control={control}
                name="defaultPreferredContactMethod"
                render={({ field }) => (
                  <Select
                    {...field}
                    aria-label="Default contact method"
                    rootProps={{ maxW: '320px' }}
                  >
                    {contactOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={!option.enabled}
                      >
                        {option.label}
                        {option.enabled ? '' : ' — not verified'}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </FormField>
            {hasUnverifiedContact ? (
              <Stack gap={2}>
                <Text fontSize="sm" color="formLabelMuted">
                  Email and phone unlock once verified.
                </Text>
                <Link
                  as={NextLink}
                  href="/account"
                  alignSelf="flex-start"
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button size="sm" variant="ghost">
                    Add or verify in Account
                  </Button>
                </Link>
              </Stack>
            ) : null}
          </Stack>
        </Card>

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
  )
}
