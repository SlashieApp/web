'use client'

import { Box, Text } from '@chakra-ui/react'
import { Suspense } from 'react'

import { ForgotPasswordForm } from './components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
