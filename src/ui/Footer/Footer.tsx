'use client'

import {
  Accordion,
  Box,
  type BoxProps,
  Container,
  Grid,
  HStack,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react'
import { type ReactNode, useState } from 'react'
import { LuGithub, LuGlobe, LuLinkedin } from 'react-icons/lu'

import {
  COMPANY_LEGAL_NAME,
  COMPANY_NUMBER,
  COMPANY_REGISTERED_OFFICE,
  LEGAL_CONTACT_EMAIL,
} from '@/content/legal/company'
import { SLASHIE_GITHUB_URL, SLASHIE_LINKEDIN_URL } from '@/content/social'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { LOCALE_LABELS } from '@/i18n/locales'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { openCookieSettings } from '@/utils/analytics'
import { APP_HOME, SAFETY_HREF } from '@/utils/appRoutes'

import { FeedbackTrigger } from '../FeedbackDialog/FeedbackTrigger'
import { Link } from '../Link/Link'
import { Logo } from '../Logo/Logo'
import messages from './i11n.json'

/**
 * SDL site footer (cross-route chrome).
 *
 * - Default: tonal soft-green wash; brand block (tagline, language switch,
 *   the only language control guests have on phones, and social icons),
 *   then Product / Workers / Company / Support / Legal: columns on desktop,
 *   accordions below `lg` (FE-72 redesign). Then the company line.
 * - Minimal: compact copyright + legal row (legal pages, dashboard shells).
 */
export type UiFooterVariant = 'default' | 'minimal'

export type UiFooterProps = Omit<BoxProps, 'children'> & {
  variant?: UiFooterVariant
  /** Override the tagline shown under the brand mark (default variant only). */
  tagline?: string
  /** Override the copyright/meta line. */
  copyright?: string
}

const productHrefs = {
  search: APP_HOME,
  postTask: '/tasks/create',
  howItWorks: '/home#how-it-works',
  pricing: '/pricing',
} as const

const workerHrefs = {
  becomeWorker: '/worker/setup',
  findWorkers: '/workers',
} as const

const legalHrefs = {
  safety: SAFETY_HREF,
  terms: '/terms',
  privacy: '/privacy',
  cookies: '/cookies',
} as const

const linkMotion = {
  transitionProperty: 'color, background-color',
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

const externalLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

function ColumnLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="xs"
      fontWeight={700}
      letterSpacing="0.12em"
      textTransform="uppercase"
      color="text.muted"
      mb={1}
    >
      {children}
    </Text>
  )
}

export function Footer({
  variant = 'default',
  tagline,
  copyright,
  ...boxProps
}: UiFooterProps) {
  const t = useI11n(messages)
  const resolvedTagline = tagline ?? t.tagline
  const resolvedCopyright =
    copyright ?? formatMessage(t.copyright, { year: new Date().getFullYear() })
  const registrationLine = formatMessage(t.registration, {
    company: COMPANY_LEGAL_NAME,
    number: COMPANY_NUMBER,
    office: COMPANY_REGISTERED_OFFICE,
  })
  const locale = useLocale()
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageButton = (
    <FooterLanguageButton
      label={formatMessage(t.language, { name: LOCALE_LABELS[locale].native })}
      onOpen={() => setLanguageOpen(true)}
    />
  )

  const linkItems = (links: readonly { label: string; href: string }[]) =>
    links.map((link) => (
      <FooterLink key={link.href} href={link.href}>
        {link.label}
      </FooterLink>
    ))

  const legalLinks = [
    { label: t.legal.terms, href: legalHrefs.terms },
    { label: t.legal.privacy, href: legalHrefs.privacy },
    { label: t.legal.cookies, href: legalHrefs.cookies },
  ] as const

  const cookieSettings = (
    <FooterLinkButton key="cookie-settings" onClick={openCookieSettings}>
      {t.legal.cookieSettings}
    </FooterLinkButton>
  )

  const groups: FooterGroup[] = [
    {
      key: 'product',
      label: t.columns.product,
      items: linkItems([
        { label: t.product.search, href: productHrefs.search },
        { label: t.product.postTask, href: productHrefs.postTask },
        { label: t.product.howItWorks, href: productHrefs.howItWorks },
        { label: t.product.pricing, href: productHrefs.pricing },
      ]),
    },
    {
      key: 'workers',
      label: t.columns.workers,
      items: linkItems([
        { label: t.workers.becomeWorker, href: workerHrefs.becomeWorker },
        { label: t.workers.findWorkers, href: workerHrefs.findWorkers },
      ]),
    },
    {
      key: 'company',
      label: t.columns.company,
      items: linkItems([
        { label: t.company.about, href: '/about' },
        { label: t.company.contact, href: `mailto:${LEGAL_CONTACT_EMAIL}` },
      ]),
    },
    {
      key: 'support',
      label: t.columns.support,
      items: [
        ...linkItems([{ label: t.legal.safety, href: legalHrefs.safety }]),
        <FeedbackTrigger key="feedback" variant="footer" />,
      ],
    },
    {
      key: 'legal',
      label: t.columns.legal,
      items: [...linkItems(legalLinks), cookieSettings],
    },
  ]

  const socialLinks = [
    { label: t.connect.linkedin, href: SLASHIE_LINKEDIN_URL, icon: LuLinkedin },
    { label: t.connect.github, href: SLASHIE_GITHUB_URL, icon: LuGithub },
  ] as const

  const legalRow = (
    <HStack gap={4} flexWrap="wrap">
      <FeedbackTrigger variant="footerMeta" />
      {[{ label: t.legal.safety, href: legalHrefs.safety }, ...legalLinks].map(
        (link) => (
          <Link
            key={link.href}
            href={link.href}
            tone="muted"
            fontSize="sm"
            color="text.muted"
            {...linkMotion}
          >
            {link.label}
          </Link>
        ),
      )}
      <FooterLinkButton
        onClick={openCookieSettings}
        fontWeight={400}
        color="text.muted"
        minH="auto"
      >
        {t.legal.cookieSettings}
      </FooterLinkButton>
    </HStack>
  )

  return (
    <Box
      as="footer"
      position="relative"
      overflow="hidden"
      bg={variant === 'minimal' ? 'bg.canvas' : 'status.success.soft'}
      borderTopWidth="1px"
      borderColor="border.default"
      py={variant === 'minimal' ? 6 : { base: 10, md: 12 }}
      {...boxProps}
    >
      {variant === 'default' ? (
        <Box
          position="absolute"
          inset={0}
          aria-hidden
          bgImage="radial-gradient(36rem 18rem at 8% 0%, rgba(0, 220, 130, 0.12) 0%, transparent 70%)"
        />
      ) : null}
      <Container
        maxW={PAGE_CONTAINER_MAX_W}
        px={PAGE_GUTTER_X}
        position="relative"
        zIndex={1}
      >
        {variant === 'minimal' ? (
          <Stack gap={3}>
            <HStack
              justify="space-between"
              flexWrap="wrap"
              gap={4}
              fontSize="sm"
              color="text.muted"
            >
              <Text>{resolvedCopyright}</Text>
              {legalRow}
            </HStack>
            <Text fontSize="xs" color="text.muted">
              {registrationLine}
            </Text>
            {/* Legal pages use this variant: keep the language switch. */}
            {languageButton}
          </Stack>
        ) : (
          <Stack gap={{ base: 8, lg: 12 }}>
            <Grid
              templateColumns={{
                base: 'minmax(0, 1fr)',
                lg: 'minmax(0, 1.3fr) repeat(5, minmax(0, 0.75fr))',
              }}
              gap={{ base: 8, lg: 8 }}
              alignItems="flex-start"
            >
              <Stack gap={3} maxW="md">
                <Logo />
                <Text fontSize="sm" color="text.muted" lineHeight="tall">
                  {resolvedTagline}
                </Text>
                <Text fontSize="xs" color="text.muted" lineHeight="tall">
                  {t.openSourceNote}
                </Text>
                {languageButton}
                <HStack gap={1} ml={-2.5}>
                  {socialLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-label={link.label}
                        title={link.label}
                        {...externalLinkProps}
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        boxSize="44px"
                        borderRadius="md"
                        color="text.muted"
                        _hover={{ color: 'text.link', bg: 'bg.surface' }}
                        {...linkMotion}
                      >
                        <Icon size={18} aria-hidden />
                      </Link>
                    )
                  })}
                </HStack>
              </Stack>

              {groups.map((group) => (
                <Box key={group.key} display={{ base: 'none', lg: 'block' }}>
                  <FooterColumn label={group.label}>{group.items}</FooterColumn>
                </Box>
              ))}

              <Accordion.Root
                multiple
                collapsible
                variant="plain"
                display={{ base: 'block', lg: 'none' }}
                borderTopWidth="1px"
                borderColor="border.default"
              >
                {groups.map((group) => (
                  <Accordion.Item
                    key={group.key}
                    value={group.key}
                    borderBottomWidth="1px"
                    borderColor="border.default"
                  >
                    <Accordion.ItemTrigger
                      minH="52px"
                      cursor="pointer"
                      fontSize="sm"
                      fontWeight={700}
                      color="text.default"
                      _focusVisible={sdlFocusRing}
                    >
                      <Text as="span" flex={1} textAlign="start">
                        {group.label}
                      </Text>
                      <Accordion.ItemIndicator color="text.muted" />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                      <Accordion.ItemBody pt={0} pb={3}>
                        <Stack
                          as="nav"
                          aria-label={group.label}
                          gap={0}
                          align="flex-start"
                        >
                          {group.items}
                        </Stack>
                      </Accordion.ItemBody>
                    </Accordion.ItemContent>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </Grid>

            <Stack
              gap={2}
              pt={{ base: 2, md: 1 }}
              borderTopWidth="1px"
              borderColor="border.default"
            >
              <HStack
                justify="space-between"
                flexWrap="wrap"
                gap={3}
                fontSize="sm"
                color="text.muted"
                pt={5}
              >
                <Text>{resolvedCopyright}</Text>
                <Text fontSize="xs" color="text.muted">
                  {registrationLine}
                </Text>
              </HStack>
            </Stack>
          </Stack>
        )}
      </Container>
      <LanguageSwitcher open={languageOpen} onOpenChange={setLanguageOpen} />
    </Box>
  )
}

type FooterGroup = {
  key: string
  label: string
  items: ReactNode[]
}

const FooterButton = chakra('button')

/** A footer action styled like a footer link (Cookie settings). */
function FooterLinkButton({
  onClick,
  children,
  ...props
}: {
  onClick: () => void
  children: ReactNode
} & Pick<BoxProps, 'fontWeight' | 'color' | 'minH'>) {
  return (
    <FooterButton
      type="button"
      onClick={onClick}
      display="inline-flex"
      alignItems="center"
      minH={{ base: '44px', md: 'auto' }}
      fontWeight={600}
      fontSize="sm"
      color="text.default"
      textAlign="start"
      cursor="pointer"
      borderRadius="sm"
      _hover={{ color: 'text.link' }}
      _focusVisible={sdlFocusRing}
      {...linkMotion}
      {...props}
    >
      {children}
    </FooterButton>
  )
}

function FooterColumn({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Stack gap={3} as="nav" aria-label={label}>
      <ColumnLabel>{label}</ColumnLabel>
      <Stack gap={{ base: 0, md: 2.5 }} align="flex-start">
        {children}
      </Stack>
    </Stack>
  )
}

function FooterLink({
  href,
  external = false,
  children,
}: {
  href: string
  external?: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      tone="muted"
      fontWeight={600}
      fontSize="sm"
      color="text.default"
      // 44px tap targets on phones (the stack gap closes on base to match).
      display="inline-flex"
      alignItems="center"
      minH={{ base: '44px', md: 'auto' }}
      {...(external ? externalLinkProps : null)}
      {...linkMotion}
    >
      {children}
    </Link>
  )
}

function FooterLanguageButton({
  label,
  onOpen,
}: {
  label: string
  onOpen: () => void
}) {
  return (
    <chakra.button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      display="inline-flex"
      alignItems="center"
      gap={2}
      alignSelf="flex-start"
      minH="44px"
      px={3}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
      fontSize="sm"
      fontWeight={600}
      color="text.default"
      cursor="pointer"
      _hover={{ bg: 'bg.subtle' }}
      _focusVisible={sdlFocusRing}
      {...linkMotion}
    >
      <LuGlobe size={16} aria-hidden />
      {label}
    </chakra.button>
  )
}
