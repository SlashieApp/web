'use client'

import {
  Box,
  Input as ChakraInput,
  Grid,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useDashboardData } from '@/features/dashboard/DashboardDataContext'
import {
  DASHBOARD_TRADE_OPTIONS,
  type DashboardTrade,
} from '@/features/dashboard/dashboardDemo'
import { formatDate, formatPounds } from '@/features/dashboard/dashboardHelpers'
import { Badge, Button, GlassCard, Heading, Text, TextInput } from '@ui'

export default function WorkerRegistrationPage() {
  const router = useRouter()
  const { profile, workerProfile, registerWorker, saveProfile, workerEnabled } =
    useDashboardData()

  const [fullName, setFullName] = useState(profile.fullName)
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber)
  const [location, setLocation] = useState(profile.location)
  const [businessName, setBusinessName] = useState(workerProfile.businessName)
  const [tagline, setTagline] = useState(workerProfile.tagline)
  const [serviceArea, setServiceArea] = useState(workerProfile.serviceArea)
  const [yearsExperience, setYearsExperience] = useState(
    workerProfile.yearsExperience,
  )
  const [hourlyRate, setHourlyRate] = useState(
    String(workerProfile.hourlyRatePence / 100),
  )
  const [skills, setSkills] = useState<DashboardTrade[]>(workerProfile.skills)
  const [verificationFileName, setVerificationFileName] = useState(
    workerProfile.verificationDocumentName,
  )

  useEffect(() => {
    setFullName(profile.fullName)
    setPhoneNumber(profile.phoneNumber)
    setLocation(profile.location)
    setBusinessName(workerProfile.businessName)
    setTagline(workerProfile.tagline)
    setServiceArea(workerProfile.serviceArea)
    setYearsExperience(workerProfile.yearsExperience)
    setHourlyRate(String(workerProfile.hourlyRatePence / 100))
    setSkills(workerProfile.skills)
    setVerificationFileName(workerProfile.verificationDocumentName)
  }, [profile, workerProfile])

  function toggleSkill(skill: DashboardTrade) {
    setSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    )
  }

  function handleSubmit() {
    saveProfile({
      ...profile,
      fullName,
      phoneNumber,
      location,
    })

    registerWorker({
      ...workerProfile,
      isActive: true,
      businessName,
      tagline,
      serviceArea,
      yearsExperience,
      hourlyRatePence: Math.max(0, Math.round(Number(hourlyRate || '0') * 100)),
      skills,
      verificationDocumentName: verificationFileName,
      joinedAt: workerProfile.joinedAt ?? new Date().toISOString(),
    })

    router.push('/dashboard/quotes')
  }

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <HStack gap={3} flexWrap="wrap">
          <Heading size="xl">
            {workerEnabled ? 'Manage worker profile' : 'Become a worker'}
          </Heading>
          {workerEnabled ? (
            <Badge bg="primary.50" color="primary.700">
              Active since{' '}
              {workerProfile.joinedAt
                ? formatDate(workerProfile.joinedAt)
                : 'today'}
            </Badge>
          ) : null}
        </HStack>
        <Text color="muted" maxW="3xl">
          Complete your worker onboarding to unlock quote submission, earnings
          tracking, and the worker-side job dashboard. This page uses local demo
          persistence until the backend worker profile APIs are expanded.
        </Text>
      </Stack>

      <Grid
        templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }}
        gap={6}
        alignItems="start"
      >
        <Stack gap={5}>
          <GlassCard p={{ base: 5, md: 6 }}>
            <Stack gap={4}>
              <HStack gap={3}>
                <Badge>1</Badge>
                <Heading size="md">Basic Information</Heading>
              </HStack>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Stack gap={2}>
                  <Text fontWeight={700}>Full name</Text>
                  <TextInput
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Stack>
                <Stack gap={2}>
                  <Text fontWeight={700}>Phone number</Text>
                  <TextInput
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+44 7000 000000"
                  />
                </Stack>
                <Stack gap={2}>
                  <Text fontWeight={700}>Business name</Text>
                  <TextInput
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Master Craftsman Ltd"
                  />
                </Stack>
                <Stack gap={2}>
                  <Text fontWeight={700}>Service area</Text>
                  <TextInput
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="City or postcode"
                  />
                </Stack>
                <Stack gap={2} gridColumn={{ md: '1 / -1' }}>
                  <Text fontWeight={700}>Tagline</Text>
                  <TextInput
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Trusted repairs, clean finishes, reliable communication."
                  />
                </Stack>
              </Grid>
            </Stack>
          </GlassCard>

          <GlassCard p={{ base: 5, md: 6 }}>
            <Stack gap={4}>
              <HStack gap={3}>
                <Badge>2</Badge>
                <Heading size="md">Select Your Skills</Heading>
              </HStack>
              <Text color="muted" fontSize="sm">
                Choose the categories where you have verified experience.
              </Text>
              <HStack gap={3} flexWrap="wrap">
                {DASHBOARD_TRADE_OPTIONS.map((skill) => {
                  const active = skills.includes(skill)

                  return (
                    <Button
                      key={skill}
                      variant={active ? 'solid' : 'outline'}
                      size="sm"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Button>
                  )
                })}
              </HStack>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Stack gap={2}>
                  <Text fontWeight={700}>Years of experience</Text>
                  <TextInput
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    placeholder="3"
                  />
                </Stack>
                <Stack gap={2}>
                  <Text fontWeight={700}>Target hourly rate</Text>
                  <TextInput
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="45"
                  />
                </Stack>
              </Grid>
            </Stack>
          </GlassCard>

          <GlassCard p={{ base: 5, md: 6 }}>
            <Stack gap={4}>
              <HStack gap={3}>
                <Badge>3</Badge>
                <Heading size="md">Identity Verification</Heading>
              </HStack>
              <Box
                borderRadius="xl"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="primary.200"
                p={6}
                bg="surfaceContainerLow"
              >
                <Stack gap={3} align="center" textAlign="center">
                  <Text fontSize="4xl" aria-hidden>
                    ☁️
                  </Text>
                  <Heading size="sm">Upload Government ID</Heading>
                  <Text fontSize="sm" color="muted" maxW="md">
                    We only store the filename in this demo, but the flow
                    mirrors the production worker verification step.
                  </Text>
                  <ChakraInput
                    type="file"
                    maxW="sm"
                    bg="surfaceContainerLowest"
                    borderColor="border"
                    onChange={(e) =>
                      setVerificationFileName(e.target.files?.[0]?.name ?? '')
                    }
                  />
                  {verificationFileName ? (
                    <Text fontSize="sm" color="primary.700" fontWeight={700}>
                      Selected: {verificationFileName}
                    </Text>
                  ) : null}
                </Stack>
              </Box>
            </Stack>
          </GlassCard>
        </Stack>

        <Stack gap={4} position={{ xl: 'sticky' }} top={{ xl: 4 }}>
          <GlassCard
            p={6}
            bg="linear-gradient(160deg, #1a56db 0%, #244bc5 70%, #1236a8 100%)"
            color="white"
          >
            <Stack gap={4}>
              <Heading size="md" color="white">
                Why join HandyBox?
              </Heading>
              <Stack gap={3}>
                <Text color="whiteAlpha.900">
                  Verified worker badge for trust and faster shortlist ranking.
                </Text>
                <Text color="whiteAlpha.900">
                  Earnings workspace with forecasted payouts and quote tracking.
                </Text>
                <Text color="whiteAlpha.900">
                  Service profile that unlocks quote sending across the
                  platform.
                </Text>
              </Stack>
            </Stack>
          </GlassCard>

          <GlassCard p={6} bg="surfaceContainerLow">
            <Stack gap={4}>
              <Heading size="sm">Final step</Heading>
              <Text fontSize="sm" color="muted">
                By continuing, you save the worker profile locally and unlock
                the dashboard quote + earnings sections immediately.
              </Text>
              <Stack gap={2}>
                <HStack justify="space-between">
                  <Text color="muted" fontSize="sm">
                    Skills selected
                  </Text>
                  <Text fontWeight={700}>{skills.length}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="muted" fontSize="sm">
                    Rate target
                  </Text>
                  <Text fontWeight={700}>
                    {formatPounds(
                      Math.max(0, Math.round(Number(hourlyRate || '0') * 100)),
                    )}
                    /hr
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="muted" fontSize="sm">
                    Verification
                  </Text>
                  <Text fontWeight={700}>
                    {verificationFileName ? 'Attached' : 'Pending'}
                  </Text>
                </HStack>
              </Stack>
              <Button onClick={() => handleSubmit()}>
                {workerEnabled ? 'Update worker profile' : 'Join HandyBox'}
              </Button>
            </Stack>
          </GlassCard>
        </Stack>
      </Grid>
    </Stack>
  )
}
