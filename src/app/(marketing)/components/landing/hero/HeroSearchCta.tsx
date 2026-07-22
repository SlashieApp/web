'use client'

import { Box, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { LuArrowRight, LuSearch } from 'react-icons/lu'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { getAuthToken } from '@/utils/auth'
import {
  buildCreateTaskHandoffPath,
  buildRegisterHandoffPath,
} from '@/utils/taskHandoff'
import { Button, Input } from '@ui'

type HeroSearchCtaProps = {
  placeholder: string
  submitLabel: string
  ariaLabel: string
}

/**
 * Primary hero conversion control: a search bar that hands the typed intent
 * into the post-task funnel (create when signed in, register→create when guest).
 */
export function HeroSearchCta({
  placeholder,
  submitLabel,
  ariaLabel,
}: HeroSearchCtaProps) {
  const router = useRouter()
  const localize = useLocalizedHref()
  const [query, setQuery] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const createPath = buildCreateTaskHandoffPath(query)
    const target = getAuthToken()
      ? createPath
      : buildRegisterHandoffPath(createPath)
    router.push(localize(target))
  }

  return (
    <Box
      as="form"
      onSubmit={onSubmit}
      w="full"
      maxW="34rem"
      role="search"
      aria-label={ariaLabel}
    >
      <HStack
        gap={2}
        align="stretch"
        p={{ base: 1.5, md: 2 }}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.glass"
        bg="bg.glass"
        boxShadow="0 0 0 1px rgba(0, 220, 130, 0.08)"
        _focusWithin={{
          borderColor: 'action.primary',
          boxShadow: '0 0 0 1px {colors.action.primary}',
        }}
      >
        <Input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
          enterKeyHint="go"
          startElement={
            <Box color="text.onInvertedMuted" display="flex" aria-hidden>
              <LuSearch size={18} />
            </Box>
          }
          rootProps={{
            flex: 1,
            minH: { base: '48px', md: '52px' },
            borderWidth: 0,
            bg: 'transparent',
            boxShadow: 'none',
            px: 2,
            _hover: { borderColor: 'transparent' },
            _focusWithin: { borderColor: 'transparent', boxShadow: 'none' },
          }}
          color="text.onInverted"
          _placeholder={{ color: 'text.onInvertedMuted' }}
          css={{
            '&::placeholder': { color: 'var(--chakra-colors-text-on-inverted-muted)' },
          }}
        />
        <Button
          type="submit"
          size="lg"
          variant="primary"
          flexShrink={0}
          minH={{ base: '48px', md: '52px' }}
          px={{ base: 4, md: 5 }}
          gap={2}
          aria-label={submitLabel}
        >
          <Box as="span" display={{ base: 'none', sm: 'inline' }}>
            {submitLabel}
          </Box>
          <LuArrowRight size={18} aria-hidden />
        </Button>
      </HStack>
    </Box>
  )
}
