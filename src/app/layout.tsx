import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CopyProvider } from '@/providers/CopyProvider'
import { QueryProvider } from '@/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <CopyProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </CopyProvider>
      </body>
    </html>
  )
}
