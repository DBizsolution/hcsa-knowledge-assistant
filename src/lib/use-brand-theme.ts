'use client'

import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import {
  BRAND_STORAGE_KEY,
  DEFAULT_BRAND,
  isBrandTheme,
} from './brand-themes'

type BrandStore = {
  brand: string
  setBrand: (brand: string) => void
}

function applyBrand(brand: string) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = brand
}

function readStoredBrand(): string {
  if (typeof window === 'undefined') return DEFAULT_BRAND
  const stored = window.localStorage.getItem(BRAND_STORAGE_KEY)
  return isBrandTheme(stored) ? stored : DEFAULT_BRAND
}

/**
 * Active brand colour theme. Mirrors to a plain localStorage key (read by the
 * pre-paint inline script in the root layout, so the chosen colour is applied
 * before first paint with no flash) and to the <html data-theme> attribute.
 */
export const useBrandStore = create<BrandStore>((set) => ({
  brand: readStoredBrand(),
  setBrand: (brand) => {
    if (!isBrandTheme(brand)) return
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BRAND_STORAGE_KEY, brand)
    }
    applyBrand(brand)
    set({ brand })
  },
}))

const emptySubscribe = () => () => {}

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

/**
 * SSR-safe read of the active brand. Returns DEFAULT_BRAND until mounted so the
 * server markup matches first client paint, then the stored brand takes over.
 */
export function useBrandTheme() {
  const brand = useBrandStore((state) => state.brand)
  const setBrand = useBrandStore((state) => state.setBrand)
  const hydrated = useHydrated()
  return { brand: hydrated ? brand : DEFAULT_BRAND, setBrand }
}
