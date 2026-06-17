/**
 * Paragraph-aware chunker. Groups paragraphs into ~maxChars windows with a
 * small overlap so retrieval keeps surrounding context. Deterministic so the
 * same document always yields the same chunk_index values (stable citations).
 */

export type Chunk = {
  index: number
  content: string
}

type ChunkOptions = {
  maxChars?: number
  overlapChars?: number
}

export function chunkText(
  raw: string,
  { maxChars = 1100, overlapChars = 150 }: ChunkOptions = {},
): Chunk[] {
  const normalized = raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!normalized) return []

  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    if (!current) {
      current = paragraph
    } else if (current.length + paragraph.length + 1 <= maxChars) {
      current = `${current}\n${paragraph}`
    } else {
      chunks.push(current)
      const tail = current.slice(-overlapChars)
      current = `${tail} ${paragraph}`.trim()
    }

    // A single oversized paragraph: hard-split it.
    while (current.length > maxChars) {
      chunks.push(current.slice(0, maxChars))
      current = current.slice(maxChars - overlapChars)
    }
  }

  if (current.trim()) chunks.push(current.trim())

  return chunks.map((content, index) => ({ index, content }))
}

/** Rough token estimate (~4 chars/token) for consumption reporting. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
