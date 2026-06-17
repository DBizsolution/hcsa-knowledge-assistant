/**
 * Seed data for the hi-fi mock pages (Annex B non-functional pages).
 * Grounded in the real mock corpus and the Annex A performance metrics so the
 * prototype reads as a coherent, production-shaped system.
 */

export const KB_STATS = {
  documents: 62,
  chunks: 770,
  embeddings: 770,
  sources: 4,
  embeddingModel: 'text-embedding-3-small',
  vectorStore: 'Supabase pgvector',
  lastSync: '17 Jun 2026, 09:12',
}

export type DocStatus = 'indexed' | 'processing' | 'failed'

export type KbDocument = {
  title: string
  type: 'policy' | 'sop' | 'email' | 'report'
  collection: string
  pages: number
  chunks: number
  status: DocStatus
  updated: string
}

export const DOCUMENTS: KbDocument[] = [
  { title: 'SOP-UD-002 — Urban Development Site Safety', type: 'sop', collection: 'SOPs & Policies', pages: 14, chunks: 34, status: 'indexed', updated: '12 Jun 2026' },
  { title: 'SOP-CO-003 — Commercial Fit-out Approvals', type: 'sop', collection: 'SOPs & Policies', pages: 11, chunks: 24, status: 'indexed', updated: '12 Jun 2026' },
  { title: 'POL-UD-002 — Eco Rebate Policy', type: 'policy', collection: 'SOPs & Policies', pages: 9, chunks: 19, status: 'indexed', updated: '10 Jun 2026' },
  { title: 'POL-CO-003 — Tenant Compliance Policy', type: 'policy', collection: 'SOPs & Policies', pages: 9, chunks: 20, status: 'indexed', updated: '10 Jun 2026' },
  { title: 'HDB Annual Report FY2022/23', type: 'report', collection: 'Reports', pages: 188, chunks: 92, status: 'indexed', updated: '02 Jun 2026' },
  { title: 'HDB Annual Report FY2021/22', type: 'report', collection: 'Reports', pages: 176, chunks: 78, status: 'indexed', updated: '02 Jun 2026' },
  { title: 'HDB Financial Statements FY2022/23', type: 'report', collection: 'Reports', pages: 96, chunks: 140, status: 'indexed', updated: '02 Jun 2026' },
  { title: 'HDB Financial Statements FY2021/22', type: 'report', collection: 'Reports', pages: 95, chunks: 141, status: 'indexed', updated: '02 Jun 2026' },
  { title: 'Email Repository (55 messages)', type: 'email', collection: 'Email Repository', pages: 55, chunks: 232, status: 'indexed', updated: '15 Jun 2026' },
  { title: 'Email 60 — Drainage variation request', type: 'email', collection: 'Email Repository', pages: 2, chunks: 4, status: 'processing', updated: '17 Jun 2026' },
]

export const SOURCE_BREAKDOWN = [
  { label: 'Reports', value: 451, color: 'var(--chart-3)' },
  { label: 'Emails', value: 236, color: 'var(--chart-2)' },
  { label: 'SOPs', value: 58, color: 'var(--chart-1)' },
  { label: 'Policies', value: 39, color: 'var(--chart-4)' },
]

export type AppUser = {
  name: string
  email: string
  role: 'Administrator' | 'Knowledge officer' | 'Analyst' | 'Viewer'
  department: string
  status: 'active' | 'invited' | 'suspended'
  lastActive: string
}

export const USERS: AppUser[] = [
  { name: 'Lim Wei Ling', email: 'weiling.lim@hcsa.gov.pu', role: 'Administrator', department: 'Digital Services', status: 'active', lastActive: '2 min ago' },
  { name: 'Rajan Kumar', email: 'rajan.kumar@hcsa.gov.pu', role: 'Knowledge officer', department: 'Health, Safety & Environment', status: 'active', lastActive: '1 hr ago' },
  { name: 'Siti Nurhaliza', email: 'siti.n@hcsa.gov.pu', role: 'Analyst', department: 'Development Projects', status: 'active', lastActive: 'Today, 08:40' },
  { name: 'Tan Boon Hwee', email: 'boonhwee.tan@hcsa.gov.pu', role: 'Knowledge officer', department: 'Sustainability & Environment', status: 'active', lastActive: 'Yesterday' },
  { name: 'Aisha Rahman', email: 'aisha.rahman@hcsa.gov.pu', role: 'Viewer', department: 'Commercial Properties', status: 'invited', lastActive: '—' },
  { name: 'Daniel Ong', email: 'daniel.ong@hcsa.gov.pu', role: 'Analyst', department: 'Development Projects', status: 'suspended', lastActive: '12 May 2026' },
]

export const ROLE_SUMMARY = [
  { role: 'Administrator', count: 2, scope: 'Full access incl. configuration & user management' },
  { role: 'Knowledge officer', count: 5, scope: 'Manage knowledge base, upload, generate documents' },
  { role: 'Analyst', count: 9, scope: 'Chat, evaluation, dashboards' },
  { role: 'Viewer', count: 23, scope: 'Chat and read-only access' },
]

export type Conversation = {
  title: string
  preview: string
  source: string
  messages: number
  date: string
}

export const CONVERSATIONS: Conversation[] = [
  { title: 'Eco rebate eligibility for contractors', preview: 'Eligibility starts at a 30% energy-reduction tier, with third-party audit verification above 35%…', source: 'Email Repository', messages: 6, date: 'Today, 10:24' },
  { title: 'EcoRebate rejection — reconsideration', preview: 'Richard Tan (EcoFirm) was rejected on a 28% water-reduction reading and requested a review…', source: 'Email 1', messages: 5, date: 'Today, 09:02' },
  { title: 'HDB FY2022/23 net deficit', preview: 'HDB recorded a net deficit of $5,380m before a government grant of $5,389m…', source: 'HDB-AR-FY23', messages: 3, date: 'Yesterday' },
  { title: 'Penalties for compliance breaches', preview: 'Minor violations attract warnings and rectification; repeated breaches escalate to…', source: 'Email 32', messages: 4, date: 'Yesterday' },
  { title: 'Rebate calculation and caps', preview: 'The rebate is calculated at 15% of installation cost, capped at $8,000 for a Tier 2 reduction…', source: 'Email 24', messages: 5, date: '15 Jun 2026' },
  { title: 'HDB FY2021/22 development expenditure', preview: 'Development expenditure and the housing deficit for FY2021/22 were…', source: 'HDB FS-22', messages: 4, date: '14 Jun 2026' },
]

export type EvalStatus = 'pass' | 'partial' | 'fail'

export type EvalRow = {
  topic: string
  query: string
  source: string
  category: 'Safety SOP' | 'Financial' | 'Email' | 'Policy'
  factuallyCorrect: boolean
  recall: number
  precision: number
  completeness: number
  faithfulness: number
  status: EvalStatus
}

export const EVAL_ROWS: EvalRow[] = [
  { topic: 'Eco rebate', query: 'Eligibility criteria for the eco rebate for contractors?', source: 'Email 24', category: 'Email', factuallyCorrect: true, recall: 1.0, precision: 0.86, completeness: 1.0, faithfulness: 1.0, status: 'pass' },
  { topic: 'Eco rebate', query: 'How is the rebate amount calculated and capped?', source: 'Email 24', category: 'Email', factuallyCorrect: true, recall: 0.83, precision: 0.83, completeness: 0.8, faithfulness: 1.0, status: 'pass' },
  { topic: 'Eco rebate', query: 'Why was the EcoRebate application rejected?', source: 'Email 1', category: 'Email', factuallyCorrect: true, recall: 1.0, precision: 0.9, completeness: 1.0, faithfulness: 1.0, status: 'pass' },
  { topic: 'Eco rebate', query: 'Energy-reduction tier needed to qualify?', source: 'Email 12', category: 'Email', factuallyCorrect: true, recall: 0.9, precision: 0.9, completeness: 0.75, faithfulness: 1.0, status: 'partial' },
  { topic: 'Compliance', query: 'Penalties for breaching safety or compliance requirements?', source: 'Email 32', category: 'Email', factuallyCorrect: true, recall: 1.0, precision: 1.0, completeness: 1.0, faithfulness: 1.0, status: 'pass' },
  { topic: 'Financials', query: "HDB's net deficit for FY2022/23?", source: 'HDB-AR-FY23', category: 'Financial', factuallyCorrect: true, recall: 1.0, precision: 0.8, completeness: 1.0, faithfulness: 1.0, status: 'pass' },
  { topic: 'Financials', query: 'Government grant received in FY2022/23?', source: 'HDB-AR-FY23', category: 'Financial', factuallyCorrect: true, recall: 1.0, precision: 0.83, completeness: 1.0, faithfulness: 1.0, status: 'pass' },
  { topic: 'Financials', query: 'Development expenditure in FY2021/22?', source: 'HDB FS-22', category: 'Financial', factuallyCorrect: true, recall: 0.75, precision: 0.75, completeness: 0.67, faithfulness: 1.0, status: 'partial' },
  { topic: 'Financials', query: 'Total dwelling units sold in FY2023?', source: 'HDB-AR-FY23', category: 'Financial', factuallyCorrect: false, recall: 0.5, precision: 0.6, completeness: 0.4, faithfulness: 0.8, status: 'fail' },
  { topic: 'Correspondence', query: 'Documentation required for a rebate claim?', source: 'Email 24', category: 'Email', factuallyCorrect: true, recall: 0.86, precision: 0.8, completeness: 0.83, faithfulness: 0.92, status: 'pass' },
  { topic: 'Correspondence', query: 'Which contractor disputed an inspection finding?', source: 'Email 30', category: 'Email', factuallyCorrect: true, recall: 0.8, precision: 0.7, completeness: 0.75, faithfulness: 0.9, status: 'partial' },
  { topic: 'Policy', query: 'Obligations of commercial tenants under the policy?', source: 'POL-CO-003', category: 'Policy', factuallyCorrect: true, recall: 0.9, precision: 0.88, completeness: 0.8, faithfulness: 1.0, status: 'partial' },
]

export const METRICS = {
  accuracy: 0.91,
  recall: 0.87,
  precision: 0.82,
  completeness: 0.85,
  faithfulness: 0.96,
  avgLatencyMs: 2140,
  p95LatencyMs: 4380,
}

export const QUERY_TREND = [
  { label: 'Mon', value: 142 },
  { label: 'Tue', value: 168 },
  { label: 'Wed', value: 196 },
  { label: 'Thu', value: 181 },
  { label: 'Fri', value: 214 },
  { label: 'Sat', value: 64 },
  { label: 'Sun', value: 38 },
]

export const LATENCY_TREND = [1.9, 2.2, 2.0, 2.4, 2.1, 1.8, 2.3, 2.0, 2.6, 2.2, 1.9, 2.1]

export const CATEGORY_ACCURACY = [
  { label: 'Safety SOP', value: 0.94 },
  { label: 'Policy', value: 0.9 },
  { label: 'Financial', value: 0.83 },
  { label: 'Email', value: 0.88 },
]

export const CONSUMPTION = {
  tokensThisMonth: 8_420_000,
  tokensLastMonth: 6_910_000,
  requests: 12_840,
  estimatedCost: 214.6,
  budget: 500,
}

export const CONSUMPTION_BY_MODEL = [
  { model: 'gpt-4o (generation)', tokens: 6_120_000, cost: 168.2 },
  { model: 'text-embedding-3-small', tokens: 2_300_000, cost: 46.4 },
]

export const CONSUMPTION_TREND = [
  { label: 'W1', value: 1.6 },
  { label: 'W2', value: 2.1 },
  { label: 'W3', value: 2.3 },
  { label: 'W4', value: 2.4 },
]

export const CONFIG_DEFAULTS = {
  chatModel: 'gpt-4o',
  embeddingModel: 'text-embedding-3-small',
  temperature: 0.2,
  topK: 8,
  similarityThreshold: 0.2,
  maxSteps: 5,
  systemPrompt:
    'You are the HCSA Knowledge Assistant. Answer using only the HCSA knowledge base and always cite sources. If the answer is not in the sources, say so.',
}
