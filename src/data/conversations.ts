/**
 * Dummy past conversations with full transcripts, grounded in the real mock
 * corpus (validated facts: FY22/23 deficit, EcoRebate rejection, policy
 * evolution, penalties). Powers both the /history page and the sidebar history
 * — clicking one loads its transcript into the chat view.
 */

import type { PersonaId } from '@/lib/personas'

export type ChatTurn = { role: 'user' | 'assistant'; text: string }

export type StoredConversation = {
  id: string
  title: string
  /** One-line preview for the history list. */
  preview: string
  /** Primary source the conversation drew on. */
  source: string
  date: string
  persona: PersonaId
  transcript: ChatTurn[]
}

export const CONVERSATIONS: StoredConversation[] = [
  {
    id: 'conv-deficit',
    title: 'HDB net deficit for FY2022/23',
    preview:
      'HDB recorded a net deficit of $5,380m, offset by a government grant of $5,389m…',
    source: 'HDB Annual Report FY2022/23',
    date: 'Today, 10:24',
    persona: 'general',
    transcript: [
      {
        role: 'user',
        text: "What was HDB's net deficit for the financial year 2022/2023?",
      },
      {
        role: 'assistant',
        text: 'For FY2022/23, HDB recorded a **net deficit of $5,380 million** before government grants. This was substantially offset by a government grant of **$5,389 million** for the year, in line with HDB’s role as a public housing provider that prices flats below cost.\n\nThe figures are drawn from the HDB Annual Report FY2022/23 (Statement of Comprehensive Income).',
      },
      {
        role: 'user',
        text: 'What was the main driver of that deficit?',
      },
      {
        role: 'assistant',
        text: 'The **Home Ownership Programme** was the largest contributor. The deficit there reflects the gap between the subsidised sale prices of new flats and their development cost (land, construction and related expenditure). Rental and ancillary segments contributed smaller deficits, while the government grant covers the bulk of the Home Ownership shortfall.',
      },
    ],
  },
  {
    id: 'conv-ecorebate-eligibility',
    title: 'Eco rebate eligibility for contractors',
    preview:
      'Eligibility starts at a 30% energy-reduction tier, with third-party audit verification above 35%…',
    source: 'Email Repository',
    date: 'Today, 09:02',
    persona: 'general',
    transcript: [
      {
        role: 'user',
        text: 'What are the eligibility criteria for the eco rebate for contractors?',
      },
      {
        role: 'assistant',
        text: 'A contractor qualifies for the eco rebate when the project meets the energy-efficiency thresholds and the contractor is in good compliance standing. In summary:\n\n- A measured **energy reduction of at least 30%** against the project baseline.\n- Reductions **above 35%** require **third-party audit verification** before the rebate is approved.\n- Use of materials from the approved sustainable-materials list.\n- **No outstanding compliance breaches** at the time of application.\n\nThis is set out in the eco-rebate correspondence in the email repository.',
      },
      {
        role: 'user',
        text: 'What documentation must they submit with a claim?',
      },
      {
        role: 'assistant',
        text: 'Each claim should include:\n\n1. The approved materials declaration.\n2. Energy-efficiency certification from an accredited assessor.\n3. The signed sustainability compliance report.\n4. The final site-inspection pass certificate.\n\nClaims relying on the 35%+ tier should attach the third-party audit so disbursement isn’t held up.',
      },
    ],
  },
  {
    id: 'conv-policy-evolution',
    title: 'Sustainable Urban Design policy evolution',
    preview:
      'POL-UD-002 reached v3.2 on 15 Jan 2025; three clauses conflict with the SOP, all resolved in the policy’s favour…',
    source: 'POL-UD-002 / SOP-UD-002',
    date: 'Yesterday',
    persona: 'crg',
    transcript: [
      {
        role: 'user',
        text: 'How has the Sustainable Urban Design policy evolved, and where does it conflict with the SOP?',
      },
      {
        role: 'assistant',
        text: 'The **Green Building & Sustainability Standards Policy (POL-UD-002)** reached **v3.2, effective 15 January 2025**. The key changes were tighter renewable-energy thresholds (§2.2, now 20% of annual energy for commercial projects above 5,000 sqm GFA) and a new **mandatory biodiversity section (§4)**.\n\nIts companion procedure **SOP-UD-002 (v2.4)** was aligned the same day, but three clauses still conflict: the exception "alternative measures" being mandatory vs optional, the renewable threshold for sub-$10m projects, and the exception decision timeline (25 vs 30 days). In every case, **SOP §10.1 resolves the conflict in favour of the policy.**',
      },
      {
        role: 'user',
        text: 'Which projects fall under the new 20% renewable threshold?',
      },
      {
        role: 'assistant',
        text: 'All **commercial projects above 5,000 sqm GFA** must now meet the 20% renewable-energy requirement (POL-UD-002 §2.2). Residential projects above 150 units must provide 15% of common-area energy. Where the SOP’s older 15% pathway for sub-$10m projects appears to apply, the higher policy threshold governs and the discrepancy should be flagged.',
      },
    ],
  },
  {
    id: 'conv-rejection',
    title: 'EcoRebate rejection and reconsideration request',
    preview:
      'Richard Tan (EcoFirm) was rejected on a 28% reading below the 30% threshold and requested a review…',
    source: 'Email 1',
    date: 'Yesterday',
    persona: 'legal',
    transcript: [
      {
        role: 'user',
        text: 'Summarise the EcoRebate rejection and the contractor’s request for reconsideration.',
      },
      {
        role: 'assistant',
        text: '**Richard Tan of EcoFirm** had an EcoRebate claim (around $38,000) **rejected** because the measured reduction came in at **28%**, just under the **30% qualifying threshold**.\n\nHe wrote back requesting **reconsideration**, arguing the shortfall was within measurement tolerance and that a re-test under standard conditions would meet the threshold. The correspondence asks HCSA to either accept a re-measurement or explain the basis for the reading used.',
      },
      {
        role: 'user',
        text: 'What would be a defensible response?',
      },
      {
        role: 'assistant',
        text: 'A defensible reply would: (1) confirm the 30% threshold is a firm eligibility criterion, not discretionary; (2) offer a **re-measurement under the standard test conditions** with a third-party audit if the result is near the boundary; and (3) note that any approval still requires the contractor to be in good compliance standing. This keeps the decision consistent and auditable. *(Draft position, for human review, not formal legal advice.)*',
      },
    ],
  },
  {
    id: 'conv-penalties',
    title: 'Penalties for compliance breaches',
    preview:
      'Minor violations attract warnings and rectification; repeated breaches escalate to penalties…',
    source: 'Email 32',
    date: '15 Jun 2026',
    persona: 'general',
    transcript: [
      {
        role: 'user',
        text: 'What are the penalties for breaching safety or compliance requirements?',
      },
      {
        role: 'assistant',
        text: 'Penalties escalate with severity and repetition:\n\n- **Minor violations**: a written warning with a rectification period.\n- **Repeated or unremedied breaches**: financial penalties and a remediation plan.\n- **Serious/critical breaches**: immediate remediation orders, and ultimately a tenancy or contract review.\n\nThe escalation path is described in the compliance correspondence (Email 32).',
      },
    ],
  },
  {
    id: 'conv-rebate-calc',
    title: 'Rebate calculation and caps',
    preview:
      'The rebate is 15% of installation cost, capped at $8,000 for a Tier 2 reduction…',
    source: 'Email 24',
    date: '14 Jun 2026',
    persona: 'general',
    transcript: [
      {
        role: 'user',
        text: 'How is the rebate amount calculated and what are the caps?',
      },
      {
        role: 'assistant',
        text: 'The rebate is calculated as a **percentage of qualifying installation cost**, with a per-project cap that rises by tier. For a **Tier 2 reduction**, the rebate is **15% of installation cost, capped at $8,000**. Higher tiers attract a larger percentage and cap, while the cap applies per project rather than per contractor. Disbursement follows a passed final site inspection (Email 24).',
      },
    ],
  },
]

export function conversationById(id: string): StoredConversation | undefined {
  return CONVERSATIONS.find((conversation) => conversation.id === id)
}
