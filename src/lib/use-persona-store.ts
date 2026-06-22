'use client'

import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PERSONA, type PersonaId } from './personas'

type PersonaStore = {
  persona: PersonaId
  setPersona: (persona: PersonaId) => void
}

/**
 * Active chat persona/agent. Drives the chat header, scoped source badges,
 * starter prompts and the system-prompt framing sent to /api/chat. Persisted
 * so the chosen agent survives navigation and refresh.
 */
export const usePersonaStore = create<PersonaStore>()(
  persist(
    (set) => ({
      persona: DEFAULT_PERSONA,
      setPersona: (persona) => set({ persona }),
    }),
    { name: 'hcsa-chat-persona' },
  ),
)

const emptySubscribe = () => () => {}

/** True once hydrated on the client; false during SSR and first paint. */
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

export function usePersona() {
  const persona = usePersonaStore((state) => state.persona)
  const setPersona = usePersonaStore((state) => state.setPersona)
  const hydrated = useHydrated()
  return { persona: hydrated ? persona : DEFAULT_PERSONA, setPersona }
}
