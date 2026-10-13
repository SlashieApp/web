'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import type {
  MeWorkerSetupQuery,
  SaveWorkerSetupStepInput,
  SaveWorkerSetupStepMutation,
} from '@codegen/schema'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import { getSafeNextPath } from '@/app/(auth)/helpers/authRedirect'
import { useUserStore } from '@/app/(auth)/store/user'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { APP_HOME } from '@/utils/appRoutes'
import { showAppToast } from '@/utils/appToast'

import MeWorkerSetup from '../graphql/MeWorkerSetup.gql'
import SaveWorkerSetupStep from '../graphql/SaveWorkerSetupStep.gql'
import { getWorkerSetupErrorMessage } from '../helpers/workerSetupErrors'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
  formStateFromMeWorkerSetup,
} from '../helpers/workerSetupFormState'
import {
  WORKER_SETUP_LOCATION_GEOCODE_ERROR,
  resolveWorkerSetupLocation,
} from '../helpers/workerSetupLocation'
import {
  WORKER_SETUP_FIRST_SUB_STEP,
  type WorkerSetupSubStepId,
  isSubStepUnlocked,
  majorIndexForSubStep,
  previousSubStep,
  progressPercent,
} from '../helpers/workerSetupSteps.config'
import {
  mergeMeWorkerSetupQuery,
  mergeSaveWorkerSetupIntoMe,
} from '../helpers/workerSetupSyncMe'
import {
  buildSavePayload,
  subStepsToSaveOnContinue,
  validateWorkerSetupSubStep,
} from '../helpers/workerSetupValidation'
import bag from '../i11n.json'

export type WorkerSetupContextValue = {
  bootstrap: MeWorkerSetupQuery['me'] | null
  form: WorkerSetupFormState
  activeSubStep: WorkerSetupSubStepId
  completedSubSteps: Set<string>
  isHydrated: boolean
  /** The setup query failed before hydration; the screen offers a retry. */
  loadError: boolean
  retryLoad: () => void
  isSaving: boolean
  fieldErrors: Record<string, string>
  saveError: string | null
  expandedMajor: number | null
  progressPercent: number
  workerEligibility: boolean
  patchForm: (patch: Partial<WorkerSetupFormState>) => void
  clearSetupErrors: () => void
  goToSubStep: (id: WorkerSetupSubStepId) => void
  saveAndContinue: () => Promise<void>
  goBack: () => void
  toggleMajor: (majorIndex: number) => void
  isSubStepUnlocked: (id: WorkerSetupSubStepId) => boolean
  exitHref: string
}

/** Exported for Storybook fixtures; app code goes through the provider. */
export const WorkerSetupContext = createContext<WorkerSetupContextValue | null>(
  null,
)

export function useWorkerSetup() {
  const ctx = useContext(WorkerSetupContext)
  if (!ctx) {
    throw new Error('useWorkerSetup must be used within WorkerSetupProvider')
  }
  return ctx
}

type WorkerSetupProviderProps = {
  children: ReactNode
}

function parseSubStep(value: string | null | undefined): WorkerSetupSubStepId {
  const allowed = new Set<string>([
    'profile.details',
    'profile.photo',
    'profile.bio',
    'services.skills',
    'services.experience',
    'area.location',
    'area.travel',
    'verify.phone',
    'verify.portfolio',
    'review.submit',
  ])
  if (value && allowed.has(value)) return value as WorkerSetupSubStepId
  return WORKER_SETUP_FIRST_SUB_STEP
}

function applyBootstrapState(
  nextBootstrap: MeWorkerSetupQuery['me'],
  setters: {
    setBootstrap: (v: MeWorkerSetupQuery['me']) => void
    setForm: (v: WorkerSetupFormState) => void
    setActiveSubStep: (v: WorkerSetupSubStepId) => void
    setCompletedSubSteps: (v: Set<string>) => void
    setExpandedMajor: (v: number | null) => void
  },
) {
  setters.setBootstrap(nextBootstrap)
  setters.setForm(formStateFromMeWorkerSetup(nextBootstrap))
  const progress = nextBootstrap.worker?.setupProgress
  const current = parseSubStep(progress?.currentSubStep)
  setters.setActiveSubStep(current)
  setters.setCompletedSubSteps(new Set(progress?.completedSubSteps ?? []))
  setters.setExpandedMajor(majorIndexForSubStep(current))
}

export function WorkerSetupProvider({ children }: WorkerSetupProviderProps) {
  const setMe = useUserStore((s) => s.setMe)
  const me = useUserStore((s) => s.me)
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useI11n(bag)
  const localize = useLocalizedHref()
  // Validated: `next` comes from the URL (open-redirect guard).
  const exitHref = getSafeNextPath(searchParams.get('next')) ?? APP_HOME
  const redirectRef = useRef(false)
  const hydratedRef = useRef(false)

  const [bootstrap, setBootstrap] = useState<MeWorkerSetupQuery['me'] | null>(
    null,
  )
  const [form, setForm] = useState<WorkerSetupFormState>(
    emptyWorkerSetupFormState(),
  )
  const [activeSubStep, setActiveSubStep] = useState<WorkerSetupSubStepId>(
    WORKER_SETUP_FIRST_SUB_STEP,
  )
  const [completedSubSteps, setCompletedSubSteps] = useState<Set<string>>(
    new Set(),
  )
  const [isHydrated, setIsHydrated] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [expandedMajor, setExpandedMajor] = useState<number | null>(
    majorIndexForSubStep(WORKER_SETUP_FIRST_SUB_STEP),
  )

  const { data, loading, error, refetch } = useQuery<MeWorkerSetupQuery>(
    MeWorkerSetup,
    { fetchPolicy: 'network-only' },
  )
  const retryLoad = useCallback(() => {
    void refetch()
  }, [refetch])

  const onHydrationRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hydratedRef.current || loading || !data?.me) return
      hydratedRef.current = true
      const nextBootstrap = data.me
      applyBootstrapState(nextBootstrap, {
        setBootstrap,
        setForm,
        setActiveSubStep,
        setCompletedSubSteps,
        setExpandedMajor,
      })
      setMe(mergeMeWorkerSetupQuery(me, nextBootstrap))
      setIsHydrated(true)

      if (nextBootstrap.worker?.setupProgress?.isComplete) {
        if (!redirectRef.current) {
          redirectRef.current = true
          // Already-complete workers edit on /profile instead of re-entering
          // setup; an explicit ?next (e.g. from a login round-trip) wins.
          router.replace(
            localize(getSafeNextPath(searchParams.get('next')) ?? '/profile'),
          )
        }
      }
    },
    [data?.me, loading, localize, me, router, searchParams, setMe],
  )

  const [saveStep, { loading: isSaving }] =
    useMutation<SaveWorkerSetupStepMutation>(SaveWorkerSetupStep)

  const effectiveBootstrap = useMemo(() => {
    if (!bootstrap) return null
    if (!me?.profile) return bootstrap
    return {
      ...bootstrap,
      email: me.email ?? bootstrap.email,
      phoneVerified: me.phoneVerified,
      emailVerified: me.emailVerified,
      workerEligibility: me.workerEligibility,
      profile: {
        ...bootstrap.profile,
        ...me.profile,
        avatarUrl: me.profile.avatarUrl ?? bootstrap.profile?.avatarUrl,
        contactNumber:
          me.profile.contactNumber ?? bootstrap.profile?.contactNumber,
      },
    }
  }, [bootstrap, me])

  const patchForm = useCallback((patch: Partial<WorkerSetupFormState>) => {
    setForm((current) => ({ ...current, ...patch }))
    setFieldErrors({})
    setSaveError(null)
  }, [])

  const clearSetupErrors = useCallback(() => {
    setFieldErrors({})
    setSaveError(null)
  }, [])

  const checkUnlocked = useCallback(
    (id: WorkerSetupSubStepId) =>
      isSubStepUnlocked(id, activeSubStep, completedSubSteps),
    [activeSubStep, completedSubSteps],
  )

  const goToSubStep = useCallback(
    (id: WorkerSetupSubStepId) => {
      if (!checkUnlocked(id)) return
      setActiveSubStep(id)
      setExpandedMajor(majorIndexForSubStep(id))
      setFieldErrors({})
      setSaveError(null)
    },
    [checkUnlocked],
  )

  const goBack = useCallback(() => {
    const prev = previousSubStep(activeSubStep)
    if (!prev) return
    goToSubStep(prev)
  }, [activeSubStep, goToSubStep])

  const saveAndContinue = useCallback(async () => {
    if (!effectiveBootstrap) return

    const errors = validateWorkerSetupSubStep(
      activeSubStep,
      form,
      effectiveBootstrap,
    )
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSaveError(null)

    let formForSave = form
    let locationPayload: Record<string, unknown> | undefined

    if (activeSubStep === 'area.location') {
      const resolved = await resolveWorkerSetupLocation(form)
      if (!resolved) {
        setFieldErrors({ locationName: WORKER_SETUP_LOCATION_GEOCODE_ERROR })
        return
      }
      formForSave = { ...form, ...resolved.formPatch }
      setForm(formForSave)
      locationPayload = { location: resolved.location }
    }

    const stepsToSave = subStepsToSaveOnContinue(activeSubStep)

    try {
      let savedBootstrap = effectiveBootstrap
      let lastSaved: SaveWorkerSetupStepMutation['saveWorkerSetupStep'] | null =
        null

      for (const subStep of stepsToSave) {
        const payload = {
          ...buildSavePayload(
            subStep,
            formForSave,
            savedBootstrap.profile?.avatarUrl,
          ),
          ...(subStep === 'area.location' ? (locationPayload ?? {}) : {}),
        }
        const input = {
          subStep,
          ...payload,
        } as SaveWorkerSetupStepInput

        const result = await saveStep({ variables: { input } })
        const saved = result.data?.saveWorkerSetupStep
        if (!saved?.setupProgress) {
          throw new Error('Could not save setup progress.')
        }
        lastSaved = saved

        savedBootstrap = {
          ...savedBootstrap,
          emailVerified:
            saved.user?.emailVerified ?? savedBootstrap.emailVerified,
          phoneVerified:
            saved.user?.phoneVerified ?? savedBootstrap.phoneVerified,
          profile: {
            ...savedBootstrap.profile,
            name: saved.profile?.name ?? savedBootstrap.profile?.name,
            avatarUrl:
              saved.profile?.avatarUrl ?? savedBootstrap.profile?.avatarUrl,
            contactNumber:
              saved.user?.profile?.contactNumber ??
              savedBootstrap.profile?.contactNumber,
          },
          worker: {
            ...(savedBootstrap.worker ?? { id: saved.id }),
            id: saved.id,
            legalName: saved.legalName,
            bio: saved.bio,
            tagline: saved.tagline,
            primaryCategory: saved.primaryCategory,
            yearsExperience: saved.yearsExperience,
            skills: saved.skills,
            qualifications: saved.qualifications,
            travelRadiusMiles: saved.travelRadiusMiles,
            portfolioUrls: saved.portfolioUrls,
            preferredLocation: saved.preferredLocation,
            setupProgress: saved.setupProgress,
          },
        }
      }

      if (!lastSaved) {
        throw new Error('Could not save setup progress.')
      }

      const saved = lastSaved
      const nextBootstrap = savedBootstrap

      applyBootstrapState(nextBootstrap, {
        setBootstrap,
        setForm,
        setActiveSubStep,
        setCompletedSubSteps,
        setExpandedMajor,
      })

      if (me) {
        setMe(mergeSaveWorkerSetupIntoMe(me, saved))
      }

      if (
        activeSubStep === 'review.submit' &&
        saved.setupProgress?.isComplete
      ) {
        trackFlowSucceeded(EVENTS.worker_setup_success, {
          is_new_worker: true,
        })
        // Clear finish, then straight back to where they started (e.g. the
        // task they wanted to quote on).
        showAppToast({
          title: t.completeTitle,
          description: t.completeBody,
          type: 'success',
        })
        router.replace(localize(exitHref))
      }
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.worker_setup_fail, error, {
        flow: 'worker_setup',
        action: 'saveWorkerSetupStep',
        operation: 'SaveWorkerSetupStep',
        route: '/worker/setup',
        extra: { sub_step: activeSubStep },
      })
      setSaveError(
        getWorkerSetupErrorMessage(error, 'Could not save this step.'),
      )
    }
  }, [
    activeSubStep,
    effectiveBootstrap,
    exitHref,
    form,
    localize,
    me,
    router,
    saveStep,
    setMe,
    t,
  ])

  const toggleMajor = useCallback((majorIndex: number) => {
    setExpandedMajor((current) => (current === majorIndex ? null : majorIndex))
  }, [])

  const value = useMemo<WorkerSetupContextValue>(
    () => ({
      bootstrap: effectiveBootstrap,
      form,
      activeSubStep,
      completedSubSteps,
      isHydrated,
      loadError: Boolean(error),
      retryLoad,
      isSaving,
      fieldErrors,
      saveError,
      expandedMajor,
      progressPercent: progressPercent(activeSubStep),
      workerEligibility: effectiveBootstrap?.workerEligibility ?? false,
      patchForm,
      clearSetupErrors,
      goToSubStep,
      saveAndContinue,
      goBack,
      toggleMajor,
      isSubStepUnlocked: checkUnlocked,
      exitHref,
    }),
    [
      activeSubStep,
      checkUnlocked,
      completedSubSteps,
      effectiveBootstrap,
      exitHref,
      expandedMajor,
      fieldErrors,
      form,
      goBack,
      goToSubStep,
      isHydrated,
      error,
      retryLoad,
      isSaving,
      patchForm,
      clearSetupErrors,
      saveAndContinue,
      saveError,
      toggleMajor,
    ],
  )

  return (
    <WorkerSetupContext.Provider value={value}>
      <div ref={onHydrationRef} hidden aria-hidden />
      {children}
    </WorkerSetupContext.Provider>
  )
}
