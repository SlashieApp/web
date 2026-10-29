'use client'

import { Box, chakra } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { LuArrowRight, LuSearch } from 'react-icons/lu'

import { buildSearchUrl } from '@/app/(task)/search/helpers/searchQueryParams'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { Button, Input } from '@ui'

const HeroSearchForm = chakra('form')

type HeroSearchCtaProps = {
  placeholder: string
  submitLabel: string
  ariaLabel: string
}

/** Height of the search pill (tone refresh, train 2, hero). */
const HERO_SEARCH_HEIGHT = '52px'

/**
 * Hero search: one 52px pill (the `Input` primitive's search shape: a 1px
 * `border.strong` hairline that steps to `border.hover` and, on focus, to the
 * green 600 `border.focus` ring) with the green Search pill inside it, on the
 * right. The placeholder is `text.subtle`. Submitting opens /search with the
 * typed text as its query (`?q=`). The Search pill is the one green fill in
 * the hero.
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
    const taskSearchText = query.trim() || undefined
    router.push(localize(buildSearchUrl({ taskSearchText })))
  }

  return (
    <HeroSearchForm onSubmit={onSubmit} w="full" maxW="34rem">
      <Input
        pill
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        enterKeyHint="go"
        startElement={
          <Box color="text.subtle" display="flex" aria-hidden>
            <LuSearch size={18} />
          </Box>
        }
        endElement={
          <Button
            type="submit"
            size="md"
            variant="primary"
            px={{ base: 3.5, md: 5 }}
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
        }
        rootProps={{
          minH: HERO_SEARCH_HEIGHT,
          // The Search pill sits a hair inside the hairline; a phone gives the
          // placeholder the few pixels it needs to show whole.
          pl: { base: 3, md: 4 },
          pr: '3px',
          boxShadow: 'e1',
        }}
      />
    </HeroSearchForm>
  )
}
