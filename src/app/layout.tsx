import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { BrandThemeScript } from '@/components/theme/brand-theme-script'
import './globals.css'

// SGDS uses Inter across body + headings (weights 300/400/600/700).
const inter = Inter({
  variable: '--font-sgds',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'HCSA Knowledge Assistant',
    template: '%s · HCSA Knowledge Assistant',
  },
  description:
    'AI-driven LLM knowledge management assistant for the Housing, Construction & Sustainability Authority (HCSA).',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <BrandThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
