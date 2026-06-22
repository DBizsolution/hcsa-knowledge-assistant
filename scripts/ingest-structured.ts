/**
 * Ingest the HCSA relational mock datasets (the 4 Excel workbooks) into
 * Supabase as real tables, so the chat route can run actual SQL over them.
 *
 *   pnpm ingest:structured            # load all four tables
 *   pnpm ingest:structured --dry-run  # parse + transform only, no DB writes
 *
 * Categorical columns are normalised to UPPER_SNAKE (collapsing the dirty
 * casing/whitespace variants in the source, e.g. "Fail" → "FAIL"); date columns
 * are parsed to ISO dates; numerics are coerced. IDs, names and addresses are
 * kept verbatim.
 *
 * Env (web/.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * and optionally STRUCTURED_DIR.
 */
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'

loadEnv({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_DIR = path.resolve(
  __dirname,
  '../../OneDrive_1_6-22-2026/Mock Dataset for AI-Driven LLM Prototype/Structured Datasets',
)
const STRUCTURED_DIR = process.env.STRUCTURED_DIR
  ? path.resolve(process.env.STRUCTURED_DIR)
  : DEFAULT_DIR

const DRY_RUN = process.argv.includes('--dry-run')
const INSERT_BATCH = 500

type Cell = ExcelJS.CellValue
type Transform = (value: Cell) => unknown
type ColumnSpec = Record<string, [header: string, transform: Transform]>

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

/** Unwrap ExcelJS rich-text / formula / hyperlink cell objects to a scalar. */
function scalar(value: Cell): string | number | boolean | null {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') {
    const obj = value as unknown as Record<string, unknown>
    if ('result' in obj) return scalar(obj.result as Cell)
    if ('text' in obj) return String(obj.text)
    if ('richText' in obj && Array.isArray(obj.richText)) {
      return obj.richText.map((part) => (part as { text: string }).text).join('')
    }
    return null
  }
  return value as string | number | boolean
}

function txt(v: Cell): string | null {
  const s = scalar(v)
  if (s === null) return null
  const trimmed = String(s).trim()
  return trimmed.length ? trimmed : null
}

function cat(v: Cell): string | null {
  const s = txt(v)
  return s ? s.toUpperCase().replace(/[\s-]+/g, '_') : null
}

function intv(v: Cell): number | null {
  const s = scalar(v)
  if (s === null || s === '') return null
  const n = Number(String(s).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? Math.round(n) : null
}

function numv(v: Cell): number | null {
  const s = scalar(v)
  if (s === null || s === '') return null
  const n = Number(String(s).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

function boolv(v: Cell): boolean | null {
  const s = scalar(v)
  if (typeof s === 'boolean') return s
  if (s === null) return null
  const lower = String(s).trim().toLowerCase()
  if (lower === 'true' || lower === 'yes') return true
  if (lower === 'false' || lower === 'no' || lower === '') return false
  return null
}

function datev(v: Cell): string | null {
  const s = scalar(v)
  if (s === null || s === '') return null
  if (typeof s === 'string') {
    const m = s.trim().match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/)
    if (m) {
      const month = MONTHS[m[2].slice(0, 3).toLowerCase()]
      if (month === undefined) return null
      const day = Number(m[1])
      const year = Number(m[3])
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  const parsed = Date.parse(String(s))
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString().slice(0, 10)
}

type TableSpec = {
  file: string
  table: string
  primaryKey: string
  columns: ColumnSpec
}

const TABLES: TableSpec[] = [
  {
    file: 'Contractor listing.xlsx',
    table: 'contractors',
    primaryKey: 'contractor_id',
    columns: {
      contractor_id: ['Contractor Id', txt],
      name: ['Contractor Name', txt],
      contact_number: ['Contact Number', txt],
      company_address: ['Company Address', txt],
      contract_start_date: ['Contract Start Date', datev],
      contractor_rating: ['Contractor Rating', cat],
      sustainability_rating: ['Sustainability Rating', cat],
      financial_health_rating: ['Financial Health Rating', cat],
      engagement_status: ['Engagement Status', cat],
      completed_projects: ['Number of Completed Projects', intv],
    },
  },
  {
    file: 'Development Projects.xlsx',
    table: 'projects',
    primaryKey: 'project_id',
    columns: {
      project_id: ['Project ID', txt],
      name: ['Project Name', txt],
      contractor_id: ['Contractor ID', txt],
      start_date: ['Project Start Date', datev],
      scheduled_completion_date: ['Scheduled Completion Date', datev],
      actual_completion_date: ['Actual Completion Date', datev],
      status: ['Project Status', cat],
      estimated_cost: ['Estimated Cost (SGD)', numv],
      actual_cost: ['Actual Cost (SGD)', numv],
    },
  },
  {
    file: 'Permits.xlsx',
    table: 'permits',
    primaryKey: 'permit_id',
    columns: {
      permit_id: ['Permit ID', txt],
      project_id: ['Assignment ID', txt],
      permit_type: ['Permit Type', cat],
      permit_category: ['Permit Category', cat],
      approval_date: ['Approval Date', datev],
      expiry_date: ['Expiry Date', datev],
      permit_status: ['Permit Status', cat],
      permit_conditions: ['Permit Conditions', intv],
      conditions_met: ['Conditions Met', intv],
      processing_fee: ['Processing fee (SGD)', numv],
    },
  },
  {
    file: 'Inspections.xlsx',
    table: 'inspections',
    primaryKey: 'inspection_id',
    columns: {
      inspection_id: ['Inspection ID', txt],
      project_id: ['Case ID', txt],
      inspection_date: ['Inspection Date', datev],
      inspection_type: ['Inspection Type', cat],
      inspector_company: ['Inspector Company', txt],
      inspection_result: ['Inspection Result', cat],
      defects_found: ['Defects Found', intv],
      rectification_required: ['Rectification Required', boolv],
      rectification_deadline: ['Rectification Deadline', datev],
      rectification_completed: ['Rectification Completed', boolv],
      follow_up_inspection_date: ['Follow up Inspection Date', datev],
      inspection_cost: ['Inspection Cost Sgd', numv],
    },
  },
]

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env ${name}`)
  return value
}

async function loadRows(spec: TableSpec): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(path.join(STRUCTURED_DIR, spec.file))
  const sheet = workbook.worksheets[0]

  const headerRow = sheet.getRow(1)
  const headerIndex = new Map<string, number>()
  headerRow.eachCell((cell, col) => {
    const label = txt(cell.value)
    if (typeof label === 'string') headerIndex.set(label, col)
  })

  const entries = Object.entries(spec.columns)
  const rows: Record<string, unknown>[] = []
  const seen = new Set<string>()

  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r)
    const record: Record<string, unknown> = {}
    let nonEmpty = false
    for (const [dbColumn, [header, transform]] of entries) {
      const col = headerIndex.get(header)
      const raw = col ? row.getCell(col).value : null
      const value = transform(raw)
      record[dbColumn] = value
      if (value !== null && value !== undefined) nonEmpty = true
    }
    if (!nonEmpty) continue
    const key = record[spec.primaryKey]
    if (key === null || key === undefined) continue
    if (seen.has(String(key))) continue // keep first occurrence on duplicate PK
    seen.add(String(key))
    rows.push(record)
  }
  return rows
}

async function main() {
  console.log(`Structured datasets: ${STRUCTURED_DIR}\n`)

  const supabase = DRY_RUN
    ? null
    : createClient(
        requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
        requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
        { auth: { persistSession: false } },
      )

  for (const spec of TABLES) {
    const rows = await loadRows(spec)
    console.log(`  ${spec.file} → ${spec.table}: ${rows.length} rows`)

    if (DRY_RUN || !supabase) {
      console.log('     sample:', JSON.stringify(rows[0]))
      continue
    }

    const { error: delError } = await supabase
      .from(spec.table)
      .delete()
      .neq(spec.primaryKey, '__never__')
    if (delError) {
      console.error(`  ✗ ${spec.table} clear: ${delError.message}`)
      continue
    }

    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const batch = rows.slice(i, i + INSERT_BATCH)
      const { error: insError } = await supabase.from(spec.table).insert(batch)
      if (insError) {
        console.error(`  ✗ ${spec.table} insert: ${insError.message}`)
        break
      }
    }
    console.log(`  ✓ ${spec.table} loaded`)
  }

  console.log(`\n${DRY_RUN ? '[dry-run] ' : ''}Done.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
