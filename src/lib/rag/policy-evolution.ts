/**
 * Curated, corpus-grounded "policy evolution" intelligence.
 *
 * The hero demo flow answers "how has a policy evolved, and where does it
 * conflict with its SOP?" with a structured report (timeline → changed clauses
 * → contradictions → citations → follow-ups) instead of a plain chat answer.
 *
 * Every quote, version, date and section reference here is taken verbatim from
 * the mock corpus (POL-UD-002 v3.2 and SOP-UD-002 v2.4). The chat tool grounds
 * the report with a live retrieval; this module supplies the structure.
 */

export type PolicyDocRef = {
  code: string
  title: string
  version: string
  effectiveDate: string
  owner: string
  sourceType: 'policy' | 'sop'
}

export type TimelineEvent = {
  date: string
  version: string
  docCode: string
  label: string
  summary: string
  kind: 'baseline' | 'update' | 'review'
}

export type ChangedClause = {
  docCode: string
  section: string
  title: string
  kind: 'updated' | 'added'
  detail: string
}

export type ContradictionSide = {
  code: string
  section: string
  quote: string
}

export type Contradiction = {
  id: string
  title: string
  severity: 'high' | 'medium' | 'low'
  requires: ContradictionSide
  conflictsWith: ContradictionSide
  resolution: { rule: string; docCode: string; section: string }
}

export type PolicyCitation = {
  id: number
  docCode: string
  docTitle: string
  section: string
  quote: string
  sourceType: 'policy' | 'sop'
}

export type PolicyEvolution = {
  key: string
  topic: string
  summary: string
  documents: PolicyDocRef[]
  timeline: TimelineEvent[]
  changedClauses: ChangedClause[]
  contradictions: Contradiction[]
  citations: PolicyCitation[]
  followUps: string[]
}

const SUSTAINABLE_URBAN_DESIGN: PolicyEvolution = {
  key: 'sustainable-urban-design',
  topic: 'Sustainable Urban Design: POL-UD-002 & SOP-UD-002',
  summary:
    'The Green Building & Sustainability Standards Policy (POL-UD-002) reached v3.2 on 15 Jan 2025, tightening renewable-energy thresholds and adding mandatory biodiversity requirements. Its companion procedure SOP-UD-002 (v2.4) operationalises it, but three clauses conflict, all resolved in the policy’s favour by SOP §10.1.',
  documents: [
    {
      code: 'POL-UD-002',
      title: 'Green Building & Sustainability Standards Policy',
      version: '3.2',
      effectiveDate: '15 January 2025',
      owner: 'Sustainability & Environment Department',
      sourceType: 'policy',
    },
    {
      code: 'SOP-UD-002',
      title: 'Sustainability Assessment & Certification Process',
      version: '2.4',
      effectiveDate: '15 January 2025',
      owner: 'Sustainability & Environment Department',
      sourceType: 'sop',
    },
  ],
  timeline: [
    {
      date: 'Before v3.2',
      version: '≤ 3.1',
      docCode: 'POL-UD-002',
      label: 'Earlier baseline',
      summary:
        'Earlier renewable-energy thresholds in force; biodiversity preservation not yet a mandatory section. (Inferred from the v3.2 change log, which records these as the changes.)',
      kind: 'baseline',
    },
    {
      date: '15 January 2025',
      version: '3.2',
      docCode: 'POL-UD-002',
      label: 'Policy update takes effect',
      summary:
        'Change log: "Updated renewable energy thresholds and added biodiversity requirements." §2.2 renewable thresholds revised; §4 biodiversity requirements added.',
      kind: 'update',
    },
    {
      date: '15 January 2025',
      version: '2.4',
      docCode: 'SOP-UD-002',
      label: 'Procedure aligned',
      summary:
        'Change log: "Enhanced deviation workflow and clarified exception process." Operationalises POL-UD-002 §8.',
      kind: 'update',
    },
    {
      date: '15 January 2026',
      version: '–',
      docCode: 'POL-UD-002',
      label: 'Annual review scheduled',
      summary:
        'Review Date 15 Jan 2026: annual policy review by the Sustainability & Environment Department (POL-UD-002 §10.1).',
      kind: 'review',
    },
  ],
  changedClauses: [
    {
      docCode: 'POL-UD-002',
      section: '§2.2',
      title: 'Renewable Energy Requirements',
      kind: 'updated',
      detail:
        'Commercial projects >5,000 sqm GFA must provide 20% of annual energy from renewable sources; residential >150 units, 15% of common-area energy. Renewable energy credits capped at 30% of the requirement.',
    },
    {
      docCode: 'POL-UD-002',
      section: '§4',
      title: 'Biodiversity Preservation Requirements',
      kind: 'added',
      detail:
        'New mandatory ecological site assessment, zero net loss of biodiversity, retention of 60% of mature trees (or 3:1 replacement), and a minimum 70% native-species landscaping.',
    },
  ],
  contradictions: [
    {
      id: 'alt-measures',
      title: 'Exception "alternative measures": mandatory vs optional',
      severity: 'high',
      requires: {
        code: 'POL-UD-002',
        section: '§8.2',
        quote:
          'Requires "alternative compliance measures or mitigation" with every exception request.',
      },
      conflictsWith: {
        code: 'SOP-UD-002',
        section: '§8.3',
        quote:
          '"Propose compensatory sustainability enhancements (this SOP suggests but doesn’t mandate, whereas POL-UD-002 requires alternative measures)."',
      },
      resolution: {
        rule:
          'POL-UD-002 governs: alternative compliance measures are mandatory on every exception.',
        docCode: 'SOP-UD-002',
        section: '§10.1',
      },
    },
    {
      id: 'renewable-threshold',
      title: 'Renewable-energy threshold for sub-$10M projects',
      severity: 'medium',
      requires: {
        code: 'POL-UD-002',
        section: '§2.2',
        quote:
          '20% renewable energy is the mandatory minimum for all commercial projects >5,000 sqm GFA.',
      },
      conflictsWith: {
        code: 'SOP-UD-002',
        section: '§5.2',
        quote:
          'For projects <$10M, "15% renewable energy = 3 bonus points", a compliance pathway that differs from the policy.',
      },
      resolution: {
        rule:
          'The higher 20% threshold applies where both conditions hold (commercial >5,000 sqm AND any value tier); the Sustainability Consultant must flag the discrepancy.',
        docCode: 'SOP-UD-002',
        section: '§5.2',
      },
    },
    {
      id: 'approval-timeline',
      title: 'Exception approval timeline: 25 vs 30 days',
      severity: 'low',
      requires: {
        code: 'POL-UD-002',
        section: '§8.2',
        quote: '25 days maximum for the exception approval decision.',
      },
      conflictsWith: {
        code: 'SOP-UD-002',
        section: '§8.3',
        quote:
          'Allows up to 30 days for the complete process, including implementation.',
      },
      resolution: {
        rule:
          'POL-UD-002 supersedes: the 25-day decision SLA governs; the SOP’s extra time covers implementation only.',
        docCode: 'SOP-UD-002',
        section: '§10.1',
      },
    },
  ],
  citations: [
    {
      id: 1,
      docCode: 'POL-UD-002',
      docTitle: 'Green Building & Sustainability Standards Policy',
      section: '§2.2 Renewable Energy Requirements',
      quote:
        'All commercial projects >5,000 sqm GFA: 20% of annual energy consumption from renewable sources.',
      sourceType: 'policy',
    },
    {
      id: 2,
      docCode: 'POL-UD-002',
      docTitle: 'Green Building & Sustainability Standards Policy',
      section: '§4.2 Protection Measures',
      quote:
        'Zero net loss of biodiversity; retain 60% of mature trees (DBH >50cm) or provide 3:1 replacement; minimum 70% of plant species native to region.',
      sourceType: 'policy',
    },
    {
      id: 3,
      docCode: 'POL-UD-002',
      docTitle: 'Green Building & Sustainability Standards Policy',
      section: '§8.2 Exception Request Procedure',
      quote:
        'Propose alternative compliance measures or mitigation. Approval decision within 25 days maximum.',
      sourceType: 'policy',
    },
    {
      id: 4,
      docCode: 'SOP-UD-002',
      docTitle: 'Sustainability Assessment & Certification Process',
      section: '§8.3 Deviation Process',
      quote:
        'Propose compensatory sustainability enhancements (this SOP suggests but doesn’t mandate, whereas POL-UD-002 requires alternative measures).',
      sourceType: 'sop',
    },
    {
      id: 5,
      docCode: 'SOP-UD-002',
      docTitle: 'Sustainability Assessment & Certification Process',
      section: '§5.2 Energy Performance Scoring',
      quote:
        'The 15% threshold for projects <$10M creates a compliance pathway that differs from POL-UD-002 Section 2.2 which states 20% for all commercial projects >5,000 sqm.',
      sourceType: 'sop',
    },
    {
      id: 6,
      docCode: 'SOP-UD-002',
      docTitle: 'Sustainability Assessment & Certification Process',
      section: '§10.1 Policy-SOP Alignment',
      quote:
        'In all cases of conflict, POL-UD-002 requirements supersede this SOP.',
      sourceType: 'sop',
    },
  ],
  followUps: [
    'Which active projects fall under the 20% renewable energy threshold?',
    'Walk me through the exception request workflow (Form EX-04).',
    'What biodiversity assessment is required for greenfield sites?',
  ],
}

const POLICY_EVOLUTIONS: PolicyEvolution[] = [SUSTAINABLE_URBAN_DESIGN]

const TOPIC_KEYWORDS: { key: string; keywords: string[] }[] = [
  {
    key: 'sustainable-urban-design',
    keywords: [
      'sustainab',
      'green building',
      'urban design',
      'renewable',
      'biodiversit',
      'pol-ud-002',
      'sop-ud-002',
      'eco',
      'environment',
      'energy',
    ],
  },
]

/** Match a free-text topic to a curated policy-evolution report, if any. */
export function matchPolicyEvolution(topic: string): PolicyEvolution | null {
  const needle = topic.toLowerCase()
  for (const entry of TOPIC_KEYWORDS) {
    if (entry.keywords.some((keyword) => needle.includes(keyword))) {
      return POLICY_EVOLUTIONS.find((item) => item.key === entry.key) ?? null
    }
  }
  return null
}
