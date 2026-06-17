/** Shared RAG configuration. Keep in sync with supabase/schema.sql. */

export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o'

/** Retrieval defaults. */
export const DEFAULT_MATCH_COUNT = 8
export const DEFAULT_SIMILARITY_THRESHOLD = 0.2

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  policy: 'Policy',
  sop: 'SOP',
  email: 'Email',
  report: 'Report',
}
