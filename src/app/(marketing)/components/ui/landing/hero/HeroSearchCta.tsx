'use client'

import { Box, HStack, chakra } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { LuArrowRight, LuSearch } from 'react-icons/lu'

const HeroSearchForm = chakra('form')

import { buildSearchUrl } from '@/app/(task)/search/helpers/searchQueryParams'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { Button, Input } from '@ui'

type HeroSearchCtaProps = {
  placeholder: string
  submitLabel: string
  ariaLabel: string
}

/** Hero search: opens /search with the typed text as its query (`?q=`). */
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
    const taskSearchText = query.trim() || undefined
    router.push(localize(buildSearchUrl({ taskSearchText })))
  }

  return (
    <HeroSearchForm onSubmit={onSubmit} w="full" maxW="34rem">
      <HStack
        gap={2}
        align="stretch"
        p={{ base: 1.5, md: 2 }}
        borderRadius="full"
        bg="bg.surface"
        boxShadow="e3"
        _focusWithin={{
          outline: '2px solid',
          outlineColor: 'border.focus',
          boxShadow: 'e4',
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
            <Box color="text.muted" display="flex" aria-hidden>
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
          color="text.default"
          _placeholder={{ color: 'text.muted' }}
        />
        <Button
          type="submit"
          size="lg"
          variant="primary"
          flexShrink={0}
          minH={{ base: '48px', md: '52px' }}
          px={{ base: 3.5, md: 5 }}
          gap={2}
          aria-label={submitLabel}
        >
          {submitLabel}
          <Box
            as="span"
            display={{ base: 'none', sm: 'inline-flex' }}
            aria-hidden
          >
            <LuArrowRight size={18} />
          </Box>
        </Button>
      </HStack>
    </HeroSearchForm>
  )
}
