import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceKite',
  description: 'Financial management for solopreneurs and small businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}

/*
📘 Why suppressHydrationWarning on <html>? 
The theme provider adds a class attribute to the <html> element to toggle dark/light mode. 
This causes a mismatch between server-rendered HTML and client-rendered HTML because the server doesn't know the user's theme preference. 
suppressHydrationWarning tells React to ignore this specific mismatch — it's the officially recommended fix for theme providers.
*/