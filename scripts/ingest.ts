/**
 * Ingest the HCSA mock corpus into Supabase (pgvector).
 *
 *   pnpm ingest            # ingest everything
 *   pnpm ingest --dry-run  # parse + chunk only, no embeddings / DB writes
 *
 * Env (web/.env.local): OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, and optionally CORPUS_DIR.
 */
import { config as loadEnv } from 'dotenv'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, getDocumentProxy } from 'unpdf'
import { createClient } from '@supabase/supabase-js'
import { embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'
import { chunkText, estimateTokens } from '../src/lib/rag/chunk'
import { EMBEDDING_MODEL } from '../src/lib/rag/config'
import type { SourceType } from '../src/lib/rag/types'

loadEnv({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_CORPUS = path.resolve(
  __dirname,
  '../../OneDrive_1_6-22-2026/Mock Dataset for AI-Driven LLM Prototype',
)
const CORPUS_DIR = process.env.CORPUS_DIR
  ? path.resolve(process.env.CORPUS_DIR)
  : DEFAULT_CORPUS

const DRY_RUN = process.argv.includes('--dry-run')
const EMBED_BATCH = 64

/** Files that are part of the brief, not the knowledge corpus. */
const EXCLUDE = [/prototype instructions/i, /^queries/i]

type CorpusFile = {
  absPath: string
  relPath: string
  title: string
  sourceType: SourceType
}

function classify(relPath: string, fileName: string): SourceType {
  const lower = relPath.toLowerCase()
  if (lower.includes('email')) return 'email'
  if (lower.includes('report')) return 'report'
  if (/^sop-/i.test(fileName)) return 'sop'
  return 'policy'
}

function titleFromFile(fileName: string, sourceType: SourceType): string {
  const base = fileName.replace(/\.pdf$/i, '')
  if (sourceType === 'email') return base.replace(/^Email\s*/i, 'Email ')
  return base
}

async function collectPdfs(dir: string): Promise<CorpusFile[]> {
  const out: CorpusFile[] = []
  async function walk(current: string) {
    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const abs = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(abs)
      } else if (
        entry.name.toLowerCase().endsWith('.pdf') &&
        !EXCLUDE.some((re) => re.test(entry.name))
      ) {
        const relPath = path.relative(CORPUS_DIR, abs)
        const sourceType = classify(relPath, entry.name)
        out.push({
          absPath: abs,
          relPath,
          title: titleFromFile(entry.name, sourceType),
          sourceType,
        })
      }
    }
  }
  await walk(dir)
  return out.sort((a, b) => a.relPath.localeCompare(b.relPath))
}

async function extractPdfText(absPath: string): Promise<string> {
  const buffer = await readFile(absPath)
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  return Array.isArray(text) ? text.join('\n\n') : text
}

async function main() {
  console.log(`Corpus: ${CORPUS_DIR}`)
  const files = await collectPdfs(CORPUS_DIR)
  console.log(`Found ${files.length} PDF(s)\n`)

  const counts: Record<string, number> = {}
  for (const f of files) counts[f.sourceType] = (counts[f.sourceType] ?? 0) + 1
  console.log('By type:', counts, '\n')

  const supabase = DRY_RUN
    ? null
    : createClient(
        requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
        requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
        { auth: { persistSession: false } },
      )

  const embeddingModel = openai.embedding(EMBEDDING_MODEL)
  let totalChunks = 0

  for (const file of files) {
    const text = await extractPdfText(file.absPath)
    const chunks = chunkText(text)
    totalChunks += chunks.length

    if (!chunks.length) {
      console.warn(`  ⚠ ${file.relPath}: no extractable text, skipped`)
      continue
    }

    if (DRY_RUN || !supabase) {
      console.log(`  ${file.relPath} → ${chunks.length} chunks [${file.sourceType}]`)
      continue
    }

    // Upsert the document row.
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .upsert(
        {
          title: file.title,
          source_path: file.relPath,
          source_type: file.sourceType,
          metadata: { pages: undefined },
        },
        { onConflict: 'source_path' },
      )
      .select('id')
      .single()

    if (docError || !doc) {
      console.error(`  ✗ ${file.relPath}: ${docError?.message}`)
      continue
    }

    // Replace existing chunks for a clean re-ingest.
    await supabase.from('chunks').delete().eq('document_id', doc.id)

    // Embed + insert in batches.
    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
      const batch = chunks.slice(i, i + EMBED_BATCH)
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: batch.map((c) => c.content),
      })
      const rows = batch.map((c, j) => ({
        document_id: doc.id,
        chunk_index: c.index,
        content: c.content,
        token_count: estimateTokens(c.content),
        embedding: JSON.stringify(embeddings[j]),
      }))
      const { error: insErr } = await supabase.from('chunks').insert(rows)
      if (insErr) {
        console.error(`  ✗ ${file.relPath} chunk insert: ${insErr.message}`)
        break
      }
    }

    console.log(`  ✓ ${file.relPath} → ${chunks.length} chunks [${file.sourceType}]`)
  }

  console.log(
    `\n${DRY_RUN ? '[dry-run] ' : ''}Done. ${files.length} documents, ${totalChunks} chunks.`,
  )
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env ${name}`)
  return value
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
