import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { htmlLang } from '@/i18n/locales'
import { BRAND_PRIMARY } from '@/theme/brand'
import { Providers } from './providers'

// The variables go on <html>, not <body>: Chakra resolves its font tokens
// (`--chakra-fonts-body`, `-heading`, `-display`, `-mono`) on <html> (FE-468).
const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  // Absolute base for canonical/og URLs + the opengraph-image route.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      'https://slashie.app',
  ),
  title: 'Slashie App - Local Trades and Home Tasks Marketplace',
  description:
    'Slashie is a local trades and home tasks marketplace that connects homeowners with skilled professionals for home repairs, maintenance, and improvements.',
  manifest: '/manifest.json',
}

// App Router requires themeColor in the viewport export (a metadata-export
// themeColor is warned about and silently dropped by Next 15+).
export const viewport: Viewport = {
  themeColor: BRAND_PRIMARY,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getRequestLocale()

  return (
    <html
      lang={htmlLang(locale)}
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
