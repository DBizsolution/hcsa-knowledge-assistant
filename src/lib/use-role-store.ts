'use client'

import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_ROLE, type Role } from './roles'

type RoleStore = {
  role: Role
  setRole: (role: Role) => void
}

/**
 * Demo "view as" role. Shared between the sidebar (nav filtering) and the
 * header switcher. Persisted so the chosen view survives navigation/refresh.
 */
export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      role: DEFAULT_ROLE,
      setRole: (role) => set({ role }),
    }),
    { name: 'hcsa-demo-role' },
  ),
)

/**
 * Reads the demo role safely for SSR: returns DEFAULT_ROLE until mounted so
 * the server-rendered markup matches the first client paint, then the
 * persisted role takes over without a hydration mismatch.
 */
const emptySubscribe = () => () => {}

/** True once hydrated on the client; false during SSR and first paint. */
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

export function useRole() {
  const role = useRoleStore((state) => state.role)
  const setRole = useRoleStore((state) => state.setRole)
  const hydrated = useHydrated()
  return { role: hydrated ? role : DEFAULT_ROLE, setRole }
}
