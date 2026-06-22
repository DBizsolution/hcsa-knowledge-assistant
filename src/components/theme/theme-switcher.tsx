'use client'

import { useTheme } from 'next-themes'
import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND_THEMES, brandLabel } from '@/lib/brand-themes'
import { useBrandTheme } from '@/lib/use-brand-theme'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MODES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
] as const

export function ThemeSwitcher() {
  const { brand, setBrand } = useBrandTheme()
  const { theme = 'system', setTheme } = useTheme()
  const active = BRAND_THEMES.find((option) => option.id === brand)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Change theme colour"
          />
        }
      >
        <Palette className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-3">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-1 pb-1 pt-0 font-normal">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Brand colour
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <div className="grid grid-cols-4 gap-2 px-1 pb-1">
          {BRAND_THEMES.map((option) => {
            const selected = brand === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setBrand(option.id)}
                aria-label={option.label}
                aria-pressed={selected}
                className="group flex flex-col items-center gap-1.5 rounded-lg py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-popover transition-all',
                    selected
                      ? 'ring-2 ring-foreground/70'
                      : 'ring-0 group-hover:ring-2 group-hover:ring-border',
                  )}
                  style={{ backgroundColor: option.swatch }}
                >
                  {selected && (
                    <Check className="size-4 text-white" strokeWidth={3} />
                  )}
                </span>
                <span
                  className={cn(
                    'text-xs leading-none',
                    selected
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-1 pb-1.5 pt-1 font-normal">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Appearance
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <div className="grid grid-cols-3 gap-1.5 px-1 pb-0.5">
          {MODES.map((mode) => {
            const selected = theme === mode.id
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTheme(mode.id)}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {mode.label}
              </button>
            )
          })}
        </div>
        <span className="sr-only" aria-live="polite">
          {active ? `${brandLabel(active.id)} theme active` : ''}
        </span>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
