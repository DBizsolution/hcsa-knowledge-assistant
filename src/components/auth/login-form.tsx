'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({ redirectTo = '/chat' }: { redirectTo?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('demo@hcsa.gov.pu')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!isSupabaseConfigured) {
      toast.info('Demo mode: Supabase is not configured. Opening the console.')
      router.push(redirectTo)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Unable to sign in. Check your credentials.')
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="officer@hcsa.gov.pu"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a
            href="#"
            className="text-sm font-normal text-teal-600 hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="h-11"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full gap-2 bg-primary text-base text-primary-foreground hover:bg-hdb-red-hover"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <Lock className="size-4" />
            Sign in
          </>
        )}
      </Button>

      {!isSupabaseConfigured && (
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-teal-600 hover:underline"
        >
          Continue to demo console
          <ArrowRight className="size-4" />
        </button>
      )}
    </form>
  )
}
