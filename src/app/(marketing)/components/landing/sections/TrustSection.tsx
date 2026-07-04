import { Box, Container, Grid, HStack, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import { Reveal } from '../Reveal'

const TRUST_POINTS = [
  'Payment is arranged directly between customer and worker',
  'Slashie never holds or releases job money',
  'Verified worker profiles and honest reviews',
  'A local marketplace — real people, real jobs nearby',
] as const

/** Calm reassurance band — surfaces the payment model plainly, never fee-heavy. */
export function TrustSection() {
  return (
    <Box as="section" bg="status.success.soft" py={{ base: 10, md: 12 }}>
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
        <Grid
          templateColumns={{
            base: '1fr',
            sm: '1fr 1fr',
            lg: 'repeat(4, 1fr)',
          }}
          gap={5}
        >
          {TRUST_POINTS.map((point, index) => (
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
                  fontWeight={600}
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
