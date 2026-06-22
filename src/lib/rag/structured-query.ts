/**
 * Real structured-data analytics for the chat route: translate a natural-language
 * question into a single read-only SELECT over the relational project datasets,
 * execute it through the guarded `run_readonly_query` gateway, and shape the
 * result into the StructuredResult the UI renders. This is the live replacement
 * for the curated `matchStructuredData` path — answers come from the actual
 * data, not hand-authored figures.
 */
import 'server-only'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { CHAT_MODEL } from './config'
import type {
  StructuredResult,
  StructuredMetric,
  TableColumn,
  TableRow,
} from './structured-data'

const MAX_TABLE_ROWS = 50
const FRESHNESS =
  'Live query over the project datasets · Contractors · Projects · Permits · Inspections'

const SCHEMA_DOC = `You write a SINGLE read-only PostgreSQL SELECT over these tables (HCSA = HDB; treat them as one entity). Categorical text columns are normalised to UPPER_SNAKE.

contractors(
  contractor_id text PK, name text, contact_number text, company_address text,
  contract_start_date date,
  contractor_rating text,        -- GOLD | SILVER | BRONZE | PLATINUM
  sustainability_rating text,    -- A_PLUS | A | B_PLUS | B | C_PLUS | C | UNRATED
  financial_health_rating text,  -- EXCELLENT | GOOD | FAIR | UNDER_REVIEW
  engagement_status text,        -- ACTIVE | INACTIVE | SUSPENDED | PENDING
  completed_projects int)

projects(
  project_id text PK, name text, contractor_id text,  -- contractor_id → contractors.contractor_id
  start_date date, scheduled_completion_date date, actual_completion_date date,
  status text,        -- PLANNING | PERMITTING | CONSTRUCTION | ON_HOLD | SUSPENDED | COMPLETED | CANCELLED
  estimated_cost numeric, actual_cost numeric)

permits(
  permit_id text PK, project_id text,  -- project_id → projects.project_id
  permit_type text, permit_category text,
  approval_date date, expiry_date date,
  permit_status text,  -- APPROVED | PENDING | RENEWED | REVOKED | REJECTED | EXPIRED
  permit_conditions int, conditions_met int, processing_fee numeric)

inspections(
  inspection_id text PK, project_id text,  -- project_id → projects.project_id
  inspection_date date, inspection_type text, inspector_company text,
  inspection_result text,  -- PASS | FAIL | PASS_WITH_ADVISORY | CONDITIONAL_PASS
  defects_found int, rectification_required boolean,
  rectification_deadline date, rectification_completed boolean,
  follow_up_inspection_date date, inspection_cost numeric)

Rules:
- One statement, SELECT/WITH only. No INSERT/UPDATE/DELETE/DDL, no semicolons, no system catalogs.
- Alias every output column with a readable Title Case name in double quotes, e.g. count(*) AS "Contractors".
- Use the exact UPPER_SNAKE literals above for category filters. When unsure of casing/spelling use upper(col) or ILIKE.
- "ongoing"/"active" projects = status IN ('PLANNING','PERMITTING','CONSTRUCTION','ON_HOLD'); "completed" = status = 'COMPLETED'.
- For date arithmetic use the real date columns and CURRENT_DATE. Round money/ratios sensibly.
- Always add LIMIT 200.`

const planSchema = z.object({
  answerable: z
    .boolean()
    .describe('True only if the question can be answered from these four tables.'),
  sql: z.string().describe('A single read-only PostgreSQL SELECT, or empty if not answerable.'),
  dataset: z.string().describe('Short label of the table(s) and join used.'),
  joins: z.array(z.string()),
  assumptions: z.array(z.string()),
})

const presentSchema = z.object({
  title: z.string().describe('A concise restatement of the question as a heading.'),
  summary: z.string().describe('One or two sentences answering the question from the rows. Be concise.'),
  kind: z.enum(['metric', 'table', 'trend', 'exception']),
  metrics: z
    .array(z.object({ label: z.string(), value: z.string(), sub: z.string().optional() }))
    .max(3)
    .optional(),
  followUps: z.array(z.string()).max(3),
})

type QueryRow = Record<string, string | number | boolean | null>

function looksReadOnly(sql: string): boolean {
  const cleaned = sql.trim().replace(/;\s*$/, '')
  if (!/^(select|with)\b/i.test(cleaned)) return false
  if (cleaned.includes(';')) return false
  if (/\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|merge|call|copy|vacuum)\b/i.test(cleaned))
    return false
  if (/(pg_|information_schema)/i.test(cleaned)) return false
  return true
}

async function runSql(sql: string): Promise<QueryRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('run_readonly_query', { query_text: sql })
  if (error) throw new Error(error.message)
  return (data ?? []) as QueryRow[]
}

function buildColumns(rows: QueryRow[]): TableColumn[] {
  const keys = Object.keys(rows[0] ?? {})
  return keys.map((key) => ({
    key,
    label: key,
    numeric: rows.every((row) => row[key] === null || typeof row[key] === 'number'),
  }))
}

function toCell(value: string | number | boolean | null): string | number {
  if (value === null) return '–'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return value
}

/**
 * Translate a natural-language analytical question into SQL, run it read-only,
 * and return a StructuredResult — or null if the question doesn't map to the
 * structured datasets (so the chat agent can fall back to document search).
 */
export async function runStructuredQuery(question: string): Promise<StructuredResult | null> {
  let plan: z.infer<typeof planSchema>
  try {
    const { object } = await generateObject({
      model: openai(CHAT_MODEL),
      schema: planSchema,
      system: SCHEMA_DOC,
      prompt: `Question: ${question}\n\nProduce the query plan.`,
    })
    plan = object
  } catch {
    return null
  }

  if (!plan.answerable || !plan.sql || !looksReadOnly(plan.sql)) return null

  let rows: QueryRow[]
  try {
    rows = await runSql(plan.sql)
  } catch (firstError) {
    // One self-repair attempt with the error fed back.
    try {
      const { object } = await generateObject({
        model: openai(CHAT_MODEL),
        schema: planSchema,
        system: SCHEMA_DOC,
        prompt: `Question: ${question}\n\nYour previous SQL failed with: ${
          (firstError as Error).message
        }\n\nReturn corrected SQL.\nPrevious SQL:\n${plan.sql}`,
      })
      if (!object.answerable || !looksReadOnly(object.sql)) return null
      plan = object
      rows = await runSql(object.sql)
    } catch {
      return null
    }
  }

  if (rows.length === 0) return null

  let present: z.infer<typeof presentSchema>
  try {
    const sample = rows.slice(0, 30)
    const { object } = await generateObject({
      model: openai(CHAT_MODEL),
      schema: presentSchema,
      prompt: `Question: ${question}\n\nQuery returned ${rows.length} row(s). Sample:\n${JSON.stringify(
        sample,
      )}\n\nSummarise the answer concisely and suggest up to 3 relevant follow-up questions over the same datasets.`,
    })
    present = object
  } catch {
    present = {
      title: question,
      summary: `Returned ${rows.length} row(s).`,
      kind: rows.length === 1 ? 'metric' : 'table',
      followUps: [],
    }
  }

  const columns = buildColumns(rows)
  const tableRows: TableRow[] = rows.slice(0, MAX_TABLE_ROWS).map((row) => {
    const out: TableRow = {}
    for (const column of columns) out[column.key] = toCell(row[column.key])
    return out
  })

  const metrics: StructuredMetric[] | undefined =
    present.metrics && present.metrics.length > 0 ? present.metrics : undefined

  return {
    key: 'live-query',
    title: present.title,
    kind: present.kind,
    dataset: plan.dataset,
    summary: present.summary,
    metrics,
    table: {
      columns,
      rows: tableRows,
      note:
        rows.length > MAX_TABLE_ROWS
          ? `Showing ${MAX_TABLE_ROWS} of ${rows.length} rows.`
          : undefined,
    },
    explanation: {
      filters: [plan.sql.trim()],
      joins: plan.joins.length ? plan.joins : ['–'],
      assumptions: plan.assumptions,
    },
    freshness: FRESHNESS,
    followUps: present.followUps,
    exportable: true,
  }
}
