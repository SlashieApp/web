import { Suspense } from 'react'

import { Box } from '@chakra-ui/react'

import { WorkerSetupAuthGate } from './components/WorkerSetupAuthGate'
import { WorkerSetupScreen } from './components/WorkerSetupScreen'
import { WorkerSetupProvider } from './context/WorkerSetupProvider'

export default function WorkerSetupPage() {
  return (
    <Suspense fallback={<Box minH="100dvh" bg="neutral.100" />}>
      <WorkerSetupAuthGate>
        <WorkerSetupProvider>
          <WorkerSetupScreen />
        </WorkerSetupProvider>
      </WorkerSetupAuthGate>
    </Suspense>
  )
}
