import { getToolName, isToolUIPart, type UIMessage } from 'ai'
import type { PolicyEvolution } from '@/lib/rag/policy-evolution'

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

export type PolicyEvolutionResult = {
  evolution: PolicyEvolution
  evidence: ChatSource[]
}

export type MessageMeta = {
  text: string
  sources: ChatSource[]
  /** A retrieval call is in flight (no output yet). */
  searching: boolean
  /** A policy-evolution analysis is in flight (no output yet). */
  analysing: boolean
  /** Search queries the assistant issued, for the "thinking" trace. */
  queries: string[]
  /** Structured policy-evolution report, when the analysis tool ran. */
  policyEvolution: PolicyEvolutionResult | null
}

type PolicyToolOutput =
  | { found: true; evolution: PolicyEvolution; evidence: ChatSource[] }
  | { found: false; topic: string }

export function extractMessageMeta(message: UIMessage): MessageMeta {
  let text = ''
  const sources: ChatSource[] = []
  const seen = new Set<number>()
  const queries: string[] = []
  let searching = false
  let analysing = false
  let policyEvolution: PolicyEvolutionResult | null = null

  for (const part of message.parts) {
    if (part.type === 'text') {
      text += part.text
      continue
    }
    if (!isToolUIPart(part)) continue

    const toolName = getToolName(part)

    if (toolName === 'searchKnowledgeBase') {
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
      continue
    }

    if (toolName === 'analyzePolicyEvolution') {
      if (part.state === 'output-available' && part.output) {
        const output = part.output as PolicyToolOutput
        if (output.found) {
          policyEvolution = {
            evolution: output.evolution,
            evidence: output.evidence ?? [],
          }
        }
      } else if (
        part.state === 'input-streaming' ||
        part.state === 'input-available'
      ) {
        analysing = true
      }
    }
  }

  sources.sort((a, b) => a.ref - b.ref)
  return { text, sources, searching, analysing, queries, policyEvolution }
}
