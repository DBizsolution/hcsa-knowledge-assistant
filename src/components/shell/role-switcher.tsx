'use client'

import { Eye, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLES, roleLabel } from '@/lib/roles'
import { useRole } from '@/lib/use-role-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function RoleSwitcher() {
  const { role, setRole } = useRole()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-9 gap-2 text-ink-600"
            aria-label="Switch demo role"
          />
        }
      >
        <Eye className="size-4" />
        <span className="hidden sm:inline">Viewing as</span>
        <span className="hidden font-bold text-ink-700 sm:inline">
          {roleLabel(role)}
        </span>
        <ChevronDown className="hidden size-4 opacity-60 sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5 font-normal">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              View the app as
            </span>
            <Badge variant="outline" className="text-xs text-ink-500">
              Demo
            </Badge>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-1 pt-1">
          {ROLES.map((option) => {
            const selected = role === option.id
            return (
              <DropdownMenuItem
                key={option.id}
                onClick={() => setRole(option.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-2.5 py-3',
                  selected && 'bg-teal-50 focus:bg-teal-50',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                    selected
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-ink-300 text-transparent',
                  )}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span
                    className={cn(
                      'text-sm leading-none',
                      selected
                        ? 'font-bold text-teal-800'
                        : 'font-semibold text-ink-700',
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="text-xs leading-snug text-ink-500">
                    {option.blurb}
                  </span>
                </span>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
