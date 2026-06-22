import { BRAND_STORAGE_KEY, DEFAULT_BRAND } from '@/lib/brand-themes'

/**
 * Runs before first paint to set <html data-theme> from the persisted brand,
 * so the chosen colour is correct on the very first frame (no flash). Mirrors
 * the read logic in use-brand-theme.
 */
export function BrandThemeScript() {
  const script = `(function(){try{var b=localStorage.getItem(${JSON.stringify(
    BRAND_STORAGE_KEY,
  )});var v=${JSON.stringify(
    ['sgds', 'blue', 'cyan', 'magenta', 'pink', 'purple', 'red'],
  )};document.documentElement.dataset.theme=v.indexOf(b)>-1?b:${JSON.stringify(
    DEFAULT_BRAND,
  )};}catch(e){document.documentElement.dataset.theme=${JSON.stringify(
    DEFAULT_BRAND,
  )};}})();`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
