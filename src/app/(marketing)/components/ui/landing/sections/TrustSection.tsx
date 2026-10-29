import { Box, Container, Grid, HStack, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'
import { Reveal } from '../Reveal'

/**
 * Calm reassurance panel: surfaces the payment model plainly, never
 * fee-heavy. A white card on the transparent landing so the 3D objects
 * drift past around it.
 */
export function TrustSection({ points }: { points: readonly string[] }) {
  return (
    <Box as="section" py={SECTION_PY}>
      <Container>
        <Grid
          p={{ base: 6, md: 8 }}
          bg="bg.surface"
          borderRadius="2xl"
          boxShadow="e3"
          templateColumns={{
            base: '1fr',
            sm: '1fr 1fr',
            lg: 'repeat(4, 1fr)',
          }}
          gap={5}
        >
          {points.map((point, index) => (
            <Reveal key={point} delayMs={index * 70}>
              <HStack gap={3} align="flex-start">
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="20px"
                  borderRadius="full"
                  bg="action.primary"
                  color="text.onGreen"
                  flexShrink={0}
                  mt="2px"
                  aria-hidden
                >
                  <LuCheck size={12} strokeWidth={3} />
                </Box>
                <Text
                  fontSize="sm"
                  fontWeight={500}
                  color="text.default"
                  lineHeight="tall"
                >
                  {point}
                </Text>
              </HStack>
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
