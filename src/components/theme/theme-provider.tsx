'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * Light/dark mode is owned by next-themes (writes the `class` on <html>).
 * Brand colour is a separate dimension owned by use-brand-theme, applied as
 * <html data-theme>. The two compose in globals.css: `[data-theme] {…}` for
 * light, `.dark[data-theme] {…}` for dark.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
