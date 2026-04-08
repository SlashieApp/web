'use client'

import { Grid, HStack, Stack, Textarea } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { getDisplayNameFromEmail } from '@/utils/dashboardHelpers'
import {
  DASHBOARD_TRADE_OPTIONS,
  type DashboardTrade,
} from '@/utils/dashboardTypes'
import { Badge, Button, GlassCard, Heading, Text, TextInput } from '@ui'
import { useCustomerAccount } from '../context'

export default function CustomerProfilePage() {
  const { me } = useCustomerAccount()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [preferredTrades, setPreferredTrades] = useState<DashboardTrade[]>([])
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    if (!me?.email) return
    setFullName((prev) =>
      prev.trim() === '' ? getDisplayNameFromEmail(me.email) : prev,
    )
  }, [me?.email])

  function toggleTrade(trade: DashboardTrade) {
    setPreferredTrades((current) =>
      current.includes(trade)
        ? current.filter((item) => item !== trade)
        : [...current, trade],
    )
  }

  function handleSave() {
    setSavedMessage(
      'Saved for this browser session. Connect profile APIs to sync across devices.',
    )
  }

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading size="xl">Your profile</Heading>
        <Text color="muted" maxW="3xl">
          Customer account details. Your email comes from your login; other
          fields are kept in this session until backend profile APIs are wired.
        </Text>
      </Stack>

      <Grid templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }} gap={6}>
        <GlassCard p={6}>
          <Stack gap={5}>
            <Stack gap={1}>
              <Text fontWeight={700}>Email</Text>
              <Text color="muted">{me?.email ?? '—'}</Text>
            </Stack>

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
                placeholder="A short note for taskers who quote on your tasks."
                bg="surfaceContainerLowest"
                borderColor="border"
              />
            </Stack>

            <Stack gap={3}>
              <Text fontWeight={700}>Preferred trades</Text>
              <Text fontSize="sm" color="muted">
                Helps us prioritise relevant tasks in your feed (optional).
              </Text>
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
              <Button onClick={handleSave}>Save</Button>
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
            <Heading size="md">Customer account</Heading>
            <HStack justify="space-between">
              <Text color="muted">Role</Text>
              <Badge bg="surfaceContainerHigh" color="fg">
                Job poster
              </Badge>
            </HStack>
            <Text fontSize="sm" color="muted">
              Worker tools and earnings live in your dashboard after you
              complete worker setup.
            </Text>
          </Stack>
        </GlassCard>
      </Grid>
    </Stack>
  )
}
