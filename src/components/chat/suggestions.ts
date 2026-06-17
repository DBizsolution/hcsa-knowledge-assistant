import type { LucideIcon } from 'lucide-react'
import { Leaf, Landmark, HardHat, Mail } from 'lucide-react'

export type Category = {
  category: string
  /** Short description shown on the topic card. */
  blurb: string
  prompts: string[]
  icon: LucideIcon
  /** Icon badge background + foreground. */
  chipClass: string
  /** Category label colour. */
  accentClass: string
  /** Hover border + background tint (same hue as the accent). */
  hoverClass: string
}

export const CATEGORIES: Category[] = [
  {
    category: 'Sustainability',
    blurb: 'Eco rebates, green requirements and energy reporting',
    prompts: [
      'What are the eligibility criteria for the eco rebate for contractors?',
      'How much funding is available under the eco rebate scheme and how is it disbursed?',
      'What documentation must a contractor submit to claim the eco rebate?',
      'Which sustainability standards or certifications does HDB require for green building projects?',
      'What are the deadlines for submitting eco rebate applications each financial year?',
    ],
    icon: Leaf,
    chipClass: 'bg-teal-50 text-teal-700',
    accentClass: 'text-teal-700',
    hoverClass: 'hover:border-teal-600 hover:bg-teal-50/60',
  },
  {
    category: 'Financial report',
    blurb: 'Annual results, deficits and financial statements',
    prompts: [
      "What was HDB's net deficit for the financial year 2022/2023? Cite the report.",
      'How did the Home Ownership Programme contribute to the overall deficit in FY2022/23?',
      'What were the main drivers of the year-on-year change in operating expenditure?',
      'Summarise the key figures from the statement of financial position for FY2022/23.',
      'How much government grant did HDB receive in the financial year 2022/2023?',
    ],
    icon: Landmark,
    chipClass:
      'bg-[color-mix(in_oklch,var(--link-blue),white_88%)] text-link-blue',
    accentClass: 'text-link-blue',
    hoverClass:
      'hover:border-link-blue hover:bg-[color-mix(in_oklch,var(--link-blue),white_93%)]',
  },
  {
    category: 'Site & permits',
    blurb: 'Approvals, inspections and on-site compliance',
    prompts: [
      'What permit or approval delays have contractors reported in the email correspondence?',
      'What is the standard process for obtaining a permit to commence site works?',
      'Which inspections are required before a project can move to the next phase?',
      'What are the most common reasons permit applications get rejected?',
      'Who is the approving authority for variations to an approved site plan?',
    ],
    icon: HardHat,
    chipClass: 'bg-amber-50 text-amber-600',
    accentClass: 'text-amber-600',
    hoverClass: 'hover:border-amber-500 hover:bg-amber-50/50',
  },
  {
    category: 'Correspondence',
    blurb: 'Email threads, disputes and contractor requests',
    prompts: [
      "Summarise the EcoRebate rejection and the contractor's request for reconsideration.",
      'What outstanding issues are contractors waiting on a response for?',
      'List the action items and follow-ups raised across the recent email threads.',
      'What commitments has HDB made to contractors in the correspondence?',
      'Which emails reference disputes or escalations, and what was the outcome?',
    ],
    icon: Mail,
    chipClass:
      'bg-[color-mix(in_oklch,var(--hdb-red),white_90%)] text-hdb-red',
    accentClass: 'text-hdb-red',
    hoverClass:
      'hover:border-hdb-red hover:bg-[color-mix(in_oklch,var(--hdb-red),white_94%)]',
  },
]
