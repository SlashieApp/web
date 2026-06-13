'use client'

import { Box, Text } from '@chakra-ui/react'
import { Suspense } from 'react'

import { ForgotPasswordSentPanel } from '../components/ForgotPasswordSentPanel'

function ForgotPasswordSentFallback() {
  return (
    <Box minH="40vh" display="flex" alignItems="center" justifyContent="center">
      <Text color="formLabelMuted">Loading…</Text>
    </Box>
  )
}

export default function ForgotPasswordSentPage() {
  return (
    <Suspense fallback={<ForgotPasswordSentFallback />}>
      <ForgotPasswordSentPanel />
    </Suspense>
  )
}
