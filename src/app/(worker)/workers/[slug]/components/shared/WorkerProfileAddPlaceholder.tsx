import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuPlus } from 'react-icons/lu'

import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import { Link } from '@ui'

/**
 * Owner-only dashed "Add …" card shown in place of an empty section,
 * deep-linking back to the setup flow (visitors never see these — empty
 * sections are hidden for them).
 */
export function WorkerProfileAddPlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Link
      href={workerSetupHref()}
      _hover={{ textDecoration: 'none' }}
      display="block"
    >
      <Box
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="border.strong"
        borderRadius="lg"
        bg="bg.surface"
        p={{ base: 4, md: 5 }}
        transitionProperty="border-color, background-color"
        transitionDuration="150ms"
        _hover={{ borderColor: 'action.primary', bg: 'status.success.soft' }}
      >
        <HStack gap={3} align="flex-start">
          <Box
            boxSize="34px"
            borderRadius="full"
            bg="status.success.soft"
            color="status.success.fg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            aria-hidden
          >
            <LuPlus size={16} strokeWidth={2.5} />
          </Box>
          <Stack gap={0.5}>
            <Text fontWeight={700} fontSize="sm" color="text.default">
              {title}
            </Text>
            <Text fontSize="sm" color="text.muted" lineHeight="tall">
              {description}
            </Text>
          </Stack>
        </HStack>
      </Box>
    </Link>
  )
}
