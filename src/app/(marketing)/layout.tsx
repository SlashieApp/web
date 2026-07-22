import { Box } from '@chakra-ui/react'

import { getDictionary, getRequestLocale } from '@/i18n/getDictionary'

import { MarketingHeader } from './components/MarketingHeader'

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getRequestLocale()
  const messages = getDictionary(locale)

  return (
    <Box
      bg="bg.subtle"
      color="text.default"
      minH="100dvh"
      display="flex"
      flexDirection="column"
    >
      {/* MarketingHeader renders the keyboard skip link (-> #main-content)
          as the page's first tab stop. */}
      <MarketingHeader
        ctas={messages.common.ctas}
        initialLocale={locale}
        messages={messages.header}
      />
      {/* No `mx="auto"`: an auto cross-axis margin stops flex stretching and
          collapses main to max-content width, breaking full-bleed sections. */}
      <Box as="main" id="main-content" flex={1} w="full">
        {children}
      </Box>
    </Box>
  )
}
