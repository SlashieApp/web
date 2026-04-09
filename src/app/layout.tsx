import { Box } from '@chakra-ui/react'
import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Dock, Header } from '@ui'
import { Providers } from './providers'
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Slashie',
  description: 'Local trades and home tasks marketplace',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakartaSans.variable}`}
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Providers>
          <Header />
          <Box flex={1} position="relative">
            {children}
          </Box>
          <Dock />
        </Providers>
      </body>
    </html>
  )
}
