export type Suggestion = {
  label: string
  prompt: string
  category: string
}

export const SUGGESTIONS: Suggestion[] = [
  {
    category: 'Sustainability',
    label: 'Eco rebate eligibility',
    prompt:
      'What are the eligibility criteria for the eco rebate for contractors?',
  },
  {
    category: 'Email synthesis',
    label: 'EcoRebate rejection',
    prompt:
      "Summarise the EcoRebate rejection and the contractor's request for reconsideration.",
  },
  {
    category: 'Financial report',
    label: 'HDB FY2022/23 results',
    prompt:
      "What was HDB's net deficit for the financial year 2022/2023? Cite the report.",
  },
  {
    category: 'Requirements',
    label: 'Rebate documentation',
    prompt:
      'What documentation must a contractor submit to claim the eco rebate?',
  },
]
