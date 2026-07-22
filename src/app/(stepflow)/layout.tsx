import { Box } from '@chakra-ui/react'

/**
 * StepFlow shell — focused multi-step routes only.
 * Does not mount app Header/Dock; each page owns chrome via StepFlowLayout.
 */
export default function StepFlowLayoutRoute({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Box minH="100dvh" bg="bg.subtle" display="flex" flexDirection="column">
      {children}
    </Box>
  )
}
