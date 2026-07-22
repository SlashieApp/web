import { Box, Container, Grid, HStack, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import type { Messages } from '@/i18n/getDictionary'

import { Reveal } from '../Reveal'

/** Calm reassurance band — surfaces the payment model plainly, never fee-heavy. */
export function TrustSection({
  messages,
}: {
  messages: Messages['landing']['trust']
}) {
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
          {messages.points.map((point, index) => (
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
