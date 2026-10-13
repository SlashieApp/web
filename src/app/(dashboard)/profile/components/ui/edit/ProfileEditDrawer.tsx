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
import { ContactMethodsPanel } from '@/app/(dashboard)/components/ui/ContactMethodsPanel'
import UpdateMyProfile from '@/app/(dashboard)/profile/graphql/UpdateMyProfile.gql'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, Drawer, FormField, Input } from '@ui'

import bag from '../../../i11n.json'
import { initialDisplayNameForForm } from '../../../profileDisplayHelpers'
import {
  type ProfileApiFormValues,
  dateInputValueFromIso,
  profileApiFormSchema,
  profileFormToMutationInput,
} from '../../../profileFormSchema'
import { ProfilePhotoCard } from './ProfilePhotoCard'
import { ProfileWorkerForm } from './ProfileWorkerForm'

export type ProfileEditSection =
  | 'photo'
  | 'personal'
  | 'contact'
  | 'worker'
  | null

export function ProfileEditDrawer({
  section,
  onOpenChange,
}: {
  section: ProfileEditSection
  onOpenChange: (section: ProfileEditSection) => void
}) {
  const t = useI11n(bag).editor
  const open = section !== null
  const meta = {
    photo: { title: t.photoTitle, description: t.photoDescription },
    personal: { title: t.personalTitle, description: t.personalDescription },
    contact: { title: t.contactTitle, description: t.contactDescription },
    worker: { title: t.workerTitle, description: t.workerDescription },
  }[section ?? 'personal']

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
  const t = useI11n(bag).editor
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
      trackFlowSucceeded(EVENTS.profile_update_success, {
        section: 'personal',
      })
      showAppToast({ title: t.saved })
      onSaved()
    } catch (error) {
      trackFlowFailed(EVENTS.profile_update_fail, error, {
        flow: 'profile_update',
        action: 'updateMyProfile',
        operation: 'UpdateMyProfile',
        route: '/profile',
        extra: { section: 'personal' },
      })
      showAppToast({
        title: t.saveFailed,
        description: getFriendlyErrorMessage(error, t.tryAgain),
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
          label={t.displayName}
          helperText={t.displayNameHelp}
          errorText={errors.displayName?.message}
        >
          <Input {...register('displayName')} autoComplete="name" />
        </FormField>
        <FormField
          label={t.dateOfBirth}
          helperText={t.dateOfBirthHelp}
          errorText={errors.dateOfBirth?.message}
        >
          <Input
            {...register('dateOfBirth')}
            type="date"
            autoComplete="bday"
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
            {t.cancel}
          </Button>
          <Button
            type="submit"
            loading={loading || isSubmitting}
            disabled={!isDirty}
          >
            {t.save}
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
