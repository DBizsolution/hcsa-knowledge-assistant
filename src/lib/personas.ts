import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  Building2,
  Home,
  Landmark,
  Scale,
  ClipboardCheck,
} from 'lucide-react'

/**
 * Persona / agent model (solution-arch §4.6–4.8). Each persona scopes the
 * assistant to an authorised slice of the corpus, reframes the system prompt,
 * and surfaces persona-specific starter prompts. The names and data-source
 * scopes are taken from the tender's persona-to-data-source mapping.
 */

export type PersonaId = 'general' | 'plg' | 'hmg' | 'crg' | 'legal' | 'iag'

/** Source types present in the prototype corpus. */
export type CorpusSource = 'policy' | 'sop' | 'email' | 'report'

export type Persona = {
  id: PersonaId
  /** Short agent code shown on the selector chip. */
  code: string
  label: string
  /** One-line description for the selector menu. */
  blurb: string
  /** Authorised corpus slices — drives the scoped source badges. */
  sources: CorpusSource[]
  /** Human label for the scope, shown under the header. */
  scopeLabel: string
  /** Composer placeholder reflecting the agent's scope. */
  placeholder: string
  /** Persona-specific starter prompts for the empty state. */
  suggestions: string[]
  /** Appended to the system prompt so answers reflect the persona. */
  framing: string
  icon: LucideIcon
  /** Selector accent — kept within the brand palette. */
  accentClass: string
  chipClass: string
}

export const PERSONAS: Persona[] = [
  {
    id: 'general',
    code: 'General',
    label: 'General Knowledge',
    blurb: 'Policies, SOPs, reports and correspondence across HCSA',
    sources: ['policy', 'sop', 'email', 'report'],
    scopeLabel: 'All authorised sources',
    placeholder: 'Ask about policies, SOPs, emails or reports…',
    suggestions: [
      'What are the eligibility criteria for the eco rebate for contractors?',
      "What was HDB's net deficit for the financial year 2022/2023?",
      'What is the standard process for obtaining a permit to commence site works?',
      'Summarise the outstanding issues contractors are waiting on a response for.',
    ],
    framing:
      'Act as the General Knowledge Agent: answer broadly across all authorised policies, SOPs, reports and correspondence.',
    icon: Sparkles,
    accentClass: 'text-primary',
    chipClass:
      'bg-[color-mix(in_oklch,var(--primary),var(--background)_88%)] text-primary',
  },
  {
    id: 'plg',
    code: 'PLG',
    label: 'PLG: Properties & Tenancy',
    blurb: 'Tenancy references, contracts and historical correspondence',
    sources: ['policy', 'sop', 'email'],
    scopeLabel: 'PLG policies, tenancy & correspondence',
    placeholder: 'Ask about tenancy, contracts or PLG correspondence…',
    suggestions: [
      'What obligations do commercial tenants have under the tenancy compliance policy?',
      'Summarise the contractor correspondence on the drainage variation request.',
      'What are the penalties for repeated tenant compliance breaches?',
      'Which approvals are required for a variation to an approved site plan?',
    ],
    framing:
      'Act as the PLG Agent: focus on tenancy, properties, contracts and related correspondence. Prefer PLG policies, SOPs and email records.',
    icon: Building2,
    accentClass: 'text-info',
    chipClass:
      'bg-[color-mix(in_oklch,var(--info),var(--background)_88%)] text-info',
  },
  {
    id: 'hmg',
    code: 'HMG',
    label: 'HMG: Housing Management',
    blurb: 'HMG manuals, SOPs and housing-management guidance',
    sources: ['sop', 'policy'],
    scopeLabel: 'HMG manuals, SOPs & housing records',
    placeholder: 'Ask about housing-management manuals, SOPs or procedures…',
    suggestions: [
      'Explain the site-safety requirements in the Urban Development SOP.',
      'Which inspections are required before a project can move to the next phase?',
      'What is the standard process for obtaining a permit to commence site works?',
      'What are the most common reasons permit applications get rejected?',
    ],
    framing:
      'Act as the HMG Agent: focus on housing-management manuals, SOPs and operational guidance. Explain procedures clearly and step-by-step.',
    icon: Home,
    accentClass: 'text-warning-foreground',
    chipClass: 'bg-warning text-warning-foreground',
  },
  {
    id: 'crg',
    code: 'CRG',
    label: 'CRG: Corporate & Policy',
    blurb: 'Policies, legislation, circulars and case records',
    sources: ['policy', 'sop', 'email'],
    scopeLabel: 'Policies, legislation & circulars',
    placeholder: 'Ask about corporate policy, legislation or circulars…',
    suggestions: [
      'How has the Sustainable Urban Design policy evolved, and where does it conflict with the SOP?',
      'What sustainability standards does HDB require for green building projects?',
      'Where do POL-UD-002 and SOP-UD-002 contradict each other, and which one governs?',
      'What documentation must a contractor submit to claim the eco rebate?',
    ],
    framing:
      'Act as the CRG Agent: focus on corporate policy, legislation, circulars and workflow guidance. Be precise about which policy governs.',
    icon: Landmark,
    accentClass: 'text-success',
    chipClass:
      'bg-[color-mix(in_oklch,var(--success),var(--background)_88%)] text-success',
  },
  {
    id: 'legal',
    code: 'Legal',
    label: 'Legal',
    blurb: 'Legal provisions, precedent and drafting, review-first',
    sources: ['policy', 'email'],
    scopeLabel: 'Legal advice, precedent & provisions',
    placeholder: 'Ask about legal provisions, precedent or risk…',
    suggestions: [
      'Summarise the EcoRebate rejection and the contractor’s request for reconsideration.',
      'Where do the policy and SOP give inconsistent legal positions, and which governs?',
      'What commitments has HDB made to contractors in the correspondence?',
      'Highlight the legal risks in the outstanding contractor disputes.',
    ],
    framing:
      'Act as the Legal Agent: retrieve legal provisions and precedent, highlight legal risks and assumptions, and remember outputs are drafts for human review — never formal legal advice.',
    icon: Scale,
    accentClass: 'text-destructive',
    chipClass:
      'bg-[color-mix(in_oklch,var(--destructive),var(--background)_88%)] text-destructive',
  },
  {
    id: 'iag',
    code: 'IAG',
    label: 'IAG: Internal Audit',
    blurb: 'Audit findings, trends and structured project datasets',
    sources: ['report', 'sop'],
    scopeLabel: 'Audit reports, findings & datasets',
    placeholder: 'Ask about audit findings, trends or project data…',
    suggestions: [
      'How many permits expired in 2024 across all contractors?',
      'Which contractors have the most failed inspections this year?',
      'Show the trend of permit approvals by quarter for 2024.',
      'List projects with overdue inspections as an exception report.',
    ],
    framing:
      'Act as the IAG Agent: focus on internal audit — surface findings, trends and risks, and support audit-observation drafting. Use structured project data where the question is quantitative.',
    icon: ClipboardCheck,
    accentClass: 'text-cat-cyan',
    chipClass:
      'bg-[color-mix(in_oklch,var(--cat-cyan),var(--background)_88%)] text-cat-cyan',
  },
]

export const DEFAULT_PERSONA: PersonaId = 'general'

export function personaById(id: string | undefined | null): Persona {
  return PERSONAS.find((persona) => persona.id === id) ?? PERSONAS[0]
}
