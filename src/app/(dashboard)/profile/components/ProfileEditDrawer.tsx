'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack } from '@chakra-ui/react'
import {
  TaskContactMethod,
  type UpdateMyProfileMutation,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { useUserStore } from '@/app/(auth)/store/user'
import { ContactMethodsPanel } from '@/app/(dashboard)/components/ContactMethodsPanel'
import UpdateMyProfile from '@/app/(dashboard)/profile/graphql/UpdateMyProfile.gql'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, Drawer, FormField, Input } from '@ui'

import { initialDisplayNameForForm } from '../profileDisplayHelpers'
import {
  type ProfileApiFormValues,
  dateInputValueFromIso,
  profileApiFormSchema,
  profileFormToMutationInput,
} from '../profileFormSchema'
import { ProfilePhotoCard } from './ProfilePhotoCard'
import { ProfileWorkerForm } from './ProfileWorkerForm'

export type ProfileEditSection =
  | 'photo'
  | 'personal'
  | 'contact'
  | 'worker'
  | null

const drawerMeta: Record<
  Exclude<ProfileEditSection, null>,
  { title: string; description: string }
> = {
  photo: {
    title: 'Edit profile photo',
    description: 'Upload a clear photo that represents you.',
  },
  personal: {
    title: 'Edit personal information',
    description: 'Update your display name and private date of birth.',
  },
  contact: {
    title: 'Contact & verification',
    description: 'Manage private contact channels and their verification.',
  },
  worker: {
    title: 'Edit worker profile',
    description: 'Update the professional details customers see.',
  },
}

export function ProfileEditDrawer({
  section,
  onOpenChange,
}: {
  section: ProfileEditSection
  onOpenChange: (section: ProfileEditSection) => void
}) {
  const open = section !== null
  const meta = section ? drawerMeta[section] : drawerMeta.personal

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(null)
      }}
      title={meta.title}
      description={meta.description}
      placement="end"
      size="lg"
      contentProps={{
        w: { base: '100vw', md: 'min(640px, 100vw)' },
        maxW: { base: '100vw', md: '640px' },
        borderLeftRadius: { base: 0, md: 'lg' },
        borderRightRadius: 0,
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {section === 'photo' ? (
        <ProfilePhotoCard onSaved={() => onOpenChange(null)} />
      ) : null}
      {section === 'personal' ? (
        <PersonalInfoEditor
          onCancel={() => onOpenChange(null)}
          onSaved={() => onOpenChange(null)}
        />
      ) : null}
      {section === 'contact' ? <ContactMethodsPanel showIntro={false} /> : null}
      {section === 'worker' ? (
        <ProfileWorkerForm
          embedded
          onCancel={() => onOpenChange(null)}
          onSaved={() => onOpenChange(null)}
        />
      ) : null}
    </Drawer>
  )
}

function PersonalInfoEditor({
  onCancel,
  onSaved,
}: {
  onCancel: () => void
  onSaved: () => void
}) {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)

  const values = useMemo<ProfileApiFormValues>(
    () => ({
      displayName: me ? initialDisplayNameForForm(me) : '',
      dateOfBirth: dateInputValueFromIso(me?.profile?.dateOfBirth),
      defaultPreferredContactMethod:
        me?.profile?.defaultPreferredContactMethod ?? TaskContactMethod.InApp,
    }),
    [me],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileApiFormValues>({
    resolver: zodResolver(profileApiFormSchema),
    values,
  })
  const [updateMyProfile, { loading }] =
    useMutation<UpdateMyProfileMutation>(UpdateMyProfile)

  if (!me) return null

  const onSubmit = async (next: ProfileApiFormValues) => {
    try {
      const result = await updateMyProfile({
        variables: { input: profileFormToMutationInput(next) },
      })
      const updated = result.data?.updateMyProfile
      if (updated?.profile && me.profile) {
        patchMe({
          profile: { ...me.profile, ...updated.profile },
          workerEligibility: updated.workerEligibility,
        })
      }
      reset(next)
      showAppToast({ title: 'Personal information saved' })
      onSaved()
    } catch (error) {
      showAppToast({
        title: 'Could not save your profile',
        description: getFriendlyErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event)
      }}
      noValidate
    >
      <Stack gap={5}>
        <FormField
          label="Display name"
          helperText="Shown publicly on your profile, tasks, and quotes."
          errorText={errors.displayName?.message}
        >
          <Input {...register('displayName')} />
        </FormField>
        <FormField
          label="Date of birth"
          helperText="Private. Used only for age and eligibility checks."
          errorText={errors.dateOfBirth?.message}
        >
          <Input
            {...register('dateOfBirth')}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
          />
        </FormField>
        <HStack
          gap={3}
          justify="flex-end"
          position="sticky"
          bottom={0}
          bg="bg.surface"
          py={3}
          mt="auto"
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset(values)
              onCancel()
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading || isSubmitting}
            disabled={!isDirty}
          >
            Save
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
