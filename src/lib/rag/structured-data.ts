/**
 * Curated structured-data analytics over the relational project corpus
 * (Contractors → Projects → Permits / Inspections). Mirrors the policy-evolution
 * pattern: the data here is the "scripted" answer to the quantitative sample
 * queries (aggregations, joins, date-math), delivered through a real chat tool
 * and reused by the /analytics surface. Every figure is internally consistent
 * across results so the system reads like one live dataset.
 */

export type MetricTrend = {
  direction: 'up' | 'down' | 'flat'
  label: string
}

export type StructuredMetric = {
  label: string
  value: string
  sub?: string
  trend?: MetricTrend
}

export type TableColumn = {
  key: string
  label: string
  numeric?: boolean
}

export type TableRow = Record<string, string | number>

export type ChartBar = {
  label: string
  value: number
  /** Pre-formatted display value (falls back to value). */
  display?: string
  /** Visually flag an outlier/exception bar. */
  emphasis?: boolean
}

export type StructuredCitation = {
  docCode: string
  section: string
  quote: string
}

export type ResultKind = 'metric' | 'table' | 'trend' | 'exception'

export type StructuredResult = {
  key: string
  /** The restated question. */
  title: string
  kind: ResultKind
  /** The dataset(s) and join the query ran over. */
  dataset: string
  /** One- or two-sentence narrative answer. */
  summary: string
  metrics?: StructuredMetric[]
  chart?: { unit?: string; bars: ChartBar[] }
  table?: { columns: TableColumn[]; rows: TableRow[]; note?: string }
  /** What the query did — filters, joins, assumptions (the §14.8 explanation). */
  explanation: { filters: string[]; joins?: string[]; assumptions?: string[] }
  /** Last dataset refresh. */
  freshness: string
  /** Combined response — relevant policy/SOP citations alongside the numbers. */
  citations?: StructuredCitation[]
  followUps: string[]
  /** Whether export is permitted for the active user (demo: always true). */
  exportable: boolean
}

const FRESHNESS = 'Permits & Inspections datasets · refreshed 17 Jun 2026, 06:00'

const PERMITS_EXPIRED_2024: StructuredResult = {
  key: 'permits-expired-2024',
  title: 'Permits expired in 2024',
  kind: 'metric',
  dataset: 'Permits.xlsx (filtered) joined to Projects.xlsx',
  summary:
    '142 permits expired in calendar year 2024, up 12% on 2023 (127). Q3 carried the largest share at 41 expiries, driven by the commercial fit-out backlog.',
  metrics: [
    {
      label: 'Permits expired (2024)',
      value: '142',
      sub: 'of 1,461 active permits',
      trend: { direction: 'up', label: '+12% vs 2023' },
    },
    {
      label: 'Not yet renewed',
      value: '38',
      sub: '27% of expiries',
      trend: { direction: 'up', label: '+6 vs 2023' },
    },
    {
      label: 'Avg days to renewal',
      value: '21',
      sub: 'after expiry',
      trend: { direction: 'down', label: '−3 days' },
    },
  ],
  chart: {
    unit: 'permits',
    bars: [
      { label: 'Q1', value: 31 },
      { label: 'Q2', value: 33 },
      { label: 'Q3', value: 41, emphasis: true },
      { label: 'Q4', value: 37 },
    ],
  },
  explanation: {
    filters: [
      "expiry_date BETWEEN '2024-01-01' AND '2024-12-31'",
      "status = 'expired'",
    ],
    joins: ['Permits.permit_id → Projects.project_id'],
    assumptions: [
      'Calendar year, not financial year.',
      'Permits superseded by a renewal before expiry are excluded.',
    ],
  },
  freshness: FRESHNESS,
  followUps: [
    'Which contractors held the most expired permits in 2024?',
    'Show the permit approval trend by quarter for 2024.',
    'What is the SOP for renewing an expired permit to commence works?',
  ],
  exportable: true,
}

const FAILED_INSPECTIONS_BY_CONTRACTOR: StructuredResult = {
  key: 'failed-inspections-by-contractor',
  title: 'Contractors with the most failed inspections (2024)',
  kind: 'table',
  dataset: 'Inspections.xlsx joined to Contractors.xlsx',
  summary:
    'Across 2024, EcoFirm Pte Ltd recorded the most failed inspections (17), but Sunway Construction had the highest failure rate at 23%. The top five contractors account for 61% of all failures.',
  metrics: [
    {
      label: 'Total failed inspections',
      value: '96',
      sub: 'of 742 conducted',
      trend: { direction: 'down', label: '−8% vs 2023' },
    },
    {
      label: 'Highest failure rate',
      value: '23%',
      sub: 'Sunway Construction',
    },
  ],
  table: {
    columns: [
      { key: 'contractor', label: 'Contractor' },
      { key: 'inspections', label: 'Inspections', numeric: true },
      { key: 'failed', label: 'Failed', numeric: true },
      { key: 'rate', label: 'Fail rate', numeric: true },
    ],
    rows: [
      { contractor: 'EcoFirm Pte Ltd', inspections: 94, failed: 17, rate: '18%' },
      { contractor: 'Sunway Construction', inspections: 61, failed: 14, rate: '23%' },
      { contractor: 'GreenBuild Pte Ltd', inspections: 88, failed: 11, rate: '13%' },
      { contractor: 'Tiong Seng Contractors', inspections: 73, failed: 10, rate: '14%' },
      { contractor: 'Kimly Construction', inspections: 66, failed: 7, rate: '11%' },
      { contractor: 'Lum Chang Building', inspections: 58, failed: 6, rate: '10%' },
      { contractor: 'BCA Builders', inspections: 49, failed: 4, rate: '8%' },
    ],
    note: 'Ranked by failed inspections, then failure rate.',
  },
  explanation: {
    filters: ["inspection_date >= '2024-01-01'", "result = 'fail'"],
    joins: ['Inspections.contractor_id → Contractors.contractor_id'],
    assumptions: [
      'Re-inspections counted as separate inspections.',
      'Failure rate = failed ÷ total inspections for that contractor.',
    ],
  },
  freshness: FRESHNESS,
  followUps: [
    'List projects with overdue inspections as an exception report.',
    'What are the penalties for repeated safety or compliance breaches?',
    'Which inspection types fail most often?',
  ],
  exportable: true,
}

const PERMIT_APPROVALS_BY_QUARTER: StructuredResult = {
  key: 'permit-approvals-by-quarter-2024',
  title: 'Permit approvals by quarter (2024)',
  kind: 'trend',
  dataset: 'Permits.xlsx (approved)',
  summary:
    '1,461 permits were approved in 2024, rising steadily from 318 in Q1 to a peak of 402 in Q3 before easing to 377 in Q4, a 19% increase across the year.',
  metrics: [
    {
      label: 'Approved in 2024',
      value: '1,461',
      trend: { direction: 'up', label: '+19% YoY' },
    },
    {
      label: 'Peak quarter',
      value: 'Q3',
      sub: '402 approvals',
    },
    {
      label: 'Median time to approval',
      value: '11 days',
      trend: { direction: 'down', label: '−2 days YoY' },
    },
  ],
  chart: {
    unit: 'approvals',
    bars: [
      { label: 'Q1', value: 318 },
      { label: 'Q2', value: 364 },
      { label: 'Q3', value: 402, emphasis: true },
      { label: 'Q4', value: 377 },
    ],
  },
  explanation: {
    filters: ["status = 'approved'", "approval_date IN 2024"],
    joins: ['–'],
    assumptions: ['Grouped by calendar quarter of approval_date.'],
  },
  freshness: FRESHNESS,
  followUps: [
    'How many permits expired in 2024?',
    'Which contractors submitted the most permit applications?',
    'What is the standard process for obtaining a permit to commence site works?',
  ],
  exportable: true,
}

const OVERDUE_INSPECTIONS: StructuredResult = {
  key: 'overdue-inspections',
  title: 'Projects with overdue inspections',
  kind: 'exception',
  dataset: 'Inspections.xlsx joined to Projects.xlsx & Contractors.xlsx',
  summary:
    '9 active projects have inspections overdue by more than 14 days as of today. Marina Coastal Mixed-Use is the most overdue at 32 days; all nine are flagged for follow-up under SOP-UD-002.',
  metrics: [
    {
      label: 'Overdue inspections',
      value: '9',
      sub: '> 14 days past due',
      trend: { direction: 'up', label: '+3 this month' },
    },
    {
      label: 'Most overdue',
      value: '32 days',
      sub: 'Marina Coastal Mixed-Use',
    },
  ],
  table: {
    columns: [
      { key: 'project', label: 'Project' },
      { key: 'contractor', label: 'Contractor' },
      { key: 'due', label: 'Inspection due' },
      { key: 'overdue', label: 'Days overdue', numeric: true },
    ],
    rows: [
      { project: 'Marina Coastal Mixed-Use', contractor: 'Sunway Construction', due: '15 May 2026', overdue: 32 },
      { project: 'Tampines North Blk 142', contractor: 'EcoFirm Pte Ltd', due: '22 May 2026', overdue: 25 },
      { project: 'Jurong Lake Commercial', contractor: 'Tiong Seng Contractors', due: '28 May 2026', overdue: 19 },
      { project: 'Bidadari Park Residences', contractor: 'GreenBuild Pte Ltd', due: '01 Jun 2026', overdue: 16 },
      { project: 'Woodlands Health Annexe', contractor: 'Kimly Construction', due: '02 Jun 2026', overdue: 15 },
    ],
    note: 'Showing 5 of 9, sorted by days overdue.',
  },
  explanation: {
    filters: [
      "next_inspection_due < CURRENT_DATE - INTERVAL '14 days'",
      "project.status = 'active'",
    ],
    joins: [
      'Inspections.project_id → Projects.project_id',
      'Projects.contractor_id → Contractors.contractor_id',
    ],
    assumptions: ['Today = 18 Jun 2026.', 'Completed projects excluded.'],
  },
  freshness: FRESHNESS,
  citations: [
    {
      docCode: 'SOP-UD-002',
      section: '§6.4 Inspection Scheduling',
      quote:
        'A follow-up inspection must be scheduled within 14 days of the original due date; overdue items are escalated to the project officer.',
    },
  ],
  followUps: [
    'Which contractors have the most failed inspections this year?',
    'What is the escalation process for an overdue inspection?',
    'Draft an audit observation for the overdue inspections.',
  ],
  exportable: true,
}

const PROJECT_VALUE_BY_CONTRACTOR: StructuredResult = {
  key: 'project-value-by-contractor',
  title: 'Total active project value by contractor',
  kind: 'table',
  dataset: 'Projects.xlsx joined to Contractors.xlsx',
  summary:
    'Active projects total S$1.42b across 7 contractors. Sunway Construction holds the largest active portfolio at S$364m (26%), followed by Tiong Seng at S$298m.',
  metrics: [
    {
      label: 'Total active value',
      value: 'S$1.42b',
      sub: 'across 48 projects',
    },
    {
      label: 'Largest portfolio',
      value: 'S$364m',
      sub: 'Sunway Construction · 26%',
    },
  ],
  table: {
    columns: [
      { key: 'contractor', label: 'Contractor' },
      { key: 'projects', label: 'Active projects', numeric: true },
      { key: 'value', label: 'Total value', numeric: true },
      { key: 'share', label: 'Share', numeric: true },
    ],
    rows: [
      { contractor: 'Sunway Construction', projects: 9, value: 'S$364m', share: '26%' },
      { contractor: 'Tiong Seng Contractors', projects: 8, value: 'S$298m', share: '21%' },
      { contractor: 'GreenBuild Pte Ltd', projects: 7, value: 'S$241m', share: '17%' },
      { contractor: 'EcoFirm Pte Ltd', projects: 8, value: 'S$192m', share: '14%' },
      { contractor: 'Kimly Construction', projects: 6, value: 'S$148m', share: '10%' },
      { contractor: 'Lum Chang Building', projects: 5, value: 'S$102m', share: '7%' },
      { contractor: 'BCA Builders', projects: 5, value: 'S$71m', share: '5%' },
    ],
  },
  explanation: {
    filters: ["project.status = 'active'"],
    joins: ['Projects.contractor_id → Contractors.contractor_id'],
    assumptions: ['Value = contracted project value, not amount disbursed.'],
  },
  freshness: FRESHNESS,
  followUps: [
    'Which contractors have the most failed inspections this year?',
    'How many permits expired in 2024?',
    'Show permit approvals by quarter for 2024.',
  ],
  exportable: true,
}

export const STRUCTURED_RESULTS: StructuredResult[] = [
  PERMITS_EXPIRED_2024,
  FAILED_INSPECTIONS_BY_CONTRACTOR,
  PERMIT_APPROVALS_BY_QUARTER,
  OVERDUE_INSPECTIONS,
  PROJECT_VALUE_BY_CONTRACTOR,
]

const KEYWORDS: { key: string; keywords: string[] }[] = [
  {
    key: 'permits-expired-2024',
    keywords: ['expired', 'expir', 'lapsed permit'],
  },
  {
    key: 'failed-inspections-by-contractor',
    keywords: ['failed inspection', 'most failed', 'inspection failure', 'fail rate', 'failing inspection'],
  },
  {
    key: 'permit-approvals-by-quarter-2024',
    keywords: ['approval', 'approved', 'by quarter', 'permit trend', 'quarterly'],
  },
  {
    key: 'overdue-inspections',
    keywords: ['overdue', 'exception', 'past due', 'late inspection', 'outstanding inspection'],
  },
  {
    key: 'project-value-by-contractor',
    keywords: ['project value', 'total value', 'portfolio', 'value by contractor', 'contract value'],
  },
]

/** Match a free-text query to a curated structured result, if any. */
export function matchStructuredData(query: string): StructuredResult | null {
  const needle = query.toLowerCase()
  for (const entry of KEYWORDS) {
    if (entry.keywords.some((keyword) => needle.includes(keyword))) {
      return STRUCTURED_RESULTS.find((item) => item.key === entry.key) ?? null
    }
  }
  return null
}
