import { getToolName, isToolUIPart, type UIMessage } from 'ai'

export type ChatSource = {
  ref: number
  documentTitle: string
  sourceType: string
  sourceLabel: string
  sourcePath: string
  chunkIndex: number
  similarity: number
  content: string
}

export type MessageMeta = {
  text: string
  sources: ChatSource[]
  /** A retrieval call is in flight (no output yet). */
  searching: boolean
  /** Search queries the assistant issued, for the "thinking" trace. */
  queries: string[]
}

export function extractMessageMeta(message: UIMessage): MessageMeta {
  let text = ''
  const sources: ChatSource[] = []
  const seen = new Set<number>()
  const queries: string[] = []
  let searching = false

  for (const part of message.parts) {
    if (part.type === 'text') {
      text += part.text
      continue
    }
    if (isToolUIPart(part) && getToolName(part) === 'searchKnowledgeBase') {
      const input = part.input as { query?: string } | undefined
      if (input?.query) queries.push(input.query)

      if (part.state === 'output-available' && Array.isArray(part.output)) {
        for (const item of part.output as ChatSource[]) {
          if (!seen.has(item.ref)) {
            seen.add(item.ref)
            sources.push(item)
          }
        }
      } else if (
        part.state === 'input-streaming' ||
        part.state === 'input-available'
      ) {
        searching = true
      }
    }
  }

  sources.sort((a, b) => a.ref - b.ref)
  return { text, sources, searching, queries }
}
