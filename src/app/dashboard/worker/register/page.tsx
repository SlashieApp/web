'use client'

import {
  Box,
  Grid,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { useDashboardData } from '@/app/dashboard/context'
import { formatDate, formatPounds } from '@/utils/dashboardHelpers'
import {
  DASHBOARD_TRADE_OPTIONS,
  type DashboardTrade,
} from '@/utils/dashboardTypes'
import { Badge, Button } from '@ui'

export default function WorkerRegistrationPage() {
  const router = useRouter()
  const {
    profile,
    workerProfile,
    registerWorker,
    saveProfile,
    workerProfileComplete,
  } = useDashboardData()

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

  const prevProfileRef = useRef(profile)
  const prevWorkerProfileRef = useRef(workerProfile)
  if (
    profile !== prevProfileRef.current ||
    workerProfile !== prevWorkerProfileRef.current
  ) {
    prevProfileRef.current = profile
    prevWorkerProfileRef.current = workerProfile
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
  }

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
            {workerProfileComplete
              ? 'Manage worker profile'
              : 'Become a worker'}
          </Heading>
          {workerProfileComplete ? (
            <Badge bg="primary.50" color="primary.700">
              Active since{' '}
              {workerProfile.joinedAt
                ? formatDate(workerProfile.joinedAt)
                : 'today'}
            </Badge>
          ) : null}
        </HStack>
        <Text color="formLabelMuted" maxW="3xl">
          Complete worker onboarding to unlock quote submission and earnings
          tools in your dashboard. This flow is stored in your browser session
          until dedicated worker profile APIs ship.
        </Text>
      </Stack>

      <Grid
        templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }}
        gap={6}
        alignItems="start"
      >
        <Stack gap={5}>
          <Box p={{ base: 5, md: 6 }}>
            <Stack gap={4}>
              <HStack gap={3}>
                <Badge>1</Badge>
                <Heading size="md">Basic Information</Heading>
              </HStack>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Stack gap={2}>
                  <Text fontWeight={700}>Full name</Text>
                  <Input
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFullName(e.target.value)
                    }
                    bg="neutral.100"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="formControlBorder"
                  />
                </Stack>
                <Stack gap={2}>
                  <Text fontWeight={700}>Phone number</Text>
                  <Input
                    value={phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPhoneNumber(e.target.value)
                    }
                    placeholder="+44 7000 000000"
                    bg="neutral.100"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="formControlBorder"
                  />
                </Stack>
                <Stack gap={2}>
                  <Text fontWeight={700}>Business name</Text>
                  <Input
                    value={businessName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBusinessName(e.target.value)
                    }
                    placeholder="Master Craftsman Ltd"
                    bg="neutral.100"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="formControlBorder"
                  />
                </Stack>
                <Stack gap={2}>
                  <Text fontWeight={700}>Service area</Text>
                  <Input
                    value={serviceArea}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setServiceArea(e.target.value)
                    }
                    placeholder="City or postcode"
                    bg="neutral.100"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="formControlBorder"
                  />
                </Stack>
                <Stack gap={2} gridColumn={{ md: '1 / -1' }}>
                  <Text fontWeight={700}>Tagline</Text>
                  <Input
                    value={tagline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTagline(e.target.value)
                    }
                    placeholder="Trusted repairs, clean finishes, reliable communication."
                    bg="neutral.100"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="formControlBorder"
                  />
                </Stack>
              </Grid>
            </Stack>
          </Box>

          <Box p={{ base: 5, md: 6 }}>
            <Stack gap={4}>
              <HStack gap={3}>
                <Badge>2</Badge>
                <Heading size="md">Select Your Skills</Heading>
              </HStack>
              <Text color="formLabelMuted" fontSize="sm">
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
                  <Input
                    value={yearsExperience}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setYearsExperience(e.target.value)
                    }
                    placeholder="3"
                    bg="neutral.100"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="formControlBorder"
                  />
                </Stack>
                <Stack gap={2}>
                  <Text fontWeight={700}>Target hourly rate</Text>
                  <Input
                    value={hourlyRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setHourlyRate(e.target.value)
                    }
                    placeholder="45"
                    bg="neutral.100"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="formControlBorder"
                  />
                </Stack>
              </Grid>
            </Stack>
          </Box>

          <Box p={{ base: 5, md: 6 }}>
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
                bg="cardBg"
              >
                <Stack gap={3} align="center" textAlign="center">
                  <Text fontSize="4xl" aria-hidden>
                    ☁️
                  </Text>
                  <Heading size="sm">Upload Government ID</Heading>
                  <Text fontSize="sm" color="formLabelMuted" maxW="md">
                    Filename only for now; production will handle secure ID
                    checks.
                  </Text>
                  <Input
                    type="file"
                    maxW="sm"
                    bg="neutral.100"
                    borderColor="cardBorder"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
          </Box>
        </Stack>

        <Stack gap={4} position={{ xl: 'sticky' }} top={{ xl: 4 }}>
          <Box
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
          </Box>

          <Box p={6} bg="cardBg">
            <Stack gap={4}>
              <Heading size="sm">Final step</Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Continuing unlocks quoting and earnings in this browser session.
              </Text>
              <Stack gap={2}>
                <HStack justify="space-between">
                  <Text color="formLabelMuted" fontSize="sm">
                    Skills selected
                  </Text>
                  <Text fontWeight={700}>{skills.length}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="formLabelMuted" fontSize="sm">
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
                  <Text color="formLabelMuted" fontSize="sm">
                    Verification
                  </Text>
                  <Text fontWeight={700}>
                    {verificationFileName ? 'Attached' : 'Pending'}
                  </Text>
                </HStack>
              </Stack>
              <Button onClick={() => handleSubmit()}>
                {workerProfileComplete
                  ? 'Update worker profile'
                  : 'Join HandyBox'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Grid>
    </Stack>
  )
}
