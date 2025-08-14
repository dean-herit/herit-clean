import type { Metadata } from 'next'
import { Outfit, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CopyProvider } from '@/providers/CopyProvider'
import { QueryProvider } from '@/providers/QueryProvider'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: 'Herit - Estate Planning Made Simple',
  description: 'Create and manage your will with professional estate planning tools. Secure, legal, and easy to use.',
  keywords: ['estate planning', 'will', 'inheritance', 'legal documents', 'Ireland'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${playfair.variable} font-sans`}>
        <CopyProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </CopyProvider>
      </body>
    </html>
  )
}
