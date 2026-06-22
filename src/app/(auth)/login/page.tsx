import type { Metadata } from 'next'
import { ShieldCheck, Search, FileCheck2 } from 'lucide-react'
import { Brand } from '@/components/shell/brand'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign in' }

const highlights = [
  {
    icon: Search,
    title: 'Search every source at once',
    body: 'Policies, SOPs, email correspondence and reports: one question, one answer.',
  },
  {
    icon: FileCheck2,
    title: 'Answers with citations',
    body: 'Every response is grounded in HCSA documents and traceable to the source passage.',
  },
  {
    icon: ShieldCheck,
    title: 'Stays within your knowledge base',
    body: 'The assistant never invents facts. If it isn’t in HCSA’s records, it says so.',
  },
]

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectedFrom?: string }>
}) {
  const { redirectedFrom } = await searchParams
  const redirectTo =
    redirectedFrom && redirectedFrom.startsWith('/') ? redirectedFrom : '/chat'

  return (
    <div className="grid min-h-[calc(100dvh-2.5rem)] lg:grid-cols-2">
      {/* Brand / value panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/assets/hero-masthead.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative">
          <Brand href="/login" subtitle={false} className="[&_span]:text-white" />
        </div>
        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            The HCSA Knowledge Assistant
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Reduce information retrieval time from hours to seconds with an
            AI-driven assistant grounded in HCSA’s own records.
          </p>
          <ul className="mt-8 space-y-5">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-base text-white/75">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">
          An official Pulau Ulu Government Agency system
        </p>
      </section>

      {/* Login form */}
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand href="/login" />
          </div>
          <h2 className="text-2xl font-bold text-ink-700">Sign in</h2>
          <p className="mt-1 text-base text-muted-foreground">
            Use your HCSA officer account to continue.
          </p>
          <div className="mt-8">
            <LoginForm redirectTo={redirectTo} />
          </div>
          <p className="mt-8 text-center text-sm text-ink-500">
            Need access? Contact your HCSA system administrator.
          </p>
        </div>
      </section>
    </div>
  )
}
