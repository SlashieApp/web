'use client'

import { HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useUserStore } from '@/app/(auth)/store/user'
import { isWorkerSetupComplete } from '@/app/(worker)/worker/setup/helpers/workerSetupEligibility'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { apolloClient } from '@/utils/apolloClient'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, FormField, Input, SectionCard, Textarea } from '@ui'

import { saveWorkerProfileForm } from '../helpers/saveWorkerProfileForm'
import { isWorkerSetupInProgress } from '../helpers/workerSetupProfileHelpers'
import {
  type WorkerFormValues,
  workerFormSchema,
  workerFormValuesFromMe,
} from '../workerFormSchema'

export function ProfileWorkerForm() {
  const me = useUserStore((s) => s.me)
  const setMe = useUserStore((s) => s.setMe)
  const getUser = useUserStore((s) => s.getUser)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formValues = useMemo(
    () => (me ? workerFormValuesFromMe(me) : null),
    [me],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<WorkerFormValues>({
    resolver: zodResolver(workerFormSchema),
    values: formValues ?? undefined,
  })

  if (!me || !formValues) return null

  const setupComplete = isWorkerSetupComplete(me)
  const setupInProgress = isWorkerSetupInProgress(me)

  if (!me.worker?.id) {
    return (
      <SectionCard id="profile-worker" p={{ base: 5, md: 6 }}>
        <Stack gap={4}>
          <Stack gap={1}>
            <Heading size="md">Become a worker</Heading>
            <Text fontSize="sm" color="formLabelMuted">
              Set up your worker profile to send quotes. Customers pay you
              directly for completed work.
            </Text>
          </Stack>
          <Link
            as={NextLink}
            href={workerSetupHref('/profile')}
            _hover={{ textDecoration: 'none' }}
          >
            <Button w={{ base: 'full', sm: 'auto' }}>Start worker setup</Button>
          </Link>
        </Stack>
      </SectionCard>
    )
  }

  if (setupInProgress) {
    return (
      <SectionCard id="profile-worker" p={{ base: 5, md: 6 }}>
        <Stack gap={3}>
          <Heading size="md">Worker profile (in progress)</Heading>
          <Text fontSize="sm" color="formLabelMuted">
            Finish setup to edit your full worker profile here. What you have
            saved so far:
          </Text>
          <WorkerProfileSummary values={formValues} />
          <Link
            as={NextLink}
            href={workerSetupHref('/profile')}
            _hover={{ textDecoration: 'none' }}
          >
            <Button
              size="sm"
              variant="primary"
              w={{ base: 'full', sm: 'auto' }}
            >
              Continue setup
            </Button>
          </Link>
        </Stack>
      </SectionCard>
    )
  }

  if (!setupComplete) {
    return null
  }

  const onSubmit = async (values: WorkerFormValues) => {
    setSubmitError(null)
    setSaving(true)
    try {
      await saveWorkerProfileForm(apolloClient, values, me, setMe)
      reset(values)
      await getUser()
    } catch (error: unknown) {
      setSubmitError(
        getFriendlyErrorMessage(error, 'Could not save worker profile.'),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      id="profile-worker"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event)
      }}
      noValidate
    >
      <Stack gap={6}>
        {submitError ? (
          <Text color="red.500" fontSize="sm">
            {submitError}
          </Text>
        ) : null}

        <SectionCard p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <Stack gap={1}>
              <Heading size="md">Worker profile</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Update the details customers see when you quote on tasks.
              </Text>
            </Stack>

            <FormField
              label="Legal name"
              helperText="Your full legal name on your public worker profile."
              errorText={errors.legalName?.message}
            >
              <Input
                {...register('legalName')}
                placeholder="Alex Johnson"
                minH="44px"
              />
            </FormField>

            <FormField
              label="Tagline"
              helperText="One-line headline shown on your worker card."
              errorText={errors.tagline?.message}
            >
              <Input
                {...register('tagline')}
                placeholder="Reliable repairs, clean finishes."
                minH="44px"
              />
            </FormField>

            <FormField label="Bio" errorText={errors.bio?.message}>
              <Textarea
                {...register('bio')}
                placeholder="Tell customers about your skills and experience."
                rows={4}
                maxLength={300}
              />
            </FormField>

            <FormField
              label="Skills & services"
              helperText="Separate skills with commas or new lines."
              errorText={errors.skillsText?.message}
            >
              <Textarea
                {...register('skillsText')}
                placeholder="e.g. Plumbing, furniture assembly"
                rows={3}
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
                  minH="44px"
                />
              </FormField>
              <FormField
                label="Travel radius (miles)"
                helperText="Optional"
                errorText={errors.travelRadiusMiles?.message}
                flex="1"
                minW={{ base: 'full', md: '200px' }}
              >
                <Input
                  {...register('travelRadiusMiles')}
                  inputMode="decimal"
                  placeholder="10"
                  minH="44px"
                />
              </FormField>
            </HStack>

            <FormField
              label="Service area"
              helperText="City or postcode. Coordinates are refreshed when you save."
              errorText={errors.locationName?.message}
            >
              <Input
                {...register('locationName')}
                onChange={(e) => {
                  setValue('locationName', e.target.value, {
                    shouldDirty: true,
                  })
                  setValue('locationLat', null, { shouldDirty: true })
                  setValue('locationLng', null, { shouldDirty: true })
                }}
                placeholder="London or WD17 2AW"
                minH="44px"
              />
            </FormField>

            <FormField
              label="Portfolio links"
              helperText="Optional — one URL per line."
            >
              <Textarea
                {...register('portfolioText')}
                placeholder="https://example.com/my-work"
                rows={3}
              />
            </FormField>
          </Stack>
        </SectionCard>

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
            Save worker profile
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}

function WorkerProfileSummary({ values }: { values: WorkerFormValues }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Name', value: values.legalName },
    { label: 'Bio', value: values.bio },
    { label: 'Skills', value: values.skillsText },
    { label: 'Experience', value: values.yearsExperience },
    { label: 'Service area', value: values.locationName },
  ].filter((row) => row.value.trim())

  return (
    <Stack gap={2}>
      {rows.map((row) => (
        <Stack key={row.label} gap={0}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="formLabelMuted"
            textTransform="uppercase"
          >
            {row.label}
          </Text>
          <Text fontSize="sm">{row.value}</Text>
        </Stack>
      ))}
    </Stack>
  )
}
