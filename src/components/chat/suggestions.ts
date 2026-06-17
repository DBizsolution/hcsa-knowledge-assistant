import type { LucideIcon } from 'lucide-react'
import { Leaf, Landmark, HardHat, Mail } from 'lucide-react'

export type Suggestion = {
  category: string
  label: string
  prompt: string
  icon: LucideIcon
  /** Icon badge background + foreground. */
  chipClass: string
  /** Category label colour. */
  accentClass: string
  /** Hover border colour. */
  hoverClass: string
}

export const SUGGESTIONS: Suggestion[] = [
  {
    category: 'Sustainability',
    label: 'Eco rebate eligibility',
    prompt:
      'What are the eligibility criteria for the eco rebate for contractors?',
    icon: Leaf,
    chipClass: 'bg-teal-50 text-teal-700',
    accentClass: 'text-teal-700',
    hoverClass: 'hover:border-teal-600',
  },
  {
    category: 'Financial report',
    label: 'HDB FY2022/23 results',
    prompt:
      "What was HDB's net deficit for the financial year 2022/2023? Cite the report.",
    icon: Landmark,
    chipClass:
      'bg-[color-mix(in_oklch,var(--link-blue),white_88%)] text-link-blue',
    accentClass: 'text-link-blue',
    hoverClass: 'hover:border-link-blue',
  },
  {
    category: 'Site & permits',
    label: 'Permit approval delays',
    prompt:
      'What permit or approval delays have contractors reported in the email correspondence?',
    icon: HardHat,
    chipClass: 'bg-amber-50 text-amber-600',
    accentClass: 'text-amber-600',
    hoverClass: 'hover:border-amber-500',
  },
  {
    category: 'Correspondence',
    label: 'EcoRebate rejection',
    prompt:
      "Summarise the EcoRebate rejection and the contractor's request for reconsideration.",
    icon: Mail,
    chipClass:
      'bg-[color-mix(in_oklch,var(--hdb-red),white_90%)] text-hdb-red',
    accentClass: 'text-hdb-red',
    hoverClass: 'hover:border-hdb-red',
  },
]
