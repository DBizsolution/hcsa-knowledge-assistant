/**
 * Curated multi-page draft documents for the Document Generation mock. Each
 * template renders as a realistic, paginated "paper" document with inline
 * citations back into the corpus — so the preview reads like a real generated
 * DOCX rather than a single short card.
 */

export type DocSpan = string | { cite: number }

export type DocBlock =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'para'; spans: DocSpan[] }
  | { type: 'list'; items: string[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'callout'; text: string }

export type DocPage = { blocks: DocBlock[] }

export type DocSource = { n: number; ref: string }

export type GeneratedDoc = {
  templateId: string
  docType: string
  title: string
  preparedFor: string
  date: string
  pages: DocPage[]
  sources: DocSource[]
}

const BRIEFING: GeneratedDoc = {
  templateId: 'briefing',
  docType: 'Briefing note',
  title: 'Eco Rebate Eligibility for Contractors',
  preparedFor: 'Development Projects',
  date: '17 June 2026',
  pages: [
    {
      blocks: [
        { type: 'heading', text: '1. Purpose' },
        {
          type: 'para',
          spans: [
            'This note summarises the eligibility criteria, funding and documentation requirements for the contractor eco rebate, drawn from the Eco Rebate Policy and recent contractor correspondence. It is intended to give Development Projects officers a single reference when advising contractors on rebate applications.',
          ],
        },
        { type: 'heading', text: '2. Eligibility criteria' },
        {
          type: 'para',
          spans: [
            'Contractors qualify for the eco rebate when they satisfy the three conditions set out in the Eco Rebate Policy: adoption of approved sustainable materials, achievement of the stipulated energy-efficiency rating, and timely submission of the sustainability compliance report ',
            { cite: 1 },
            '.',
          ],
        },
        {
          type: 'list',
          items: [
            'Energy reduction of at least 30% against the project baseline, verified by a third-party audit above the 35% tier.',
            'Use of materials from the approved sustainable materials register.',
            'No outstanding compliance breaches at the point of application.',
          ],
        },
        {
          type: 'callout',
          text: 'Draft for review. Figures and clauses are cited to source but must be verified against the current policy version before issue.',
        },
      ],
    },
    {
      blocks: [
        { type: 'heading', text: '3. Funding and disbursement' },
        {
          type: 'para',
          spans: [
            'The rebate is calculated as a percentage of qualifying project expenditure and is disbursed after the final site inspection is passed ',
            { cite: 2 },
            '. Contractors with outstanding compliance breaches are ineligible until the breach is closed ',
            { cite: 1 },
            '.',
          ],
        },
        { type: 'subheading', text: 'Indicative rebate tiers' },
        {
          type: 'table',
          columns: ['Energy reduction', 'Rebate', 'Cap'],
          rows: [
            ['30–34%', '10% of qualifying spend', 'S$6,000'],
            ['35–39%', '15% of qualifying spend', 'S$8,000'],
            ['≥ 40%', '20% of qualifying spend', 'S$12,000'],
          ],
        },
        {
          type: 'para',
          spans: [
            'Tiers above 35% require third-party audit verification before disbursement. The cap applies per project, not per contractor ',
            { cite: 2 },
            '.',
          ],
        },
      ],
    },
    {
      blocks: [
        { type: 'heading', text: '4. Required documentation' },
        {
          type: 'para',
          spans: [
            'Contractors must submit the following with each rebate claim ',
            { cite: 3 },
            ':',
          ],
        },
        {
          type: 'list',
          items: [
            'Approved materials declaration.',
            'Energy-efficiency certification from an accredited assessor.',
            'Signed sustainability compliance report.',
            'Final site inspection pass certificate.',
          ],
        },
        { type: 'heading', text: '5. Recommendation' },
        {
          type: 'para',
          spans: [
            'Officers should confirm the contractor’s compliance standing before accepting a claim, and flag any application relying on the 35%+ tier for third-party verification early to avoid disbursement delays.',
          ],
        },
      ],
    },
  ],
  sources: [
    { n: 1, ref: 'POL-UD-002: Eco Rebate Policy, §3.1' },
    { n: 2, ref: 'POL-UD-002: Eco Rebate Policy, §4.2' },
    { n: 3, ref: 'SOP-CO-003: Commercial Fit-out Approvals, §2.4' },
  ],
}

const COMPLIANCE: GeneratedDoc = {
  templateId: 'compliance',
  docType: 'Compliance memo',
  title: 'Tenant Compliance Obligations: Commercial Properties',
  preparedFor: 'Commercial Properties',
  date: '17 June 2026',
  pages: [
    {
      blocks: [
        { type: 'heading', text: '1. Scope' },
        {
          type: 'para',
          spans: [
            'This memo sets out the obligations of commercial tenants under the Tenant Compliance Policy and the escalation path for breaches. It applies to all commercial tenancies administered by HCSA.',
          ],
        },
        { type: 'heading', text: '2. Core obligations' },
        {
          type: 'list',
          items: [
            'Maintain the premises in accordance with the approved use and fit-out conditions.',
            'Submit annual compliance declarations by the stated deadline.',
            'Permit scheduled inspections and remediate findings within the notified period.',
            'Report material changes to operations that affect safety or sustainability obligations.',
          ],
        },
        {
          type: 'para',
          spans: [
            'Obligations apply for the full tenancy term and survive renewal unless explicitly varied in writing ',
            { cite: 1 },
            '.',
          ],
        },
      ],
    },
    {
      blocks: [
        { type: 'heading', text: '3. Breach handling and penalties' },
        {
          type: 'para',
          spans: [
            'Minor violations attract warnings and a rectification period; repeated or unremedied breaches escalate to financial penalties and, ultimately, tenancy review ',
            { cite: 2 },
            '.',
          ],
        },
        {
          type: 'table',
          columns: ['Severity', 'First instance', 'Repeated'],
          rows: [
            ['Minor', 'Written warning + 14-day rectification', 'Penalty notice'],
            ['Major', 'Penalty notice + remediation plan', 'Tenancy review'],
            ['Critical', 'Immediate remediation order', 'Termination review'],
          ],
        },
        {
          type: 'callout',
          text: 'Penalties are subject to the tenant’s right to reconsideration within 21 days of notice.',
        },
      ],
    },
    {
      blocks: [
        { type: 'heading', text: '4. Officer actions' },
        {
          type: 'list',
          items: [
            'Confirm the tenant’s current compliance standing before any approval.',
            'Log all breaches and rectification deadlines in the case record.',
            'Escalate repeated breaches in line with the table above.',
          ],
        },
        { type: 'heading', text: '5. References' },
        {
          type: 'para',
          spans: [
            'This memo is grounded in the Tenant Compliance Policy and the breach-handling correspondence ',
            { cite: 1 },
            ' ',
            { cite: 2 },
            '. Verify against the live policy version before issuing formal notices.',
          ],
        },
      ],
    },
  ],
  sources: [
    { n: 1, ref: 'POL-CO-003: Tenant Compliance Policy, §2.1' },
    { n: 2, ref: 'Email 32: Compliance breach escalation thread' },
  ],
}

const EXECUTIVE: GeneratedDoc = {
  templateId: 'executive',
  docType: 'Executive summary',
  title: 'Sustainability Standards: FY2025 Position',
  preparedFor: 'Leadership',
  date: '17 June 2026',
  pages: [
    {
      blocks: [
        { type: 'heading', text: 'At a glance' },
        {
          type: 'para',
          spans: [
            'The Green Building & Sustainability Standards Policy (POL-UD-002) reached v3.2 in January 2025, tightening renewable-energy thresholds and adding mandatory biodiversity requirements ',
            { cite: 1 },
            '. Its companion SOP has been aligned, with three clause-level conflicts resolved in the policy’s favour.',
          ],
        },
        {
          type: 'table',
          columns: ['Indicator', 'FY2024', 'FY2025'],
          rows: [
            ['Renewable threshold (commercial)', '15%', '20%'],
            ['Biodiversity requirement', 'Guidance', 'Mandatory'],
            ['Exception decision SLA', '30 days', '25 days'],
          ],
        },
      ],
    },
    {
      blocks: [
        { type: 'heading', text: 'What changed' },
        {
          type: 'list',
          items: [
            '§2.2 renewable-energy thresholds revised upward for commercial and residential projects.',
            '§4 biodiversity preservation added as a mandatory section, including ecological site assessment.',
            'Exception workflow tightened to a 25-day decision SLA.',
          ],
        },
        {
          type: 'para',
          spans: [
            'Where the SOP and policy diverge, POL-UD-002 governs ',
            { cite: 2 },
            '. Officers applying the 15% pathway for sub-S$10m projects must flag the discrepancy.',
          ],
        },
      ],
    },
    {
      blocks: [
        { type: 'heading', text: 'Implications' },
        {
          type: 'para',
          spans: [
            'Active commercial projects above 5,000 sqm GFA must now meet the 20% renewable threshold. Project teams should reassess pipeline approvals against the revised standard and prioritise biodiversity assessments for greenfield sites.',
          ],
        },
        {
          type: 'callout',
          text: 'Draft executive summary for leadership review. Confirm figures against the policy change log before circulation.',
        },
      ],
    },
  ],
  sources: [
    { n: 1, ref: 'POL-UD-002: Green Building & Sustainability Standards, §2.2 / §4' },
    { n: 2, ref: 'SOP-UD-002: Sustainability Assessment Process, §10.1' },
  ],
}

export const GENERATED_DOCS: GeneratedDoc[] = [BRIEFING, COMPLIANCE, EXECUTIVE]

export function docForTemplate(templateId: string): GeneratedDoc {
  return GENERATED_DOCS.find((doc) => doc.templateId === templateId) ?? GENERATED_DOCS[0]
}
