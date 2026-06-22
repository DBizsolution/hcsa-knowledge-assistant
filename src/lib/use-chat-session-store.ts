'use client'

import { create } from 'zustand'
import { CONVERSATIONS, type StoredConversation } from '@/data/conversations'

export type ChatSummary = {
  id: string
  title: string
}

/**
 * Dummy past conversations seeded from the canonical transcripts so the sidebar
 * history matches the /history page. Clicking one loads its transcript into the
 * chat view via `pending`.
 */
const SEED_HISTORY: ChatSummary[] = CONVERSATIONS.map((conversation) => ({
  id: conversation.id,
  title: conversation.title,
}))

type ChatSessionStore = {
  /** Bumped to force the chat view to clear its messages. */
  resetKey: number
  /** Title of the active conversation, or null for a fresh chat. */
  currentTitle: string | null
  history: ChatSummary[]
  /** A conversation queued to load into the chat view, consumed on mount. */
  pending: StoredConversation | null
  /** Set the active chat's title from its first question (once per chat). */
  setCurrentTitle: (title: string) => void
  /** Archive the current chat into history and clear the view. */
  startNewChat: () => void
  /** Queue a past conversation to load into the chat view. */
  openConversation: (conversation: StoredConversation) => void
  /** Clear the queued conversation once the chat view has loaded it. */
  consumePending: () => void
}

let counter = 0
const nextId = () => `chat-${(counter += 1)}`

export const useChatSessionStore = create<ChatSessionStore>((set) => ({
  resetKey: 0,
  currentTitle: null,
  history: SEED_HISTORY,
  pending: null,
  setCurrentTitle: (title) =>
    set((state) => (state.currentTitle ? state : { currentTitle: title })),
  startNewChat: () =>
    set((state) => ({
      resetKey: state.resetKey + 1,
      currentTitle: null,
      pending: null,
      history: state.currentTitle
        ? [{ id: nextId(), title: state.currentTitle }, ...state.history]
        : state.history,
    })),
  openConversation: (conversation) =>
    set({ pending: conversation, currentTitle: conversation.title }),
  consumePending: () => set({ pending: null }),
}))
