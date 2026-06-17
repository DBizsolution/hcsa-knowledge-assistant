export type SourceType = 'policy' | 'sop' | 'email' | 'report'

export type RetrievedChunk = {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  similarity: number
  documentTitle: string
  sourceType: SourceType
  sourcePath: string
  metadata: Record<string, unknown>
}

/** A citation surfaced to the UI, numbered for inline references like [1]. */
export type Citation = {
  ref: number
  documentTitle: string
  sourceType: SourceType
  sourcePath: string
  chunkIndex: number
  similarity: number
  snippet: string
}
