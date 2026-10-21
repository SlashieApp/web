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
import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { APP_HOME } from '@/utils/appRoutes'
import { showAppToast } from '@/utils/appToast'

import MeWorkerSetup from '../graphql/MeWorkerSetup.gql'
import SaveWorkerSetupStep from '../graphql/SaveWorkerSetupStep.gql'
import { prefillHeadline } from '../helpers/workerSetupCategories'
import { workerSetupErrorMessage } from '../helpers/workerSetupErrors'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
  formStateFromMeWorkerSetup,
} from '../helpers/workerSetupFormState'
import { resolveWorkerSetupLocation } from '../helpers/workerSetupLocation'
import {
  isScreenUnlocked,
  nextScreen,
  previousScreen,
  resumeScreen,
} from '../helpers/workerSetupScreens'
import {
  mergeMeWorkerSetupQuery,
  mergeSaveWorkerSetupIntoMe,
} from '../helpers/workerSetupSyncMe'
import {
  type WorkerSetupFieldErrors,
  buildSavePayload,
  validateWorkerSetupScreen,
} from '../helpers/workerSetupValidation'
import bag from '../i11n.json'
import { type WorkerSetupScreenId, workerSetupScreen } from '../views'

/** Loading the setup record, it failed, the worker already finished, or setting up. */
export type WorkerSetupStatus = 'loading' | 'error' | 'complete' | 'ready'

/** What the signed-in account has already (photo, verified phone and email). */
export type WorkerSetupAccountState = {
  avatarUrl: string | null
  phoneVerified: boolean
  emailVerified: boolean
}

export type WorkerSetupContextValue = {
  status: WorkerSetupStatus
  retryLoad: () => void
  account: WorkerSetupAccountState
  form: WorkerSetupFormState
  screen: WorkerSetupScreenId
  /** Saved API sub-steps. */
  completed: ReadonlySet<string>
  isSaving: boolean
  fieldErrors: WorkerSetupFieldErrors
  saveError: string | null
  /** Edits clear that field's error only. */
  patchForm: (patch: Partial<WorkerSetupFormState>) => void
  clearErrors: (fields: readonly string[]) => void
  goToScreen: (screen: WorkerSetupScreenId) => void
  goBack: () => void
  saveAndContinue: () => Promise<void>
  isScreenUnlocked: (screen: WorkerSetupScreenId) => boolean
  exitHref: string
  /** Callback ref for the step title: focused when the screen changes. */
  headingRef: (node: HTMLElement | null) => void
  /** Callback ref for the screen body: shows the first problem after Continue. */
  contentRef: (node: HTMLDivElement | null) => void
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

type SavedWorker = SaveWorkerSetupStepMutation['saveWorkerSetupStep']

/** Scrolls to the first field with an error and focuses its control. */
function showFirstProblem(container: HTMLElement) {
  const field = container.querySelector<HTMLElement>(
    '[data-invalid], [aria-invalid="true"]',
  )
  if (!field) return
  field.scrollIntoView({ block: 'center' })
  const control = field.matches('input, textarea, button')
    ? field
    : field.querySelector<HTMLElement>('input, textarea, button')
  control?.focus({ preventScroll: true })
}

export function WorkerSetupProvider({ children }: { children: ReactNode }) {
  const me = useUserStore((s) => s.me)
  const setMe = useUserStore((s) => s.setMe)
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useI11n(bag)
  const localize = useLocalizedHref()
  // Validated: `next` comes from the URL (open-redirect guard).
  const nextPath = getSafeNextPath(searchParams.get('next'))
  const exitHref = nextPath ?? APP_HOME
  const hydratedRef = useRef(false)
  const savingRef = useRef(false)
  const focusedScreenRef = useRef<WorkerSetupScreenId | null>(null)

  const [form, setForm] = useState<WorkerSetupFormState>(
    emptyWorkerSetupFormState,
  )
  const [screen, setScreen] = useState<WorkerSetupScreenId>('about')
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)
  const [complete, setComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<WorkerSetupFieldErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [problemCount, setProblemCount] = useState(0)

  const { data, loading, error, refetch } = useQuery<MeWorkerSetupQuery>(
    MeWorkerSetup,
    { fetchPolicy: 'network-only' },
  )
  const [saveStep] =
    useMutation<SaveWorkerSetupStepMutation>(SaveWorkerSetupStep)

  const retryLoad = useCallback(() => {
    void refetch()
  }, [refetch])

  const account = useMemo<WorkerSetupAccountState>(
    () => ({
      avatarUrl: me?.profile?.avatarUrl?.trim() || null,
      phoneVerified: isPhoneVerified(me),
      emailVerified: isEmailVerified(me),
    }),
    [me],
  )

  /** Every screen change goes through here: the headline starts from its suggestion. */
  const showScreen = useCallback(
    (next: WorkerSetupScreenId) => {
      setScreen(next)
      if (next === 'profile') {
        setForm((current) => prefillHeadline(current, t))
      }
      setFieldErrors({})
      setSaveError(null)
    },
    [t],
  )

  const onHydrationRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hydratedRef.current || loading || !data?.me) return
      hydratedRef.current = true
      const record = data.me
      const saved = new Set(record.worker?.setupProgress?.completedSubSteps)
      const start = resumeScreen(saved)
      setCompleted(saved)
      setScreen(start)
      setForm(
        start === 'profile'
          ? prefillHeadline(formStateFromMeWorkerSetup(record), t)
          : formStateFromMeWorkerSetup(record),
      )
      setMe(mergeMeWorkerSetupQuery(me, record))
      if (record.worker?.setupProgress?.isComplete) {
        // Workers edit on /profile; a ?next (e.g. a task to quote) wins.
        setComplete(true)
        router.replace(localize(nextPath ?? '/profile'))
      }
      setHydrated(true)
    },
    [data?.me, loading, localize, me, nextPath, router, setMe, t],
  )

  const clearErrors = useCallback((fields: readonly string[]) => {
    setFieldErrors((current) =>
      fields.some((field) => field in current)
        ? Object.fromEntries(
            Object.entries(current).filter(
              ([field]) => !fields.includes(field),
            ),
          )
        : current,
    )
  }, [])

  const patchForm = useCallback(
    (patch: Partial<WorkerSetupFormState>) => {
      setForm((current) => ({ ...current, ...patch }))
      clearErrors(Object.keys(patch))
      setSaveError(null)
    },
    [clearErrors],
  )

  const checkUnlocked = useCallback(
    (target: WorkerSetupScreenId) =>
      isScreenUnlocked(target, screen, completed),
    [completed, screen],
  )

  const goToScreen = useCallback(
    (target: WorkerSetupScreenId) => {
      if (savingRef.current || !checkUnlocked(target)) return
      showScreen(target)
    },
    [checkUnlocked, showScreen],
  )

  const goBack = useCallback(() => {
    const previous = previousScreen(screen)
    if (previous && !savingRef.current) showScreen(previous)
  }, [screen, showScreen])

  const showProblems = useCallback((errors: WorkerSetupFieldErrors) => {
    setFieldErrors(errors)
    setProblemCount((count) => count + 1)
  }, [])

  const saveAndContinue = useCallback(async () => {
    if (savingRef.current) return
    const errors = validateWorkerSetupScreen(screen, form, account)
    if (Object.keys(errors).length > 0) {
      showProblems(errors)
      return
    }

    savingRef.current = true
    setIsSaving(true)
    setFieldErrors({})
    setSaveError(null)
    let subStep: string = screen
    try {
      let formForSave = form
      if (screen === 'area') {
        const resolved = await resolveWorkerSetupLocation(form)
        if (!resolved) {
          showProblems({ locationName: 'areaNotFound' })
          return
        }
        formForSave = { ...form, ...resolved.formPatch }
        setForm(formForSave)
      }

      let saved: SavedWorker | null = null
      for (const step of workerSetupScreen(screen).subSteps) {
        subStep = step
        const result = await saveStep({
          variables: {
            input: {
              subStep: step,
              ...buildSavePayload(step, formForSave),
            } as SaveWorkerSetupStepInput,
          },
        })
        saved = result.data?.saveWorkerSetupStep ?? null
        if (!saved?.setupProgress) throw new Error('No setup progress')
      }
      if (!saved?.setupProgress) throw new Error('No setup progress')

      setCompleted(new Set(saved.setupProgress.completedSubSteps))
      if (me) setMe(mergeSaveWorkerSetupIntoMe(me, saved))

      if (screen !== 'review') {
        showScreen(nextScreen(screen) ?? 'review')
        return
      }
      if (saved.setupProgress.isComplete) {
        trackFlowSucceeded(EVENTS.worker_setup_success, {
          is_new_worker: true,
        })
        // Quoting also needs a verified email (the quote page asks for it).
        showAppToast({
          title: t.completeTitle,
          description: account.emailVerified
            ? t.completeBody
            : t.completeBodyVerifyEmail,
          type: 'success',
        })
        setComplete(true)
        router.replace(localize(exitHref))
      }
    } catch (failure: unknown) {
      trackFlowFailed(EVENTS.worker_setup_fail, failure, {
        flow: 'worker_setup',
        action: 'saveWorkerSetupStep',
        operation: 'SaveWorkerSetupStep',
        route: '/worker/setup',
        extra: { screen, sub_step: subStep },
      })
      setSaveError(workerSetupErrorMessage(failure, t))
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }, [
    account,
    exitHref,
    form,
    localize,
    me,
    router,
    saveStep,
    screen,
    setMe,
    showProblems,
    showScreen,
    t,
  ])

  const headingRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || focusedScreenRef.current === screen) return
      // Not on first load: focus stays where the page put it.
      const isFirst = focusedScreenRef.current === null
      focusedScreenRef.current = screen
      if (!isFirst) node.focus()
    },
    [screen],
  )

  const contentRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && problemCount > 0) showFirstProblem(node)
    },
    [problemCount],
  )

  const status: WorkerSetupStatus = !hydrated
    ? error && !loading
      ? 'error'
      : 'loading'
    : complete
      ? 'complete'
      : 'ready'

  const value = useMemo<WorkerSetupContextValue>(
    () => ({
      status,
      retryLoad,
      account,
      form,
      screen,
      completed,
      isSaving,
      fieldErrors,
      saveError,
      patchForm,
      clearErrors,
      goToScreen,
      goBack,
      saveAndContinue,
      isScreenUnlocked: checkUnlocked,
      exitHref,
      headingRef,
      contentRef,
    }),
    [
      account,
      checkUnlocked,
      clearErrors,
      completed,
      contentRef,
      exitHref,
      fieldErrors,
      form,
      goBack,
      goToScreen,
      headingRef,
      isSaving,
      patchForm,
      retryLoad,
      saveAndContinue,
      saveError,
      screen,
      status,
    ],
  )

  return (
    <WorkerSetupContext.Provider value={value}>
      <div ref={onHydrationRef} hidden aria-hidden />
      {children}
    </WorkerSetupContext.Provider>
  )
}
