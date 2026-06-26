'use client'

import type { ReactElement } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PERSONAS, type PersonaId } from '@/lib/personas'

/**
 * The shared agent picker — the same list and behaviour drive both the header
 * selector and the in-composer one, so they always mirror each other. Callers
 * supply their own trigger element and placement.
 */
export function PersonaMenu({
  persona,
  onChange,
  trigger,
  align = 'start',
  side,
}: {
  persona: PersonaId
  onChange: (persona: PersonaId) => void
  trigger: ReactElement
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom'
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align={align} side={side} className="w-80 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs leading-relaxed text-ink-500">
            Choose an agent: answers stay within its authorised scope
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {PERSONAS.map((item) => {
          const Icon = item.icon
          const selected = item.id === persona
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={() => onChange(item.id)}
              className="items-start gap-3 px-2 py-2.5"
            >
              <span
                className={cn(
                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                  item.chipClass,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-medium text-ink-700">{item.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                  {item.blurb}
                </span>
              </span>
              <Check
                className={cn(
                  'mt-1 size-4 shrink-0 text-primary transition-opacity',
                  selected ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden
              />
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
