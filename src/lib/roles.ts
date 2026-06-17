/**
 * Demo role model. Maps an officer's role to the nav groups they can see,
 * so a regular end user gets a trimmed Chat-centric portal while admins get
 * the full operations console. Ranks are cumulative (higher sees everything
 * a lower role sees).
 */

export type Role = 'officer' | 'knowledge_officer' | 'admin'

export type RoleMeta = {
  id: Role
  label: string
  rank: number
  blurb: string
}

export const ROLES: RoleMeta[] = [
  {
    id: 'officer',
    label: 'Officer',
    rank: 0,
    blurb: 'End-user portal — ask questions, draft documents, review history.',
  },
  {
    id: 'knowledge_officer',
    label: 'Knowledge officer',
    rank: 1,
    blurb: 'Also manages the knowledge base and uploads sources.',
  },
  {
    id: 'admin',
    label: 'Administrator',
    rank: 2,
    blurb: 'Full operations console — evaluation, configuration, users.',
  },
]

export const DEFAULT_ROLE: Role = 'admin'

export function roleRank(role: Role): number {
  return ROLES.find((r) => r.id === role)?.rank ?? 0
}

export function roleLabel(role: Role): string {
  return ROLES.find((r) => r.id === role)?.label ?? role
}
