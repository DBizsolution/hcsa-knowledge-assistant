'use client'

import { Eye, Check, ChevronDown } from 'lucide-react'
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
        <span className="font-bold text-ink-700">{roleLabel(role)}</span>
        <ChevronDown className="size-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between font-normal">
            <span className="text-sm text-muted-foreground">View the app as</span>
            <Badge variant="outline" className="text-xs text-ink-500">
              Demo
            </Badge>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {ROLES.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => setRole(option.id)}
            className="flex-col items-start gap-0.5 py-2"
          >
            <span className="flex w-full items-center gap-2">
              <span className="font-medium text-ink-700">{option.label}</span>
              {role === option.id && (
                <Check className="ml-auto size-4 text-teal-600" />
              )}
            </span>
            <span className="text-xs text-ink-500">{option.blurb}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
