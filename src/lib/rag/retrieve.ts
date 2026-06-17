import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { embedQuery } from './embeddings'
import {
  DEFAULT_MATCH_COUNT,
  DEFAULT_SIMILARITY_THRESHOLD,
} from './config'
import type { RetrievedChunk, SourceType } from './types'

type RetrieveOptions = {
  matchCount?: number
  similarityThreshold?: number
  sourceTypes?: SourceType[]
}

type MatchRow = {
  id: string
  document_id: string
  content: string
  chunk_index: number
  similarity: number
  document_title: string
  source_type: SourceType
  source_path: string
  metadata: Record<string, unknown> | null
}

export async function retrieveChunks(
  query: string,
  options: RetrieveOptions = {},
): Promise<RetrievedChunk[]> {
  const {
    matchCount = DEFAULT_MATCH_COUNT,
    similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
    sourceTypes,
  } = options

  const embedding = await embedQuery(query)
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_count: matchCount,
    similarity_threshold: similarityThreshold,
    filter_source_types: sourceTypes ?? null,
  })

  if (error) {
    throw new Error(`Retrieval failed: ${error.message}`)
  }

  return (data ?? []).map((row: MatchRow) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    chunkIndex: row.chunk_index,
    similarity: row.similarity,
    documentTitle: row.document_title,
    sourceType: row.source_type,
    sourcePath: row.source_path,
    metadata: row.metadata ?? {},
  }))
}
