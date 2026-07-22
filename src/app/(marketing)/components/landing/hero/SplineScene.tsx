'use client'

import { Box, Spinner } from '@chakra-ui/react'
import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

type SplineSceneProps = {
  scene: string
  className?: string
  onLoad?: () => void
}

function SplineFallback() {
  return (
    <Box
      w="full"
      h="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.inverted"
    >
      <Spinner size="lg" color="action.primary" borderWidth="2px" />
    </Box>
  )
}

/**
 * Lazy Spline runtime island. Suspense keeps the hero shell responsive while
 * the heavy `.splinecode` payload loads.
 */
export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  return (
    <Suspense fallback={<SplineFallback />}>
      <Box w="full" h="full" className={className}>
        <Spline
          scene={scene}
          onLoad={onLoad}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
    </Suspense>
  )
}
