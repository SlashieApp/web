'use client'

import { Grid, HStack, Stack, Textarea } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { useDashboardData } from '@/features/dashboard/DashboardDataContext'
import {
  DASHBOARD_TRADE_OPTIONS,
  type DashboardTrade,
} from '@/features/dashboard/dashboardDemo'
import { Badge, Button, GlassCard, Heading, Text, TextInput } from '@ui'

export default function DashboardProfilePage() {
  const { profile, saveProfile, workerEnabled } = useDashboardData()

  const [fullName, setFullName] = useState(profile.fullName)
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber)
  const [location, setLocation] = useState(profile.location)
  const [bio, setBio] = useState(profile.bio)
  const [preferredTrades, setPreferredTrades] = useState(
    profile.preferredTrades,
  )
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    setFullName(profile.fullName)
    setPhoneNumber(profile.phoneNumber)
    setLocation(profile.location)
    setBio(profile.bio)
    setPreferredTrades(profile.preferredTrades)
  }, [profile])

  function toggleTrade(trade: DashboardTrade) {
    setPreferredTrades((current) =>
      current.includes(trade)
        ? current.filter((item) => item !== trade)
        : [...current, trade],
    )
  }

  function handleSave() {
    saveProfile({
      fullName,
      phoneNumber,
      location,
      bio,
      preferredTrades,
    })
    setSavedMessage('Profile saved in local dashboard demo storage.')
  }

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading size="xl">Profile</Heading>
        <Text color="muted" maxW="3xl">
          Update the personal details shown across your dashboard. These values
          are stored locally for the frontend demo until profile APIs are ready.
        </Text>
      </Stack>

      <Grid templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }} gap={6}>
        <GlassCard p={6}>
          <Stack gap={5}>
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
              <Stack gap={2} gridColumn={{ md: '1 / -1' }}>
                <Text fontWeight={700}>Location</Text>
                <TextInput
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or postcode"
                />
              </Stack>
            </Grid>

            <Stack gap={2}>
              <Text fontWeight={700}>Bio</Text>
              <Textarea
                minH="140px"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Add a short intro that explains how you use HandyBox."
                bg="surfaceContainerLowest"
                borderColor="border"
              />
            </Stack>

            <Stack gap={3}>
              <Text fontWeight={700}>Preferred trades</Text>
              <HStack gap={3} flexWrap="wrap">
                {DASHBOARD_TRADE_OPTIONS.map((trade) => {
                  const active = preferredTrades.includes(trade)

                  return (
                    <Button
                      key={trade}
                      size="sm"
                      variant={active ? 'solid' : 'outline'}
                      onClick={() => toggleTrade(trade)}
                    >
                      {trade}
                    </Button>
                  )
                })}
              </HStack>
            </Stack>

            <HStack gap={3} flexWrap="wrap">
              <Button onClick={() => handleSave()}>Save profile</Button>
              {savedMessage ? (
                <Text fontSize="sm" color="primary.700">
                  {savedMessage}
                </Text>
              ) : null}
            </HStack>
          </Stack>
        </GlassCard>

        <GlassCard p={6} bg="surfaceContainerLow">
          <Stack gap={4}>
            <Heading size="md">Account summary</Heading>
            <HStack justify="space-between">
              <Text color="muted">Mode</Text>
              <Badge
                bg={workerEnabled ? 'primary.50' : 'surfaceContainerHigh'}
                color={workerEnabled ? 'primary.700' : 'fg'}
              >
                {workerEnabled ? 'Worker unlocked' : 'Customer only'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text color="muted">Preferred trades</Text>
              <Text fontWeight={700}>{preferredTrades.length}</Text>
            </HStack>
            <Text fontSize="sm" color="muted">
              Your saved profile details feed the dashboard overview and worker
              registration flow, making the FE demo feel consistent even when
              the backend profile schema is still minimal.
            </Text>
          </Stack>
        </GlassCard>
      </Grid>
    </Stack>
  )
}
