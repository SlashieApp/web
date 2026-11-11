'use client'

import { Box, chakra } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { LuArrowRight, LuPencilLine } from 'react-icons/lu'

import {
  START_TITLE_MAX_LENGTH,
  createTaskPathWithTitle,
} from '@/app/(stepflow)/tasks/create/helpers/createTaskStartTitle'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { Button, Input } from '@ui'

import { type LandingSession, landingCtaPath } from '../sections/landingCtaPath'

const HeroTaskForm = chakra('form')

type HeroTaskCtaProps = {
  placeholder: string
  submitLabel: string
  ariaLabel: string
  /** A visitor with a session skips sign-up. Default: a guest. */
  session?: LandingSession
}

/** Height of the hero's pill (tone refresh, train 2, hero). */
const HERO_TASK_HEIGHT = '52px'

/**
 * Post a task with what was typed as its title (`createTaskPathWithTitle`).
 * A guest has no account yet, so like every "Post a task" on the landing it
 * goes by `/register?next=` and the title rides in `next`; a visitor with a
 * session goes straight to the form (`landingCtaPath`).
 */
export function heroTaskHref(
  typed: string,
  session: LandingSession = 'guest',
): string {
  return landingCtaPath(createTaskPathWithTitle(typed), session)
}

/**
 * The hero's action (FE-542): say what you need done, then Post a task. One
 * 52px pill (the `Input` primitive's search shape: a 1px `border.strong`
 * hairline that steps to `border.hover` and, on focus, to the green 600
 * `border.focus` ring) with the green Post a task pill inside it, on the
 * right. The placeholder is `text.subtle`. Submitting goes to sign-up and on
 * to Post a task (straight to it with a session), which starts with the typed
 * text as the task's title; empty goes to the same place with no title. The
 * green pill is the one green fill in the hero, and carries the
 * `data-page-green-action` hook the header watches.
 */
export function HeroTaskCta({
  placeholder,
  submitLabel,
  ariaLabel,
  session = 'guest',
}: HeroTaskCtaProps) {
  const router = useRouter()
  const localize = useLocalizedHref()
  const [typed, setTyped] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push(localize(heroTaskHref(typed, session)))
  }

  return (
    <HeroTaskForm onSubmit={onSubmit} w="full" maxW="34rem">
      <Input
        pill
        name="title"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        enterKeyHint="go"
        maxLength={START_TITLE_MAX_LENGTH}
        startElement={
          // Below 375px (a 360px Android, a 320px phone) the pencil gives its
          // room to the placeholder, which would otherwise lose its end.
          <Box
            color="text.subtle"
            aria-hidden
            css={{
              display: 'flex',
              '@media (max-width: 374px)': { display: 'none' },
            }}
          >
            <LuPencilLine size={18} />
          </Box>
        }
        endElement={
          <Button
            type="submit"
            size="md"
            variant="primary"
            // The page's green action: the header's Get started gives way
            // while this pill is on screen (`pageGreenWatch`).
            data-page-green-action=""
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
          minH: HERO_TASK_HEIGHT,
          // The green pill sits a hair inside the hairline; a phone gives the
          // placeholder the few pixels it needs to show whole.
          pl: { base: 3, md: 4 },
          pr: '3px',
          boxShadow: 'e1',
        }}
      />
    </HeroTaskForm>
  )
}
