import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  type UIMessage,
} from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { retrieveChunks } from '@/lib/rag/retrieve'
import { SYSTEM_PROMPT } from '@/lib/rag/prompt'
import { CHAT_MODEL, SOURCE_TYPE_LABELS } from '@/lib/rag/config'
import { matchPolicyEvolution } from '@/lib/rag/policy-evolution'

export const maxDuration = 60

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'OPENAI_API_KEY is not configured on the server.' },
      { status: 503 },
    )
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  // Stable, monotonic reference numbers across (possibly multiple) searches.
  let refCounter = 0

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: openai(CHAT_MODEL),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    stopWhen: stepCountIs(5),
    tools: {
      searchKnowledgeBase: tool({
        description:
          'Search the entire HCSA knowledge base (policies, SOPs, emails and reports together) for passages relevant to a question. Returns numbered sources to cite. Always searches every source type — a topic may be discussed in an unexpected place (e.g. an eco-rebate or permit question is often answered in email correspondence, not only in a policy).',
        inputSchema: z.object({
          query: z
            .string()
            .describe('A focused natural-language search query.'),
        }),
        execute: async ({ query }) => {
          const chunks = await retrieveChunks(query)
          return chunks.map((chunk) => ({
            ref: ++refCounter,
            documentTitle: chunk.documentTitle,
            sourceType: chunk.sourceType,
            sourceLabel: SOURCE_TYPE_LABELS[chunk.sourceType] ?? chunk.sourceType,
            sourcePath: chunk.sourcePath,
            chunkIndex: chunk.chunkIndex,
            similarity: Number(chunk.similarity.toFixed(3)),
            content: chunk.content,
          }))
        },
      }),
      analyzePolicyEvolution: tool({
        description:
          'Analyse how an HCSA policy has evolved over time and detect conflicts/contradictions between a policy and its related SOP. Use this — NOT searchKnowledgeBase — whenever the officer asks what changed in a policy, about version history or policy timelines, or about conflicting/contradictory/inconsistent guidance across documents. Returns a structured evolution report (timeline, changed clauses, contradictions, citations) that the UI renders directly. If it returns found:false, fall back to searchKnowledgeBase.',
        inputSchema: z.object({
          topic: z
            .string()
            .describe(
              'The policy area or document the officer is asking about, e.g. "sustainable urban design", "green building", "POL-UD-002".',
            ),
        }),
        execute: async ({ topic }) => {
          const evolution = matchPolicyEvolution(topic)
          if (!evolution) return { found: false as const, topic }
          // Hybrid: ground the curated report with a live retrieval so the
          // evidence shown alongside it is real (proves the system is live).
          const chunks = await retrieveChunks(topic, { matchCount: 5 })
          const evidence = chunks.map((chunk) => ({
            ref: ++refCounter,
            documentTitle: chunk.documentTitle,
            sourceType: chunk.sourceType,
            sourceLabel:
              SOURCE_TYPE_LABELS[chunk.sourceType] ?? chunk.sourceType,
            sourcePath: chunk.sourcePath,
            chunkIndex: chunk.chunkIndex,
            similarity: Number(chunk.similarity.toFixed(3)),
            content: chunk.content,
          }))
          return { found: true as const, evolution, evidence }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
