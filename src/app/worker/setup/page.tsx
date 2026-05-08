'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  Link,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import type { RegisterAsProMutation } from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUserStore } from '@/app/(auth)/store/user'
import { ME_QUERY } from '@/graphql/auth'
import { REGISTER_AS_PRO_MUTATION } from '@/graphql/users'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, FormField, Header, Input, SectionCard } from '@ui'

const workerSetupSchema = z.object({
  firstName: z.string().trim().min(1, 'Please enter your first name.'),
  lastName: z.string().trim().min(1, 'Please enter your last name.'),
  tagline: z.string().trim().max(140).optional().or(z.literal('')),
  bio: z.string().trim().max(800).optional().or(z.literal('')),
  yearsExperience: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0),
      'Years of experience must be 0 or greater.',
    ),
  locationName: z.string().trim().min(1, 'Please add a service area.'),
})

type WorkerSetupValues = z.infer<typeof workerSetupSchema>

export default function WorkerSetupPage() {
  const router = useRouter()
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const getUser = useUserStore((s) => s.getUser)
  const [hydrated, setHydrated] = useState(false)
  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hydrated) return
      setHydrated(true)
      if (getAuthToken()) void getUser()
    },
    [getUser, hydrated],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkerSetupValues>({
    resolver: zodResolver(workerSetupSchema),
    defaultValues: {
      firstName: me?.firstName ?? '',
      lastName: me?.lastName ?? '',
      tagline: me?.worker?.tagline ?? '',
      bio: me?.worker?.bio ?? '',
      yearsExperience:
        typeof me?.worker?.yearsExperience === 'number'
          ? String(me.worker.yearsExperience)
          : '',
      locationName: me?.worker?.locationAddress ?? '',
    },
  })

  const [registerAsPro, { loading, error }] =
    useMutation<RegisterAsProMutation>(REGISTER_AS_PRO_MUTATION, {
      refetchQueries: [{ query: ME_QUERY }],
      awaitRefetchQueries: true,
    })

  const errorMessage = error
    ? getFriendlyErrorMessage(error, 'Could not save worker profile.')
    : null

  const onSubmit = async (values: WorkerSetupValues) => {
    const yearsExperienceInt =
      values.yearsExperience.trim() === ''
        ? undefined
        : Number.parseInt(values.yearsExperience, 10)
    const result = await registerAsPro({
      variables: {
        input: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          bio: values.bio?.trim() || undefined,
          tagline: values.tagline?.trim() || undefined,
          yearsExperience: yearsExperienceInt,
          location: {
            address: values.locationName.trim(),
            name: values.locationName.trim(),
            lat: null,
            lng: null,
          },
        },
      },
    })
    const w = result.data?.registerAsPro
    if (w && me) {
      patchMe({
        worker: {
          id: w.id,
          bio: w.bio ?? null,
          tagline: w.tagline ?? null,
          yearsExperience: w.yearsExperience ?? null,
          isVerified: w.isVerified,
          tasksCompletedCount: w.tasksCompletedCount ?? null,
          locationAddress: w.locationAddress ?? null,
        },
      })
    }
    router.push('/profile')
  }

  return (
    <Box ref={onMount} minH="100dvh" bg="neutral.100" color="cardFg">
      <Header />
      <Container maxW="container.md" py={{ base: 6, md: 10 }} px={4}>
        <Stack gap={6}>
          <Stack gap={2}>
            <Heading size="xl">
              {me?.worker?.id ? 'Edit worker profile' : 'Become a worker'}
            </Heading>
            <Text color="formLabelMuted">
              Workers can quote on tasks and grow their service business on
              Slashie. Updating these fields lets posters know who you are.
            </Text>
          </Stack>

          <SectionCard p={{ base: 5, md: 6 }}>
            <form
              onSubmit={(event) => {
                void handleSubmit(onSubmit)(event)
              }}
              noValidate
            >
              <Stack gap={5}>
                {errorMessage ? (
                  <Text color="red.500" fontSize="sm">
                    {errorMessage}
                  </Text>
                ) : null}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }}
                  gap={4}
                >
                  <FormField
                    label="First name"
                    errorText={errors.firstName?.message}
                  >
                    <Input {...register('firstName')} />
                  </FormField>
                  <FormField
                    label="Last name"
                    errorText={errors.lastName?.message}
                  >
                    <Input {...register('lastName')} />
                  </FormField>
                </Grid>

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

                <FormField
                  label="Bio"
                  helperText="Tell posters about your skills and approach."
                  errorText={errors.bio?.message}
                >
                  <Textarea
                    {...register('bio')}
                    minH="120px"
                    bg="neutral.100"
                    borderColor="cardBorder"
                    borderRadius="lg"
                  />
                </FormField>

                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }}
                  gap={4}
                >
                  <FormField
                    label="Years of experience"
                    errorText={errors.yearsExperience?.message}
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
                  >
                    <Input {...register('locationName')} placeholder="London" />
                  </FormField>
                </Grid>

                <HStack gap={3} justify="flex-end">
                  <Link
                    as={NextLink}
                    href="/profile"
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Button type="button" variant="ghost">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading || isSubmitting}
                  >
                    {me?.worker?.id ? 'Save changes' : 'Register as worker'}
                  </Button>
                </HStack>
              </Stack>
            </form>
          </SectionCard>
        </Stack>
      </Container>
    </Box>
  )
}
