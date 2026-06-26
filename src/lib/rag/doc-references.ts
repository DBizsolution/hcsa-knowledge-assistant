import type { PolicyEvolution, PolicyDocRef } from './policy-evolution'

/**
 * Resolves inline document references in an assistant answer — doc codes
 * (POL-UD-002), sections (§10.1) or both (SOP §10.1) — to the curated source
 * material in a PolicyEvolution, so the chat can link them to the actual
 * clause. Operates purely on the evolution object the chat already holds; no
 * server access, safe to import in client components.
 */

export type ResolvedReference = {
  code: string
  title: string
  version: string
  effectiveDate: string
  owner: string
  sourceType: 'policy' | 'sop'
  /** Full section label, e.g. "§10.1 Policy-SOP Alignment", when known. */
  section?: string
  /** Verbatim clause text for the section, when the corpus records it. */
  quote?: string
}

export type ReferenceIndex = {
  docsByCode: Map<string, PolicyDocRef>
  docBySourceType: Map<'policy' | 'sop', PolicyDocRef>
  sections: Map<string, { label: string; quote: string }>
  /** Normalised section → code, only when a section belongs to a single doc. */
  sectionToCode: Map<string, string>
}

const SECTION_RE = /§\s?\d+(?:\.\d+)*/

function normSection(value: string): string | null {
  const match = value.match(SECTION_RE)
  if (!match) return null
  return match[0].replace(/\s+/g, '')
}

export function buildReferenceIndex(
  evolution: PolicyEvolution,
): ReferenceIndex {
  const docsByCode = new Map<string, PolicyDocRef>()
  const docBySourceType = new Map<'policy' | 'sop', PolicyDocRef>()
  for (const doc of evolution.documents) {
    docsByCode.set(doc.code, doc)
    if (!docBySourceType.has(doc.sourceType)) {
      docBySourceType.set(doc.sourceType, doc)
    }
  }

  const sections = new Map<string, { label: string; quote: string }>()
  const sectionCodes = new Map<string, Set<string>>()
  const addSection = (code: string, label: string, quote: string) => {
    const norm = normSection(label)
    if (!norm) return
    const key = `${code}|${norm}`
    if (!sections.has(key)) sections.set(key, { label, quote })
    if (!sectionCodes.has(norm)) sectionCodes.set(norm, new Set())
    sectionCodes.get(norm)?.add(code)
  }

  for (const citation of evolution.citations) {
    addSection(citation.docCode, citation.section, citation.quote)
  }
  for (const clause of evolution.changedClauses) {
    addSection(
      clause.docCode,
      `${clause.section} ${clause.title}`,
      clause.detail,
    )
  }
  for (const contradiction of evolution.contradictions) {
    const { requires, conflictsWith } = contradiction
    addSection(requires.code, requires.section, requires.quote)
    addSection(conflictsWith.code, conflictsWith.section, conflictsWith.quote)
  }

  const sectionToCode = new Map<string, string>()
  for (const [norm, codes] of sectionCodes) {
    if (codes.size === 1) sectionToCode.set(norm, [...codes][0])
  }

  return { docsByCode, docBySourceType, sections, sectionToCode }
}

export function resolveReference(
  index: ReferenceIndex,
  raw: string,
): ResolvedReference | null {
  const text = raw.trim()
  const codeMatch = text.match(/(POL-UD-\d+|SOP-UD-\d+)/i)
  const norm = normSection(text)

  let code: string | undefined
  if (codeMatch) {
    code = codeMatch[1].toUpperCase()
  } else if (/^sop\b/i.test(text)) {
    code = index.docBySourceType.get('sop')?.code
  } else if (/^(pol|policy)\b/i.test(text)) {
    code = index.docBySourceType.get('policy')?.code
  } else if (norm) {
    code = index.sectionToCode.get(norm)
  }

  if (!code) return null
  const doc = index.docsByCode.get(code)
  if (!doc) return null

  const entry = norm ? index.sections.get(`${code}|${norm}`) : undefined
  return {
    code: doc.code,
    title: doc.title,
    version: doc.version,
    effectiveDate: doc.effectiveDate,
    owner: doc.owner,
    sourceType: doc.sourceType,
    section: entry?.label ?? norm ?? undefined,
    quote: entry?.quote,
  }
}
