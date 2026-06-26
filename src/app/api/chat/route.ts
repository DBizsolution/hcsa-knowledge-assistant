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
import { buildSystemPrompt } from '@/lib/rag/prompt'
import { CHAT_MODEL, SOURCE_TYPE_LABELS } from '@/lib/rag/config'
import { matchPolicyEvolution } from '@/lib/rag/policy-evolution'
import { runStructuredQuery } from '@/lib/rag/structured-query'
import { personaById } from '@/lib/personas'

export const maxDuration = 60

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'OPENAI_API_KEY is not configured on the server.' },
      { status: 503 },
    )
  }

  const { messages, persona }: { messages: UIMessage[]; persona?: string } =
    await req.json()

  // The active agent constrains retrieval to its authorised corpus slices, so
  // answers stay within scope (solution-arch §4.6–4.8). 'general' covers every
  // source, making the filter a no-op for it.
  const activePersona = personaById(persona)
  const scopedSources = activePersona.sources

  // Stable, monotonic reference numbers across (possibly multiple) searches.
  let refCounter = 0

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: openai(CHAT_MODEL),
    system: buildSystemPrompt(persona),
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
          const chunks = await retrieveChunks(query, {
            sourceTypes: scopedSources,
          })
          return chunks.map((chunk) => ({
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
          const chunks = await retrieveChunks(topic, {
            matchCount: 5,
            sourceTypes: scopedSources,
          })
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
      // Structured analytics over the relational datasets (Contractors,
      // Projects, Permits, Inspections) is the IAG audit/analytics agent's
      // scope; General Knowledge keeps it too as the catch-all agent. Other
      // personas are not given the SQL query tool.
      ...((activePersona.id === 'iag' || activePersona.id === 'general') && {
        queryStructuredData: tool({
          description:
            'Run an analytical query over the relational project datasets (Contractors, Projects, Permits, Inspections) for quantitative questions — counts, totals, rankings, distributions, trends by quarter/year, joins across datasets, and exception lists (overdue/failed). Translates the question into a read-only SQL query and returns a structured result (metrics, table, query explanation) that the UI renders directly. Use this — NOT searchKnowledgeBase — for "how many", "which contractor has the most", "average/total", "distribution of", "by quarter", "overdue" or "failed" questions. If it returns found:false, fall back to searchKnowledgeBase.',
          inputSchema: z.object({
            query: z
              .string()
              .describe(
                'The analytical question in natural language, e.g. "distribution of contractor ratings", "how many inactive contractors hold ongoing projects", "average defects by inspection type".',
              ),
          }),
          execute: async ({ query }) => {
            const result = await runStructuredQuery(query)
            if (!result) return { found: false as const, query }
            return { found: true as const, result }
          },
        }),
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
