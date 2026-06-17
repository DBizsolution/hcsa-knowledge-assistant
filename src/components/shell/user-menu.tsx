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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate font-normal">
            <span className="block text-sm text-muted-foreground">
              Signed in as
            </span>
            <span className="block truncate font-medium">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />} nativeButton={false}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/guide" />} nativeButton={false}>
          <BookText className="size-4" />
          User guide
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
