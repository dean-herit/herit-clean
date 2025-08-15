import type { Metadata } from 'next'
// import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CopyProvider } from '@/providers/CopyProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

// Temporarily disabled due to Google Fonts connectivity issues
// const inter = Inter({ 
//   subsets: ['latin'],
//   variable: '--font-inter'
// })

// const playfair = Playfair_Display({ 
//   subsets: ['latin'],
//   variable: '--font-playfair'
// })

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
      <body className="font-sans">
        <ThemeProvider>
          <CopyProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </CopyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
