/**
 * Brand colour themes — the GovTech / SGDS palette the demo can switch between.
 * Each theme is a `data-theme` value on <html>; the actual colour ramps live in
 * globals.css. `swatch` is only used to paint the picker dots, so it stays a
 * fixed representative hex (independent of the active theme).
 */

export type BrandTheme = {
  id: string
  label: string
  swatch: string
}

export const BRAND_THEMES: BrandTheme[] = [
  { id: 'sgds', label: 'SGDS', swatch: '#6b4feb' },
  { id: 'blue', label: 'Blue', swatch: '#4288d6' },
  { id: 'cyan', label: 'Cyan', swatch: '#0091b8' },
  { id: 'magenta', label: 'Magenta', swatch: '#c95eb7' },
  { id: 'pink', label: 'Pink', swatch: '#e54d8c' },
  { id: 'purple', label: 'Purple', swatch: '#9a74cf' },
  { id: 'red', label: 'Red', swatch: '#f5424b' },
]

export const DEFAULT_BRAND: BrandTheme['id'] = 'cyan'

export const BRAND_STORAGE_KEY = 'hcsa-brand-theme'

export function brandLabel(id: string): string {
  return BRAND_THEMES.find((theme) => theme.id === id)?.label ?? id
}

export function isBrandTheme(value: unknown): value is string {
  return (
    typeof value === 'string' && BRAND_THEMES.some((theme) => theme.id === value)
  )
}
