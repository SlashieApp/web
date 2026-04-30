'use client'

import {
  Box,
  Grid,
  HStack,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import type * as React from 'react'
import { useRef, useState } from 'react'

import { useDashboardData } from '@/app/dashboard/context'
import { formatPounds } from '@/utils/dashboardHelpers'
import {
  DASHBOARD_TRADE_OPTIONS,
  type DashboardTrade,
} from '@/utils/dashboardTypes'
import {
  clearWorkerOnboardingDraft,
  getWorkerOnboardingDraft,
  setWorkerOnboardingDraft,
} from '@/utils/workerOnboardingSession'
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Logo,
  RadioButton,
  Tag,
} from '@ui'

type WorkerSignupStepId =
  | 'create-account'
  | 'verify-email'
  | 'personal-details'
  | 'location'
  | 'work-details'
  | 'profile-photo'
  | 'experience-portfolio'
  | 'verify-identity'
  | 'choose-plan'
  | 'all-set'

type WorkerOnboardingDraft = {
  accountEmail: string
  accountPassword: string
  emailVerified: boolean
  allowUnverifiedEmail: boolean
  fullName: string
  phoneNumber: string
  dateOfBirth: string
  businessName: string
  location: string
  travelRadiusMiles: string
  skills: DashboardTrade[]
  yearsExperience: string
  hourlyRate: string
  profileBio: string
  profilePhotoName: string
  portfolioSummary: string
  portfolioPhotoNames: string[]
  governmentIdFileName: string
  selfieFileName: string
  proofOfAddressFileName: string
  selectedPlan: 'worker-plan' | null
  trialStarted: boolean
}

type StoredOnboardingState = {
  step: number
  maxStep: number
  draft: WorkerOnboardingDraft
}

type StepDefinition = {
  id: WorkerSignupStepId
  title: string
  description: string
}

type FieldErrors = Partial<Record<keyof WorkerOnboardingDraft | 'step', string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WORKER_PLAN_PRICE_PENCE = 1299

const STEPS: StepDefinition[] = [
  {
    id: 'create-account',
    title: 'Create your worker account',
    description: 'Join thousands of workers earning on Slashie.',
  },
  {
    id: 'verify-email',
    title: 'Verify your email',
    description: 'Check your inbox and confirm your email address.',
  },
  {
    id: 'personal-details',
    title: 'Tell us about yourself',
    description: 'This helps customers trust and connect with you.',
  },
  {
    id: 'location',
    title: 'Where do you work?',
    description: 'Add your location so nearby tasks can find you.',
  },
  {
    id: 'work-details',
    title: 'What work do you do?',
    description: 'Pick your skills and the experience you bring.',
  },
  {
    id: 'profile-photo',
    title: 'Add profile and photo',
    description: 'Share a short bio and an optional profile photo.',
  },
  {
    id: 'experience-portfolio',
    title: 'Show your experience',
    description: 'Optional portfolio photos help customers shortlist you.',
  },
  {
    id: 'verify-identity',
    title: 'Verify your identity',
    description: 'Upload identity checks to build trust.',
  },
  {
    id: 'choose-plan',
    title: 'Choose your plan',
    description: 'Select a plan to receive tasks and quotes.',
  },
  {
    id: 'all-set',
    title: 'You are all set',
    description: 'Your worker profile is ready for new tasks.',
  },
]

function isDashboardTrade(value: string): value is DashboardTrade {
  return DASHBOARD_TRADE_OPTIONS.includes(value as DashboardTrade)
}

function parseHourlyRateToPence(value: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return Math.round(amount * 100)
}

function clampStep(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value >= STEPS.length) return STEPS.length - 1
  return value
}

function buildDefaultDraft({
  email,
  fullName,
  phoneNumber,
  location,
  bio,
  workerBusinessName,
  workerServiceArea,
  workerYearsExperience,
  workerHourlyRatePence,
  workerSkills,
  workerVerificationName,
}: {
  email: string
  fullName: string
  phoneNumber: string
  location: string
  bio: string
  workerBusinessName: string
  workerServiceArea: string
  workerYearsExperience: string
  workerHourlyRatePence: number
  workerSkills: DashboardTrade[]
  workerVerificationName: string
}): WorkerOnboardingDraft {
  return {
    accountEmail: email,
    accountPassword: '',
    emailVerified: false,
    allowUnverifiedEmail: false,
    fullName,
    phoneNumber,
    dateOfBirth: '',
    businessName: workerBusinessName,
    location: location || workerServiceArea,
    travelRadiusMiles: '20',
    skills: workerSkills,
    yearsExperience: workerYearsExperience || '3',
    hourlyRate: String(
      workerHourlyRatePence > 0 ? workerHourlyRatePence / 100 : 45,
    ),
    profileBio: bio,
    profilePhotoName: '',
    portfolioSummary: '',
    portfolioPhotoNames: [],
    governmentIdFileName: workerVerificationName,
    selfieFileName: '',
    proofOfAddressFileName: '',
    selectedPlan: null,
    trialStarted: false,
  }
}

function sanitizeStoredDraft(
  baseDraft: WorkerOnboardingDraft,
  storedDraft: Partial<WorkerOnboardingDraft>,
) {
  return {
    ...baseDraft,
    ...storedDraft,
    skills: Array.isArray(storedDraft.skills)
      ? storedDraft.skills.filter((skill) => isDashboardTrade(String(skill)))
      : baseDraft.skills,
    portfolioPhotoNames: Array.isArray(storedDraft.portfolioPhotoNames)
      ? storedDraft.portfolioPhotoNames.slice(0, 6)
      : baseDraft.portfolioPhotoNames,
    selectedPlan:
      storedDraft.selectedPlan === 'worker-plan' ? 'worker-plan' : null,
  } satisfies WorkerOnboardingDraft
}

function inferStartingStep(
  draft: WorkerOnboardingDraft,
  workerProfileComplete: boolean,
) {
  if (workerProfileComplete) return STEPS.length - 1
  if (!draft.accountEmail.trim() || draft.accountPassword.trim().length < 8)
    return 0
  if (!draft.emailVerified && !draft.allowUnverifiedEmail) return 1
  if (
    !draft.fullName.trim() ||
    !draft.phoneNumber.trim() ||
    !draft.dateOfBirth.trim()
  )
    return 2
  if (!draft.location.trim() || !draft.travelRadiusMiles.trim()) return 3
  if (!draft.skills.length || !draft.yearsExperience.trim()) return 4
  if (!draft.profileBio.trim()) return 5
  if (!draft.governmentIdFileName.trim() || !draft.selfieFileName.trim())
    return 7
  if (!draft.selectedPlan) return 8
  return 9
}

export function WorkerSignupFlow() {
  const {
    me,
    profile,
    workerProfile,
    workerProfileComplete,
    registerWorker,
    saveProfile,
  } = useDashboardData()

  const userId = me?.id ?? null
  const defaultDraft = buildDefaultDraft({
    email: me?.email ?? '',
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber,
    location: profile.location,
    bio: profile.bio,
    workerBusinessName: workerProfile.businessName,
    workerServiceArea: workerProfile.serviceArea,
    workerYearsExperience: workerProfile.yearsExperience,
    workerHourlyRatePence: workerProfile.hourlyRatePence,
    workerSkills: workerProfile.skills,
    workerVerificationName: workerProfile.verificationDocumentName,
  })

  const [draft, setDraft] = useState<WorkerOnboardingDraft>(defaultDraft)
  const [currentStep, setCurrentStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>(
    'idle',
  )
  const [locationMessage, setLocationMessage] = useState<string | null>(null)

  const prevUserIdRef = useRef<string | null>(null)
  if (userId !== prevUserIdRef.current) {
    prevUserIdRef.current = userId
    const inferredStep = inferStartingStep(defaultDraft, workerProfileComplete)

    if (!userId) {
      setDraft(defaultDraft)
      setCurrentStep(inferredStep)
      setMaxStep(inferredStep)
    } else {
      const storedState =
        getWorkerOnboardingDraft<StoredOnboardingState>(userId)
      if (storedState?.draft) {
        const hydratedDraft = sanitizeStoredDraft(
          defaultDraft,
          storedState.draft,
        )
        const restoredStep = clampStep(storedState.step ?? inferredStep)
        const restoredMax = Math.max(
          restoredStep,
          clampStep(storedState.maxStep),
        )

        setDraft(hydratedDraft)
        setCurrentStep(restoredStep)
        setMaxStep(restoredMax)
      } else {
        setDraft(defaultDraft)
        setCurrentStep(inferredStep)
        setMaxStep(inferredStep)
      }
    }

    setFieldErrors({})
    setStatusMessage(null)
    setResendStatus('idle')
    setLocationMessage(null)
  }

  const step = STEPS[currentStep]

  function persistDraft(
    nextDraft: WorkerOnboardingDraft,
    nextStep: number = currentStep,
    nextMaxStep: number = maxStep,
  ) {
    if (!userId) return
    setWorkerOnboardingDraft(userId, {
      step: nextStep,
      maxStep: nextMaxStep,
      draft: nextDraft,
    })
  }

  function updateDraft(
    updater: (current: WorkerOnboardingDraft) => WorkerOnboardingDraft,
  ) {
    setDraft((current) => {
      const next = updater(current)
      persistDraft(next)
      return next
    })
  }

  function setDraftValue<K extends keyof WorkerOnboardingDraft>(
    key: K,
    value: WorkerOnboardingDraft[K],
  ) {
    updateDraft((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({
      ...current,
      [key]: undefined,
      step: undefined,
    }))
    setStatusMessage(null)
  }

  function setStep(nextStep: number) {
    const clamped = clampStep(nextStep)
    const nextMax = Math.max(maxStep, clamped)
    setCurrentStep(clamped)
    setMaxStep(nextMax)
    persistDraft(draft, clamped, nextMax)
    setFieldErrors({})
    setStatusMessage(null)
  }

  function validateCurrentStep() {
    const errors: FieldErrors = {}

    switch (currentStep) {
      case 0:
        if (!draft.accountEmail.trim()) {
          errors.accountEmail = 'Email is required.'
        } else if (!EMAIL_REGEX.test(draft.accountEmail.trim())) {
          errors.accountEmail = 'Enter a valid email address.'
        }
        if (!draft.accountPassword.trim()) {
          errors.accountPassword = 'Password is required.'
        } else if (draft.accountPassword.trim().length < 8) {
          errors.accountPassword = 'Password must be at least 8 characters.'
        }
        break
      case 1:
        if (!draft.emailVerified && !draft.allowUnverifiedEmail) {
          errors.step =
            'Confirm your email, or choose continue without verification for now.'
        }
        break
      case 2:
        if (!draft.fullName.trim()) errors.fullName = 'Full name is required.'
        if (!draft.phoneNumber.trim()) errors.phoneNumber = 'Phone is required.'
        if (!draft.dateOfBirth.trim())
          errors.dateOfBirth = 'Date of birth is required.'
        break
      case 3:
        if (!draft.location.trim()) errors.location = 'Location is required.'
        if (!draft.travelRadiusMiles.trim()) {
          errors.travelRadiusMiles = 'Travel radius is required.'
        } else if (
          Number.isNaN(Number(draft.travelRadiusMiles)) ||
          Number(draft.travelRadiusMiles) <= 0
        ) {
          errors.travelRadiusMiles = 'Travel radius must be greater than 0.'
        }
        break
      case 4:
        if (!draft.skills.length) errors.skills = 'Select at least one skill.'
        if (!draft.yearsExperience.trim()) {
          errors.yearsExperience = 'Years of experience is required.'
        }
        if (
          !draft.hourlyRate.trim() ||
          Number.isNaN(Number(draft.hourlyRate)) ||
          Number(draft.hourlyRate) <= 0
        ) {
          errors.hourlyRate = 'Add a valid hourly rate.'
        }
        break
      case 5:
        if (!draft.profileBio.trim()) {
          errors.profileBio = 'Add a short bio to continue.'
        }
        break
      case 7:
        if (!draft.governmentIdFileName.trim()) {
          errors.governmentIdFileName = 'Government ID is required.'
        }
        if (!draft.selfieFileName.trim()) {
          errors.selfieFileName = 'A selfie check is required.'
        }
        break
      case 8:
        if (!draft.selectedPlan)
          errors.selectedPlan = 'Choose a plan to continue.'
        break
      default:
        break
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleContinue() {
    if (currentStep === STEPS.length - 1) return
    if (!validateCurrentStep()) return

    if (currentStep === 8) {
      if (!userId) {
        setStatusMessage('You must be signed in to complete worker setup.')
        return
      }

      saveProfile({
        ...profile,
        fullName: draft.fullName.trim(),
        phoneNumber: draft.phoneNumber.trim(),
        location: draft.location.trim(),
        bio: draft.profileBio.trim(),
        preferredTrades: draft.skills,
      })

      registerWorker({
        ...workerProfile,
        isActive: true,
        businessName: draft.businessName.trim() || draft.fullName.trim(),
        tagline: draft.profileBio.trim(),
        serviceArea: draft.location.trim(),
        yearsExperience: draft.yearsExperience.trim(),
        hourlyRatePence: parseHourlyRateToPence(draft.hourlyRate),
        skills: draft.skills,
        verificationDocumentName:
          draft.governmentIdFileName || draft.selfieFileName,
        joinedAt: workerProfile.joinedAt ?? new Date().toISOString(),
      })

      clearWorkerOnboardingDraft(userId)
      const finalStep = STEPS.length - 1
      setCurrentStep(finalStep)
      setMaxStep(finalStep)
      setFieldErrors({})
      setStatusMessage('Worker setup complete. You can now send quotes.')
      return
    }

    setStep(currentStep + 1)
  }

  function handleBack() {
    if (currentStep === 0) return
    setStep(currentStep - 1)
  }

  function handleResendEmail() {
    if (!draft.accountEmail.trim()) {
      setFieldErrors((current) => ({
        ...current,
        accountEmail: 'Add an email first so we can resend verification.',
      }))
      setStep(0)
      return
    }

    setResendStatus('sending')
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setResendStatus('sent')
      }, 900)
    }
  }

  function handleUseCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationMessage(
        'Geolocation is unavailable in this browser. Enter your location manually.',
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const roundedLat = position.coords.latitude.toFixed(4)
        const roundedLng = position.coords.longitude.toFixed(4)
        setDraftValue(
          'location',
          `Current location (${roundedLat}, ${roundedLng})`,
        )
        setLocationMessage(
          'Location detected. You can edit it before continuing.',
        )
      },
      () => {
        setLocationMessage(
          'Location permission was denied. Enter your town, city, or postcode manually.',
        )
      },
      { enableHighAccuracy: false, timeout: 7000 },
    )
  }

  function toggleSkill(skill: DashboardTrade) {
    updateDraft((current) => {
      const isActive = current.skills.includes(skill)
      const nextSkills = isActive
        ? current.skills.filter((entry) => entry !== skill)
        : [...current.skills, skill]
      return { ...current, skills: nextSkills }
    })
    setFieldErrors((current) => ({
      ...current,
      skills: undefined,
      step: undefined,
    }))
  }

  const isFinalStep = currentStep === STEPS.length - 1
  const continueLabel = currentStep === 8 ? 'Complete setup' : 'Continue'

  return (
    <Stack gap={{ base: 6, md: 8 }}>
      <Stack gap={2}>
        <HStack gap={3} align="center" flexWrap="wrap">
          <Logo h="22px" />
          <Heading size="md">Worker sign up flow</Heading>
          {workerProfileComplete ? (
            <Badge bg="intentPrimaryBg" color="intentPrimaryFg">
              Worker profile active
            </Badge>
          ) : null}
        </HStack>
        <Text color="formLabelMuted">
          Move through each onboarding step to activate worker quoting and
          finish your profile in the dashboard workspace.
        </Text>
      </Stack>

      <Grid templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }} gap={6}>
        <Stack gap={5}>
          <Box overflowX="auto" pb={1}>
            <HStack gap={3} minW="max-content" align="flex-start">
              {STEPS.map((entry, index) => {
                const isCurrent = index === currentStep
                const isComplete = index < currentStep
                const isUnlocked = index <= maxStep

                return (
                  <HStack key={entry.id} gap={2} align="center">
                    <Button
                      size="sm"
                      variant={isCurrent || isComplete ? 'primary' : 'outline'}
                      onClick={() => {
                        if (!isUnlocked) return
                        setStep(index)
                      }}
                      disabled={!isUnlocked}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {index + 1}
                    </Button>
                    <Stack gap={0} minW="140px">
                      <Text fontWeight={700} fontSize="sm" color="cardFg">
                        {entry.title}
                      </Text>
                      <Text fontSize="xs" color="formLabelMuted">
                        {entry.description}
                      </Text>
                    </Stack>
                  </HStack>
                )
              })}
            </HStack>
          </Box>

          <Card
            maxW="560px"
            w="full"
            alignSelf={{ base: 'stretch', lg: 'center' }}
          >
            <Stack gap={4}>
              <Stack gap={1}>
                <Logo h="20px" />
                <Heading size="lg">{step.title}</Heading>
                <Text color="formLabelMuted" fontSize="sm">
                  {step.description}
                </Text>
              </Stack>

              {currentStep === 0 ? (
                <Stack gap={4}>
                  <FormField
                    label="Email address"
                    helperText="Use the email address you want customers to contact."
                    errorText={fieldErrors.accountEmail}
                  >
                    <Input
                      type="email"
                      value={draft.accountEmail}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue('accountEmail', event.target.value)
                      }
                      placeholder="name@slashie.com"
                    />
                  </FormField>
                  <FormField
                    label="Password"
                    helperText="Minimum 8 characters."
                    errorText={fieldErrors.accountPassword}
                  >
                    <Input
                      type="password"
                      value={draft.accountPassword}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue('accountPassword', event.target.value)
                      }
                      placeholder="Create a password"
                    />
                  </FormField>
                  <Text fontSize="xs" color="formLabelMuted">
                    Session-backed onboarding only. API integration can be
                    connected in a follow-up by replacing this local draft
                    boundary.
                  </Text>
                </Stack>
              ) : null}

              {currentStep === 1 ? (
                <Stack gap={4}>
                  <Box bg="intentPrimaryBg" borderRadius="xl" p={4}>
                    <Stack gap={2} align="center" textAlign="center">
                      <Heading size="sm">Verification email sent</Heading>
                      <Text fontSize="sm" color="formLabelMuted">
                        We sent a verification link to {draft.accountEmail}.
                      </Text>
                      <HStack gap={2}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleResendEmail}
                          loading={resendStatus === 'sending'}
                        >
                          Resend email
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setDraftValue('emailVerified', true)
                            setDraftValue('allowUnverifiedEmail', false)
                          }}
                        >
                          I verified my email
                        </Button>
                      </HStack>
                      {resendStatus === 'sent' ? (
                        <Text
                          color="intentPrimaryFg"
                          fontSize="sm"
                          fontWeight={700}
                        >
                          Verification email resent.
                        </Text>
                      ) : null}
                    </Stack>
                  </Box>

                  <RadioButton
                    checked={draft.allowUnverifiedEmail}
                    label="Continue without email verification for now"
                    onChange={() =>
                      setDraftValue(
                        'allowUnverifiedEmail',
                        !draft.allowUnverifiedEmail,
                      )
                    }
                  />
                  {fieldErrors.step ? (
                    <Text color="red.500" fontSize="sm">
                      {fieldErrors.step}
                    </Text>
                  ) : null}
                </Stack>
              ) : null}

              {currentStep === 2 ? (
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                  <FormField label="Full name" errorText={fieldErrors.fullName}>
                    <Input
                      value={draft.fullName}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue('fullName', event.target.value)
                      }
                      placeholder="John Smith"
                    />
                  </FormField>
                  <FormField
                    label="Phone number"
                    errorText={fieldErrors.phoneNumber}
                  >
                    <Input
                      value={draft.phoneNumber}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue('phoneNumber', event.target.value)
                      }
                      placeholder="+44 7123 456789"
                    />
                  </FormField>
                  <FormField
                    label="Date of birth"
                    errorText={fieldErrors.dateOfBirth}
                    helperText="Used only for identity checks."
                  >
                    <Input
                      type="date"
                      value={draft.dateOfBirth}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue('dateOfBirth', event.target.value)
                      }
                    />
                  </FormField>
                  <FormField
                    label="Business name"
                    helperText="Optional, but shown on your worker profile."
                  >
                    <Input
                      value={draft.businessName}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue('businessName', event.target.value)
                      }
                      placeholder="Smith Home Services"
                    />
                  </FormField>
                </Grid>
              ) : null}

              {currentStep === 3 ? (
                <Stack gap={4}>
                  <FormField
                    label="Your location"
                    errorText={fieldErrors.location}
                  >
                    <Input
                      value={draft.location}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue('location', event.target.value)
                      }
                      placeholder="London, UK"
                    />
                  </FormField>
                  <FormField
                    label="Travel radius (miles)"
                    errorText={fieldErrors.travelRadiusMiles}
                  >
                    <Input
                      value={draft.travelRadiusMiles}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue('travelRadiusMiles', event.target.value)
                      }
                      placeholder="20"
                    />
                  </FormField>
                  <Button
                    variant="secondary"
                    alignSelf="flex-start"
                    onClick={handleUseCurrentLocation}
                  >
                    Use current location
                  </Button>
                  <Box borderRadius="xl" bg="badgeBg" minH="112px" p={4}>
                    <Stack gap={2} justify="center" h="full">
                      <Text fontWeight={700}>Map preview</Text>
                      <Text color="formLabelMuted" fontSize="sm">
                        Full map integration can connect here once dashboard map
                        APIs are available.
                      </Text>
                    </Stack>
                  </Box>
                  {locationMessage ? (
                    <Text fontSize="sm" color="formLabelMuted">
                      {locationMessage}
                    </Text>
                  ) : null}
                </Stack>
              ) : null}

              {currentStep === 4 ? (
                <Stack gap={4}>
                  <Stack gap={3}>
                    <Text fontWeight={700} fontSize="sm">
                      Main skills (select all that apply)
                    </Text>
                    <HStack gap={2} flexWrap="wrap">
                      {DASHBOARD_TRADE_OPTIONS.map((skill) => {
                        const selected = draft.skills.includes(skill)
                        return (
                          <Button
                            key={skill}
                            size="sm"
                            variant={selected ? 'primary' : 'outline'}
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                          </Button>
                        )
                      })}
                    </HStack>
                    {fieldErrors.skills ? (
                      <Text color="red.500" fontSize="sm">
                        {fieldErrors.skills}
                      </Text>
                    ) : null}
                  </Stack>
                  <Grid
                    templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                    gap={4}
                  >
                    <FormField
                      label="Years of experience"
                      errorText={fieldErrors.yearsExperience}
                    >
                      <Input
                        value={draft.yearsExperience}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) =>
                          setDraftValue('yearsExperience', event.target.value)
                        }
                        placeholder="5"
                      />
                    </FormField>
                    <FormField
                      label="Hourly rate (£)"
                      errorText={fieldErrors.hourlyRate}
                    >
                      <Input
                        value={draft.hourlyRate}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setDraftValue('hourlyRate', event.target.value)}
                        placeholder="45"
                      />
                    </FormField>
                  </Grid>
                </Stack>
              ) : null}

              {currentStep === 5 ? (
                <Stack gap={4}>
                  <FormField
                    label="Profile photo"
                    helperText="Optional for now, but recommended for trust."
                  >
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue(
                          'profilePhotoName',
                          event.target.files?.[0]?.name ?? '',
                        )
                      }
                    />
                  </FormField>
                  {draft.profilePhotoName ? (
                    <Tag color="primary">{draft.profilePhotoName}</Tag>
                  ) : null}
                  <FormField
                    label="Bio"
                    helperText="Share what customers can expect when they hire you."
                    errorText={fieldErrors.profileBio}
                  >
                    <Textarea
                      value={draft.profileBio}
                      onChange={(
                        event: React.ChangeEvent<HTMLTextAreaElement>,
                      ) => setDraftValue('profileBio', event.target.value)}
                      minH="110px"
                      resize="vertical"
                      borderColor="formControlBorder"
                      bg="formControlBg"
                      color="formControlFg"
                      _placeholder={{ color: 'formControlPlaceholder' }}
                    />
                  </FormField>
                </Stack>
              ) : null}

              {currentStep === 6 ? (
                <Stack gap={4}>
                  <FormField
                    label="Work experience (optional)"
                    helperText="Describe notable jobs, specialties, or certifications."
                  >
                    <Textarea
                      value={draft.portfolioSummary}
                      onChange={(
                        event: React.ChangeEvent<HTMLTextAreaElement>,
                      ) =>
                        setDraftValue('portfolioSummary', event.target.value)
                      }
                      minH="110px"
                      resize="vertical"
                      borderColor="formControlBorder"
                      bg="formControlBg"
                      color="formControlFg"
                      _placeholder={{ color: 'formControlPlaceholder' }}
                    />
                  </FormField>
                  <FormField
                    label="Portfolio photos (optional)"
                    helperText="You can continue without uploads."
                  >
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue(
                          'portfolioPhotoNames',
                          Array.from(event.target.files ?? [])
                            .map((file) => file.name)
                            .slice(0, 6),
                        )
                      }
                    />
                  </FormField>
                  {draft.portfolioPhotoNames.length ? (
                    <HStack gap={2} flexWrap="wrap">
                      {draft.portfolioPhotoNames.map((name) => (
                        <Tag key={name} color={null}>
                          {name}
                        </Tag>
                      ))}
                    </HStack>
                  ) : (
                    <Text fontSize="sm" color="formLabelMuted">
                      No portfolio files selected yet.
                    </Text>
                  )}
                </Stack>
              ) : null}

              {currentStep === 7 ? (
                <Stack gap={4}>
                  <FormField
                    label="Government ID"
                    helperText="Required for identity checks."
                    errorText={fieldErrors.governmentIdFileName}
                  >
                    <Input
                      type="file"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue(
                          'governmentIdFileName',
                          event.target.files?.[0]?.name ?? '',
                        )
                      }
                    />
                  </FormField>
                  <FormField
                    label="Selfie check"
                    helperText="Required to match your submitted ID."
                    errorText={fieldErrors.selfieFileName}
                  >
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue(
                          'selfieFileName',
                          event.target.files?.[0]?.name ?? '',
                        )
                      }
                    />
                  </FormField>
                  <FormField
                    label="Proof of address"
                    helperText="Optional at this stage."
                  >
                    <Input
                      type="file"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftValue(
                          'proofOfAddressFileName',
                          event.target.files?.[0]?.name ?? '',
                        )
                      }
                    />
                  </FormField>
                </Stack>
              ) : null}

              {currentStep === 8 ? (
                <Stack gap={4}>
                  <Card
                    p={4}
                    borderRadius="xl"
                    borderColor={
                      draft.selectedPlan ? 'intentPrimaryBorder' : 'cardBorder'
                    }
                    bg={draft.selectedPlan ? 'intentPrimaryBg' : 'cardBg'}
                    maxW="full"
                  >
                    <Stack gap={3}>
                      <HStack justify="space-between" align="baseline">
                        <Heading size="sm">Worker plan</Heading>
                        <Text fontWeight={800} color="intentPrimaryFg">
                          {formatPounds(WORKER_PLAN_PRICE_PENCE)} / month
                        </Text>
                      </HStack>
                      <Tag color="primary">7-day free trial</Tag>
                      <Stack gap={1} fontSize="sm" color="formLabelMuted">
                        <Text>- Send unlimited quotes</Text>
                        <Text>- Manage task intake</Text>
                        <Text>- Chat with customers</Text>
                        <Text>- Earnings dashboard</Text>
                      </Stack>
                    </Stack>
                  </Card>
                  <RadioButton
                    checked={draft.selectedPlan === 'worker-plan'}
                    label="Select Worker plan"
                    onChange={() =>
                      setDraftValue('selectedPlan', 'worker-plan')
                    }
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setDraftValue('trialStarted', true)}
                    alignSelf="flex-start"
                  >
                    Start free trial
                  </Button>
                  {draft.trialStarted ? (
                    <Text
                      fontSize="sm"
                      color="intentPrimaryFg"
                      fontWeight={700}
                    >
                      Trial selected. Continue to complete setup.
                    </Text>
                  ) : null}
                  {fieldErrors.selectedPlan ? (
                    <Text fontSize="sm" color="red.500">
                      {fieldErrors.selectedPlan}
                    </Text>
                  ) : null}
                  <Link
                    as={NextLink}
                    href="/dashboard"
                    _hover={{ textDecoration: 'none' }}
                    alignSelf="flex-start"
                    color="formLabelMuted"
                  >
                    Go to dashboard
                  </Link>
                </Stack>
              ) : null}

              {currentStep === 9 ? (
                <Stack gap={4} align="center" textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    borderRadius="full"
                    bg="intentPrimaryBg"
                    color="intentPrimaryFg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight={800}
                    fontSize="2xl"
                  >
                    OK
                  </Box>
                  <Heading size="md">Your profile is ready</Heading>
                  <Text color="formLabelMuted">
                    You can now browse tasks, send quotes, and manage worker
                    tools from your dashboard.
                  </Text>
                  <HStack gap={3} flexWrap="wrap" justify="center">
                    <Link
                      as={NextLink}
                      href="/"
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Button>Browse tasks</Button>
                    </Link>
                    <Link
                      as={NextLink}
                      href="/dashboard/quotes"
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Button variant="secondary">Open dashboard</Button>
                    </Link>
                  </HStack>
                </Stack>
              ) : null}

              {statusMessage ? (
                <Text color="intentPrimaryFg" fontSize="sm" fontWeight={700}>
                  {statusMessage}
                </Text>
              ) : null}

              {!isFinalStep ? (
                <HStack justify="space-between" pt={2}>
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    Back
                  </Button>
                  <Button onClick={handleContinue}>{continueLabel}</Button>
                </HStack>
              ) : (
                <HStack justify="space-between" pt={2}>
                  <Button variant="secondary" onClick={() => setStep(8)}>
                    Edit plan
                  </Button>
                  <Link
                    as={NextLink}
                    href="/dashboard/quotes"
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Button>View worker dashboard</Button>
                  </Link>
                </HStack>
              )}

              <HStack justify="center" gap={2} pt={1}>
                {STEPS.map((entry, index) => (
                  <Box
                    key={entry.id}
                    w={2}
                    h={2}
                    borderRadius="full"
                    bg={index <= currentStep ? 'intentPrimaryFg' : 'cardBorder'}
                  />
                ))}
              </HStack>
            </Stack>
          </Card>
        </Stack>

        <Stack gap={4}>
          <Card maxW="full">
            <Stack gap={3}>
              <Heading size="sm">Onboarding summary</Heading>
              <HStack justify="space-between">
                <Text color="formLabelMuted" fontSize="sm">
                  Skills selected
                </Text>
                <Text fontWeight={700}>{draft.skills.length}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="formLabelMuted" fontSize="sm">
                  Profile completeness
                </Text>
                <Text fontWeight={700}>
                  {Math.round(((currentStep + 1) / 10) * 100)}%
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="formLabelMuted" fontSize="sm">
                  Target hourly rate
                </Text>
                <Text fontWeight={700}>
                  {formatPounds(parseHourlyRateToPence(draft.hourlyRate))}/hr
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="formLabelMuted" fontSize="sm">
                  Identity checks
                </Text>
                <Text fontWeight={700}>
                  {draft.governmentIdFileName && draft.selfieFileName
                    ? 'Complete'
                    : 'Pending'}
                </Text>
              </HStack>
            </Stack>
          </Card>
          <Card maxW="full">
            <Stack gap={3}>
              <Heading size="sm">Integration boundary</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                This flow persists in dashboard session storage and maps its
                final fields to existing profile and worker registration context
                actions.
              </Text>
              <Text fontSize="sm" color="formLabelMuted">
                Swap this boundary to GraphQL mutations when worker onboarding
                APIs are ready without changing the step UI contract.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Grid>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={3}>
        <Card maxW="full" p={4}>
          <Stack gap={1}>
            <Heading size="xs">Subscription model</Heading>
            <Text fontSize="sm" color="formLabelMuted">
              No per-job fees, predictable monthly access.
            </Text>
          </Stack>
        </Card>
        <Card maxW="full" p={4}>
          <Stack gap={1}>
            <Heading size="xs">Safe and secure</Heading>
            <Text fontSize="sm" color="formLabelMuted">
              Identity and profile data are handled with explicit checks.
            </Text>
          </Stack>
        </Card>
        <Card maxW="full" p={4}>
          <Stack gap={1}>
            <Heading size="xs">Build reputation</Heading>
            <Text fontSize="sm" color="formLabelMuted">
              Grow through reviews, repeat work, and faster shortlisting.
            </Text>
          </Stack>
        </Card>
        <Card maxW="full" p={4}>
          <Stack gap={1}>
            <Heading size="xs">Support when needed</Heading>
            <Text fontSize="sm" color="formLabelMuted">
              Worker support can help with setup and verification issues.
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}
