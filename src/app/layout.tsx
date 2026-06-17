import type { Metadata } from 'next'
import { Hanken_Grotesk } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const hanken = Hanken_Grotesk({
  variable: '--font-hanken',
  subsets: ['latin'],
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
    <html lang="en" className={`${hanken.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
