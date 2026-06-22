import type { LucideIcon } from 'lucide-react'
import { Leaf, Landmark, HardHat, Mail, GitCompareArrows } from 'lucide-react'

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
    category: 'Policy intelligence',
    blurb: 'Track how policies evolved and where documents conflict',
    prompts: [
      'How has the Sustainable Urban Design policy evolved, and where does it conflict with the SOP?',
      'What changed in the green building policy, and which clauses were affected?',
      'Where do POL-UD-002 and SOP-UD-002 contradict each other, and which one governs?',
      'Show the version timeline and renewable energy threshold changes for sustainable design.',
    ],
    icon: GitCompareArrows,
    chipClass:
      'bg-[color-mix(in_oklch,var(--primary),var(--background)_88%)] text-primary',
    accentClass: 'text-primary',
    hoverClass:
      'hover:border-primary hover:bg-[color-mix(in_oklch,var(--primary),var(--background)_93%)]',
  },
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
    chipClass:
      'bg-[color-mix(in_oklch,var(--success),var(--background)_88%)] text-success',
    accentClass: 'text-success',
    hoverClass:
      'hover:border-[var(--success)] hover:bg-[color-mix(in_oklch,var(--success),var(--background)_93%)]',
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
      'bg-[color-mix(in_oklch,var(--info),var(--background)_88%)] text-info',
    accentClass: 'text-info',
    hoverClass:
      'hover:border-[var(--info)] hover:bg-[color-mix(in_oklch,var(--info),var(--background)_93%)]',
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
    chipClass:
      'bg-[color-mix(in_oklch,var(--cat-cyan),var(--background)_88%)] text-cat-cyan',
    accentClass: 'text-cat-cyan',
    hoverClass:
      'hover:border-[var(--cat-cyan)] hover:bg-[color-mix(in_oklch,var(--cat-cyan),var(--background)_93%)]',
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
      'bg-[color-mix(in_oklch,var(--cat-purple),var(--background)_88%)] text-cat-purple',
    accentClass: 'text-cat-purple',
    hoverClass:
      'hover:border-[var(--cat-purple)] hover:bg-[color-mix(in_oklch,var(--cat-purple),var(--background)_93%)]',
  },
]
