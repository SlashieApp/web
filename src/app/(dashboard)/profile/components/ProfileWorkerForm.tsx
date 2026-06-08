'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { RegisterAsProMutation } from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { hasVerifiedContactMethod } from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import { PhoneVerificationBlock } from '@/app/(dashboard)/components/PhoneVerificationBlock'
import RegisterAsPro from '@/app/(dashboard)/profile/graphql/RegisterAsPro.gql'
import Me from '@/graphql/Me.gql'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, FormField, Input, SectionCard, Textarea } from '@ui'

import {
  type WorkerFormValues,
  workerFormSchema,
  workerFormToMutationInput,
  workerFormValuesFromMe,
} from '../workerFormSchema'

export function ProfileWorkerForm() {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const getUser = useUserStore((s) => s.getUser)
  const isWorker = Boolean(me?.worker?.id)

  const formValues = useMemo(
    () => (me ? workerFormValuesFromMe(me) : null),
    [me],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<WorkerFormValues>({
    resolver: zodResolver(workerFormSchema),
    values: formValues ?? undefined,
  })

  const [registerAsPro, { loading: saving, error: mutationError }] =
    useMutation<RegisterAsProMutation>(RegisterAsPro, {
      refetchQueries: [{ query: Me }],
      awaitRefetchQueries: true,
    })

  if (!me || !formValues) return null

  const onSubmit = async (values: WorkerFormValues) => {
    try {
      const result = await registerAsPro({
        variables: { input: workerFormToMutationInput(values) },
      })
      const w = result.data?.registerAsPro
      if (w) {
        const displayName = w.profile?.name?.trim() ?? null
        patchMe({
          profile: me.profile
            ? { ...me.profile, name: displayName ?? me.profile.name }
            : me.profile,
          worker: {
            id: w.id,
            legalName: w.legalName ?? null,
            bio: w.bio ?? null,
            tagline: w.tagline ?? null,
            yearsExperience: w.yearsExperience ?? null,
            isVerified: w.isVerified,
            tasksCompletedCount: w.tasksCompletedCount ?? null,
            locationAddress: w.locationAddress ?? null,
          },
        })
      }
      trackFlowSucceeded(EVENTS.worker_setup_success, {
        is_new_worker: !isWorker,
      })
      reset(values)
      await getUser()
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.worker_setup_fail, error, {
        flow: 'worker_setup',
        action: 'registerAsPro',
        operation: 'RegisterAsPro',
        route: '/profile',
        extra: { is_new_worker: !isWorker },
      })
    }
  }

  const errorMessage = mutationError
    ? getFriendlyErrorMessage(mutationError, 'Could not save worker profile.')
    : null

  return (
    <form
      id="profile-worker"
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

        <SectionCard p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <Stack gap={1}>
              <Heading size="md">
                {isWorker ? 'Worker profile' : 'Become a worker'}
              </Heading>
              <Text fontSize="sm" color="formLabelMuted">
                {isWorker
                  ? 'Update the details customers see when you quote on tasks.'
                  : 'Complete these details to register as a worker and send quotes on tasks.'}
              </Text>
            </Stack>

            <FormField
              label="Legal name"
              helperText="Your full legal name. This sets your public display name on Slashie."
              errorText={errors.legalName?.message}
            >
              <Input {...register('legalName')} placeholder="Alex Johnson" />
            </FormField>

            <FormField
              label="Tagline"
              helperText="One-line headline shown on your worker card."
              errorText={errors.tagline?.message}
            >
              <Input
                {...register('tagline')}
                placeholder="Reliable repairs, clean finishes."
              />
            </FormField>

            <FormField label="Bio" errorText={errors.bio?.message}>
              <Textarea
                {...register('bio')}
                placeholder="Tell posters about your skills, experience, and approach."
                rows={4}
              />
            </FormField>

            <HStack gap={4} flexWrap="wrap" align="flex-start">
              <FormField
                label="Years of experience"
                errorText={errors.yearsExperience?.message}
                flex="1"
                minW={{ base: 'full', md: '200px' }}
              >
                <Input
                  {...register('yearsExperience')}
                  inputMode="numeric"
                  placeholder="3"
                />
              </FormField>
              <FormField
                label="Service area"
                helperText="City or postcode that matches your usual jobs."
                errorText={errors.locationName?.message}
                flex="1"
                minW={{ base: 'full', md: '240px' }}
              >
                <Input {...register('locationName')} placeholder="London" />
              </FormField>
            </HStack>
          </Stack>
        </SectionCard>

        {!hasVerifiedContactMethod(me) ? (
          <SectionCard p={{ base: 5, md: 6 }}>
            <Stack gap={3}>
              <Stack gap={1}>
                <Heading size="md">Verified contact required</Heading>
                <Text fontSize="sm" color="formLabelMuted">
                  Verify your email or phone before registering as a worker.
                  Save your phone on Profile first, then verify it here.
                </Text>
              </Stack>
              <PhoneVerificationBlock compact />
            </Stack>
          </SectionCard>
        ) : null}

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
            {isWorker ? 'Save worker profile' : 'Register as worker'}
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
