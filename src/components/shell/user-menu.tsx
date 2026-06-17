'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, BookText } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function initials(email: string) {
  const name = email.split('@')[0]
  return name.slice(0, 2).toUpperCase()
}

export function UserMenu({ email }: { email: string }) {
  const router = useRouter()

  async function handleSignOut() {
    if (!isSupabaseConfigured) {
      router.push('/login')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Could not sign out. Please try again.')
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto gap-2 px-2 py-1.5"
            aria-label="Account menu"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-teal-800 text-sm text-white">
            {initials(email)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{email}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate px-2 py-1.5 font-normal">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Signed in as
            </span>
            <span className="mt-1 block truncate text-sm font-semibold text-ink-700">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-0.5 pt-1">
          <DropdownMenuItem
            render={<Link href="/profile" />}
            nativeButton={false}
            className="gap-2.5 rounded-lg px-2.5 py-2 font-medium text-ink-700"
          >
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/guide" />}
            nativeButton={false}
            className="gap-2.5 rounded-lg px-2.5 py-2 font-medium text-ink-700"
          >
            <BookText className="size-4" />
            User guide
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleSignOut}
            className="gap-2.5 rounded-lg px-2.5 py-2 font-medium text-hdb-red focus:bg-[color-mix(in_oklch,var(--hdb-red),white_90%)] focus:text-hdb-red"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
