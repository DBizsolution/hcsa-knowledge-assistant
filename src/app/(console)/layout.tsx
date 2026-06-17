import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ConsoleSidebar } from '@/components/shell/console-sidebar'
import { ConsoleHeader } from '@/components/shell/console-header'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'

// Authenticated console — always render per-request so the signed-in user and
// session are accurate (never served from a build-time static shell).
export const dynamic = 'force-dynamic'

async function getUserEmail(): Promise<string> {
  if (!isSupabaseConfigured) return 'demo.officer@hcsa.gov.pu'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.email ?? 'officer@hcsa.gov.pu'
}

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const email = await getUserEmail()

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-700 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-600"
      >
        Skip to main content
      </a>
      <ConsoleSidebar />
      <SidebarInset className="min-w-0">
        <ConsoleHeader email={email} />
        <main id="main-content" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
