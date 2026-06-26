# Citation detail view, prominent agent selector & visible switching — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-source detail modal for citations, make the agent selector a prominent primary control, make mid-conversation agent switches visible with a fresh-chat option, and fix truncated topic-card blurbs.

**Architecture:** All client-side, in `singapore/web`. A new data builder reconstructs a representative document per source type (the corpus stores only chunks). A new Dialog renders it with the real excerpt highlighted. The persona selector is restyled in place. Agent switches are tracked as client-only UI markers (never sent to the model) and interleaved into the transcript.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, base-ui shadcn components, AI SDK v6 (`@ai-sdk/react` `useChat`), Zustand, Lucide icons, sonner toasts.

## Global Constraints

- Package manager: **pnpm** (never npm/yarn).
- **No test runner is configured** — verification is `pnpm lint` (must pass clean) + visual checks in `pnpm dev`. Do NOT add a test framework.
- Code style: 2-space indent, single quotes, **no semicolons** (prettier), functional components, **named exports only**, descriptive names, minimal comments, Lucide React icons, `cn` from `@/lib/utils`.
- base-ui shadcn conventions: dialog/dropdown triggers use the **`render` prop**, not `asChild`. `DropdownMenuLabel` must be wrapped in `DropdownMenuGroup`.
- `teal-*` and `hdb-red` are intentional remapped aliases in this theme — using `teal-600`/`teal-50`/`teal-800` is correct (matches existing chat UI).
- Do NOT change retrieval, the API route, or how persona affects the system prompt. Switching still applies to the next message only.
- Switch markers must NEVER be inserted into `useChat` messages (would pollute `convertToModelMessages`).
- Commit after each task. We are on branch `feat/citation-detail-agent-selector`. The working tree has **unrelated** pre-existing changes (administration/analytics/charts/structured-result/structured-data + REQUIREMENTS-TRACEABILITY.md) — never `git add` those; stage only the files named in each task.
- Run all git/pnpm commands from `/Users/rahul/DBiz/singapore/web`.

---

### Task 1: Two-line topic blurbs

Smallest isolated change — quick win, no dependencies.

**Files:**
- Modify: `src/components/chat/chat-view.tsx` (line ~287, `TopicGrid` blurb span)

**Interfaces:**
- Consumes: nothing
- Produces: nothing

- [ ] **Step 1: Change `truncate` to `line-clamp-2`**

In `src/components/chat/chat-view.tsx`, inside `TopicGrid`, the blurb span currently reads:

```tsx
            <span className="mt-0.5 truncate text-sm text-ink-500">
              {category.blurb}
            </span>
```

Change it to:

```tsx
            <span className="mt-0.5 line-clamp-2 text-sm text-ink-500">
              {category.blurb}
            </span>
```

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Visual check**

Run `pnpm dev`, open the chat at the General empty state. The five topic cards (Policy Intelligence, Sustainability, Financial Report, Site & Permits, Correspondence) now show their blurb across up to two lines (e.g. "Track how policies evolved and where they conflict" no longer ends in "…"). Cards in the same row stay equal height.

- [ ] **Step 4: Commit**

```bash
git add src/components/chat/chat-view.tsx
git commit -m "fix: wrap topic card blurbs to two lines"
```

---

### Task 2: Extract `formatContent` to a shared helper

The new source dialog (Task 4) needs the same excerpt cleanup currently defined inside `source-card.tsx`. Lift it to a tiny shared module so the dialog doesn't import from a sibling component.

**Files:**
- Create: `src/components/chat/format-content.ts`
- Modify: `src/components/chat/source-card.tsx` (remove local def, import instead)

**Interfaces:**
- Produces: `formatContent(raw: string, type: string): string`

- [ ] **Step 1: Create the shared helper**

Create `src/components/chat/format-content.ts` with exactly:

```ts
/** Strip angle-bracket tokens (<addr>, <mailto:…>) and email header lines. */
export function formatContent(raw: string, type: string) {
  let text = raw.replace(/<[^>]+>/g, ' ')
  if (type === 'email') {
    text = text.replace(
      /^\s*(from|to|cc|bcc|subject|date|sent|reply-to|importance)\s*:.*$/gim,
      ' ',
    )
  }
  return text.replace(/\s+/g, ' ').trim()
}
```

- [ ] **Step 2: Remove the local definition from `source-card.tsx`**

In `src/components/chat/source-card.tsx`, delete the local `formatContent` function (the block starting `/** Strip angle-bracket tokens...` through its closing `}`, currently lines 16–26).

- [ ] **Step 3: Import the helper in `source-card.tsx`**

Add this import alongside the existing imports at the top of `src/components/chat/source-card.tsx` (after the `import type { ChatSource } from './types'` line):

```ts
import { formatContent } from './format-content'
```

The existing call `const content = formatContent(source.content, source.sourceType)` is unchanged and now resolves to the imported helper.

- [ ] **Step 4: Lint**

Run: `pnpm lint`
Expected: no errors (no unused vars, no missing imports).

- [ ] **Step 5: Visual check**

Run `pnpm dev`, ask a question that returns sources, expand a source card. The excerpt still renders cleaned (no `<...>` tokens, no email headers) exactly as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/chat/format-content.ts src/components/chat/source-card.tsx
git commit -m "refactor: extract formatContent to a shared chat helper"
```

---

### Task 3: Reconstructed source-document model

Pure data/logic. Builds a representative document per source type with the real excerpt injected as a highlight block.

**Files:**
- Create: `src/data/source-documents.ts`

**Interfaces:**
- Consumes: `ChatSource` from `@/components/chat/types`; `formatContent` from `@/components/chat/format-content` (Task 2)
- Produces:
  - `type SourceDocBlock` (discriminated union, see below)
  - `type SourceDoc = { title: string; sourceType: string; meta: { label: string; value: string }[]; blocks: SourceDocBlock[] }`
  - `buildSourceDocument(source: ChatSource): SourceDoc`

- [ ] **Step 1: Create the model + builder**

Create `src/data/source-documents.ts` with exactly:

```ts
import type { ChatSource } from '@/components/chat/types'
import { formatContent } from '@/components/chat/format-content'

/**
 * The corpus stores only retrieved chunks, so a "full document" is a
 * representative reconstruction per source type with the real cited excerpt
 * woven in as a highlight block. Presented honestly as representative in the UI.
 */
export type SourceDocBlock =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'para'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'callout'; text: string }
  | { type: 'highlight'; text: string }

export type SourceDoc = {
  title: string
  sourceType: string
  meta: { label: string; value: string }[]
  blocks: SourceDocBlock[]
}

type Scaffold = (excerpt: string) => SourceDocBlock[]

const SCAFFOLDS: Record<string, Scaffold> = {
  policy: (excerpt) => [
    { type: 'heading', text: 'Purpose & scope' },
    {
      type: 'para',
      text: 'This policy sets out the eligibility criteria, applicant obligations and assessment process for the programme, and applies to all registered contractors operating within HCSA jurisdiction.',
    },
    { type: 'heading', text: 'Eligibility' },
    {
      type: 'para',
      text: 'Applicants must satisfy each criterion in full before an application proceeds to assessment. Incomplete submissions are returned for rectification.',
    },
    { type: 'highlight', text: excerpt },
    { type: 'heading', text: 'Review & appeals' },
    {
      type: 'para',
      text: 'Rejected applications may be reconsidered within 30 days where new substantiating evidence is provided. Each decision is recorded against the case reference and retained for audit.',
    },
  ],
  sop: (excerpt) => [
    { type: 'heading', text: 'Objective' },
    {
      type: 'para',
      text: 'This standard operating procedure defines the responsibilities, sequencing and safety controls for the activity, ensuring consistent and compliant execution across project sites.',
    },
    { type: 'heading', text: 'Procedure' },
    {
      type: 'list',
      items: [
        'Confirm permits and hazard assessments before work begins.',
        'Sign off and log each control point as it is completed.',
        'Escalate deviations to the responsible officer for approval.',
      ],
    },
    { type: 'highlight', text: excerpt },
    { type: 'heading', text: 'Records' },
    {
      type: 'para',
      text: 'Completed checklists and inspection findings are filed against the site reference and made available for periodic compliance review.',
    },
  ],
  email: (excerpt) => [
    { type: 'subheading', text: 'Correspondence thread' },
    {
      type: 'para',
      text: 'This thread is retained in the email repository and indexed by passage so responses can be cited precisely in future queries.',
    },
    { type: 'heading', text: 'Message' },
    { type: 'highlight', text: excerpt },
    { type: 'heading', text: 'Outcome' },
    {
      type: 'para',
      text: 'The authority acknowledged receipt and set out the documentation required to support the request. The thread remains on file under the case reference.',
    },
  ],
  report: (excerpt) => [
    { type: 'heading', text: 'Financial highlights' },
    {
      type: 'para',
      text: 'The statements present the financial position and operating results for the year, including the reported net deficit before government grant and the corresponding grant receipt.',
    },
    { type: 'highlight', text: excerpt },
    { type: 'heading', text: 'Operational review' },
    {
      type: 'list',
      items: [
        'Development expenditure for the year.',
        'Dwelling units delivered, with prior-year comparatives.',
        'Key programme outcomes and milestones.',
      ],
    },
    { type: 'heading', text: 'Notes' },
    {
      type: 'para',
      text: 'Accounting policies, significant estimates and audit observations are disclosed in the accompanying notes, which are indexed for retrieval alongside the primary statements.',
    },
  ],
}

export function buildSourceDocument(source: ChatSource): SourceDoc {
  const excerpt = formatContent(source.content, source.sourceType)
  const scaffold = SCAFFOLDS[source.sourceType] ?? SCAFFOLDS.report
  return {
    title: source.documentTitle,
    sourceType: source.sourceType,
    meta: [
      { label: 'Reference', value: source.sourcePath },
      { label: 'Passage', value: String(source.chunkIndex + 1) },
      { label: 'Match', value: `${Math.round(source.similarity * 100)}%` },
    ],
    blocks: scaffold(excerpt),
  }
}
```

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors (types resolve, no unused exports).

- [ ] **Step 3: Commit**

```bash
git add src/data/source-documents.ts
git commit -m "feat: add representative source-document reconstruction model"
```

---

### Task 4: Source document dialog + "Open full source" action

Renders the reconstructed doc in a centered modal with the excerpt highlighted, and wires it into the source card.

**Files:**
- Create: `src/components/chat/source-document-dialog.tsx`
- Modify: `src/components/chat/source-card.tsx` (add trigger button in expanded region)

**Interfaces:**
- Consumes: `buildSourceDocument`, `SourceDocBlock` (Task 3); `ChatSource` from `./types`; `TypeBadge` from `@/components/shell/type-badge`; `Dialog*` from `@/components/ui/dialog`; `Button` from `@/components/ui/button`
- Produces: `SourceDocumentDialog({ source: ChatSource; trigger: ReactElement })`

- [ ] **Step 1: Create the dialog**

Create `src/components/chat/source-document-dialog.tsx` with exactly:

```tsx
'use client'

import type { ReactElement } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TypeBadge } from '@/components/shell/type-badge'
import {
  buildSourceDocument,
  type SourceDocBlock,
} from '@/data/source-documents'
import type { ChatSource } from './types'

function Block({ block }: { block: SourceDocBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-ink-700 first:mt-0">
          {block.text}
        </h3>
      )
    case 'subheading':
      return (
        <h4 className="mt-4 text-sm font-semibold text-ink-700">{block.text}</h4>
      )
    case 'para':
      return (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{block.text}</p>
      )
    case 'list':
      return (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-600">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold text-ink-600">
              <tr>
                {block.columns.map((column) => (
                  <th key={column} className="px-3 py-2">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 text-ink-600">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'callout':
      return (
        <p className="mt-3 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs leading-relaxed text-ink-600">
          {block.text}
        </p>
      )
    case 'highlight':
      return (
        <div className="mt-3 rounded-r-lg border-l-4 border-teal-600 bg-teal-50/60 py-2.5 pl-3 pr-3">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
            Cited passage
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-700">
            {block.text}
          </p>
        </div>
      )
  }
}

export function SourceDocumentDialog({
  source,
  trigger,
}: {
  source: ChatSource
  trigger: ReactElement
}) {
  const doc = buildSourceDocument(source)

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <TypeBadge type={doc.sourceType} />
          <DialogTitle className="text-lg leading-snug text-ink-700">
            {doc.title}
          </DialogTitle>
          <DialogDescription>
            Representative view of an indexed HCSA source, with the cited passage
            highlighted.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-3 gap-x-6 gap-y-3 rounded-lg bg-muted/50 p-4">
          {doc.meta.map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-ink-500">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink-700">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-border bg-card p-5">
          {doc.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-xs text-ink-500">
            Representative reconstruction of the indexed source. The full document
            opens in the source system.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast('Opens in the connected source system')}
          >
            Open in source system
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Add the "Open full source" trigger to `source-card.tsx`**

In `src/components/chat/source-card.tsx`, add these two imports — `Maximize2` to the existing `lucide-react` import, and the dialog:

```ts
import { FileText, Mail, Scale, FileBarChart, ChevronDown, Maximize2 } from 'lucide-react'
import { SourceDocumentDialog } from './source-document-dialog'
```

Then replace the expanded-region block (currently lines 76–83):

```tsx
      {expanded && (
        <div className="border-t border-border px-2.5 py-2.5">
          <p className="text-sm leading-6 text-ink-600">{content}</p>
          <p className="mt-1.5 text-xs text-ink-500">
            {source.sourcePath} · passage {source.chunkIndex + 1}
          </p>
        </div>
      )}
```

with:

```tsx
      {expanded && (
        <div className="border-t border-border px-2.5 py-2.5">
          <p className="text-sm leading-6 text-ink-600">{content}</p>
          <p className="mt-1.5 text-xs text-ink-500">
            {source.sourcePath} · passage {source.chunkIndex + 1}
          </p>
          <SourceDocumentDialog
            source={source}
            trigger={
              <button
                type="button"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 transition-colors hover:text-teal-700"
              >
                <Maximize2 className="size-3.5" aria-hidden />
                Open full source
              </button>
            }
          />
        </div>
      )}
```

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Visual check**

Run `pnpm dev`, ask a question that returns sources (e.g. "What are the eligibility criteria for the eco rebate for contractors?"). Expand a source card → click **Open full source**. A centered modal opens showing: the type badge, document title, a 3-cell metadata row (Reference / Passage / Match), a reconstructed multi-section document with the **Cited passage** block highlighted in teal, and a footer with the disclosure + an "Open in source system" button that toasts. Try sources of different types (policy/sop/email/report) to confirm each scaffold renders.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/source-document-dialog.tsx src/components/chat/source-card.tsx
git commit -m "feat: add full source document modal from citations"
```

---

### Task 5: Elevated agent selector

Restyle the persona selector trigger to read as the primary scoping control. Menu contents unchanged.

**Files:**
- Modify: `src/components/chat/persona-selector.tsx`

**Interfaces:**
- Consumes: `PERSONAS`, `personaById`, `PersonaId` (unchanged); persona `chipClass`, `label`, `sources`
- Produces: unchanged `PersonaSelector({ persona, onChange })` signature

- [ ] **Step 1: Replace the trigger markup**

In `src/components/chat/persona-selector.tsx`, replace the outer wrapper + `DropdownMenuTrigger` block (currently the `return (` body from `<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">` through the closing `</DropdownMenuTrigger>`, lines 34–55) with this. The `<DropdownMenuContent>...</DropdownMenuContent>` and the `Scope` badges block below it stay exactly as they are — only the wrapper opening tag and the trigger change:

```tsx
  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
      <div className="flex flex-col gap-1">
        <span className="px-0.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
          Agent
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-muted hover:shadow"
              />
            }
          >
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-lg',
                active.chipClass,
              )}
            >
              <ActiveIcon className="size-4" aria-hidden />
            </span>
            {active.label}
            <ChevronDown className="size-4 text-ink-500" aria-hidden />
          </DropdownMenuTrigger>
```

After this change the JSX nesting is: the new outer `<div class="flex flex-wrap items-end ...">` wraps a `<div class="flex flex-col gap-1">` (eyebrow + `<DropdownMenu>`), and the existing `Scope` badges `<div>` becomes the second child of the outer wrapper. Confirm the `<DropdownMenu>` closing tag `</DropdownMenu>` sits inside the `flex-col` div (i.e. add the extra closing `</div>` for the new `flex-col` wrapper right after `</DropdownMenu>`, before the `Scope` badges div).

- [ ] **Step 2: Close the new wrapper div**

Ensure the `Scope` badges section is preceded by the closing tag for the `flex-col` wrapper. The structure after `</DropdownMenu>` must read:

```tsx
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-ink-500">Scope:</span>
```

(The `Scope` badges `.map(...)` and the final `</div>` wrappers are unchanged.)

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors (balanced JSX tags — a mismatch will fail the build/lint).

- [ ] **Step 4: Visual check**

Run `pnpm dev`. The header now shows a small **"Agent"** eyebrow above a larger, rounded, shadowed trigger with the persona-colored icon chip and the agent name, then **"Scope:"** badges aligned to its baseline. Open the dropdown — the menu (persona list with blurbs + check marks) is unchanged. Switch personas and confirm the icon chip color + label update. Check it in both the empty state and an active conversation.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/persona-selector.tsx
git commit -m "feat: make the agent selector a prominent primary control"
```

---

### Task 6: Agent switch divider component

Presentational component for the transcript divider + fresh-chat nudge. No wiring yet (Task 7 mounts it).

**Files:**
- Create: `src/components/chat/agent-switch-divider.tsx`

**Interfaces:**
- Consumes: `personaById`, `PersonaId` from `@/lib/personas`; `Button` from `@/components/ui/button`
- Produces: `AgentSwitchDivider({ personaId: PersonaId; showNudge: boolean; onNewChat: () => void; onDismiss: () => void })`

- [ ] **Step 1: Create the component**

Create `src/components/chat/agent-switch-divider.tsx` with exactly:

```tsx
'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { personaById, type PersonaId } from '@/lib/personas'

export function AgentSwitchDivider({
  personaId,
  showNudge,
  onNewChat,
  onDismiss,
}: {
  personaId: PersonaId
  showNudge: boolean
  onNewChat: () => void
  onDismiss: () => void
}) {
  const persona = personaById(personaId)
  const Icon = persona.icon

  return (
    <div className="py-1">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-ink-600 shadow-sm">
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-md',
              persona.chipClass,
            )}
          >
            <Icon className="size-3" aria-hidden />
          </span>
          Switched to {persona.code}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      {showNudge && (
        <div className="mx-auto mt-2 flex w-fit items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-ink-600">
          <span>Start a fresh {persona.code} chat?</span>
          <Button
            type="button"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={onNewChat}
          >
            New chat
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="flex size-5 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-muted hover:text-ink-700"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/agent-switch-divider.tsx
git commit -m "feat: add agent switch divider component"
```

---

### Task 7: Wire visible agent switching into the chat view

Track client-only switch markers, interleave them into the transcript, show the fresh-chat nudge for the latest switch, and clear markers on reset/history load.

**Files:**
- Modify: `src/components/chat/chat-view.tsx`

**Interfaces:**
- Consumes: `AgentSwitchDivider` (Task 6); `startNewChat` from `useChatSessionStore`; `PersonaId` from `@/lib/personas`
- Produces: nothing (terminal feature)

- [ ] **Step 1: Update imports**

In `src/components/chat/chat-view.tsx`:

Change the React import (line 3) to add `Fragment`:

```tsx
import { Fragment, useEffect, useRef, useState } from 'react'
```

Change the personas import (line 13) to also import the type:

```tsx
import { personaById, type PersonaId } from '@/lib/personas'
```

Add the divider import alongside the other `./` chat imports (after the `PersonaSelector` import):

```tsx
import { AgentSwitchDivider } from './agent-switch-divider'
```

- [ ] **Step 2: Add the marker type**

Below the existing `conversationToMessages` helper (after its closing `}` near line 27), add:

```tsx
type SwitchMarker = { id: string; personaId: PersonaId; afterMessageId: string }
```

- [ ] **Step 3: Add the `startNewChat` selector**

In the block of `useChatSessionStore` selectors (lines 35–38), add:

```tsx
  const startNewChat = useChatSessionStore((state) => state.startNewChat)
```

- [ ] **Step 4: Add marker state + refs**

Immediately after the existing `const prevCount = useRef(0)` (line 33), add:

```tsx
  const [switchMarkers, setSwitchMarkers] = useState<SwitchMarker[]>([])
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set())
  const prevPersona = useRef(persona)
  const skipNextSwitch = useRef(false)
  const markerCounter = useRef(0)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
```

Note: `messages` is destructured from `useChat` (lines 40–49), which appears AFTER line 33. Move these six lines to just below the `useChat` destructuring block (after `} = useChat({ ... })`, i.e. after line 56) so `messages`/`persona` are in scope. Place them right before `const busy = ...` (line 58).

- [ ] **Step 5: Clear markers on new-chat reset**

In the reset effect (lines 62–67), add two clears so it becomes:

```tsx
  const firstReset = useRef(resetKey)
  useEffect(() => {
    if (resetKey === firstReset.current) return
    firstReset.current = resetKey
    setMessages([])
    setInput('')
    setSwitchMarkers([])
    setDismissedNudges(new Set())
  }, [resetKey, setMessages])
```

- [ ] **Step 6: Suppress the marker on history load + clear markers**

Replace the history-load effect (lines 70–75) with:

```tsx
  // Load a past conversation when one is opened from history (sidebar or page).
  useEffect(() => {
    if (!pending) return
    setMessages(conversationToMessages(pending))
    if (pending.persona !== prevPersona.current) {
      skipNextSwitch.current = true
    }
    setPersona(pending.persona)
    consumePending()
    setSwitchMarkers([])
    setDismissedNudges(new Set())
  }, [pending, setMessages, setPersona, consumePending])
```

- [ ] **Step 7: Add the switch-detection effect**

Add this new effect immediately after the history-load effect from Step 6:

```tsx
  // Mark an agent switch in the transcript when the persona changes mid-chat.
  // Markers are UI-only and never sent to the model.
  useEffect(() => {
    if (persona === prevPersona.current) return
    prevPersona.current = persona
    if (skipNextSwitch.current) {
      skipNextSwitch.current = false
      return
    }
    const msgs = messagesRef.current
    if (msgs.length === 0) return
    const afterMessageId = msgs[msgs.length - 1].id
    const id = `switch-${(markerCounter.current += 1)}`
    setSwitchMarkers((markers) => {
      const last = markers[markers.length - 1]
      if (last && last.afterMessageId === afterMessageId) {
        return [...markers.slice(0, -1), { id, personaId: persona, afterMessageId }]
      }
      return [...markers, { id, personaId: persona, afterMessageId }]
    })
  }, [persona])
```

- [ ] **Step 8: Interleave dividers into the message map**

Replace the message map (lines 113–124) — currently:

```tsx
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={
                    busy &&
                    index === messages.length - 1 &&
                    message.role === 'assistant'
                  }
                  onFollowUp={submit}
                />
              ))}
```

with:

```tsx
              {messages.map((message, index) => {
                const markers = switchMarkers.filter(
                  (marker) => marker.afterMessageId === message.id,
                )
                const lastMarkerId =
                  switchMarkers[switchMarkers.length - 1]?.id
                const lastMessageId = messages[messages.length - 1]?.id
                return (
                  <Fragment key={message.id}>
                    <ChatMessage
                      message={message}
                      isStreaming={
                        busy &&
                        index === messages.length - 1 &&
                        message.role === 'assistant'
                      }
                      onFollowUp={submit}
                    />
                    {markers.map((marker) => (
                      <AgentSwitchDivider
                        key={marker.id}
                        personaId={marker.personaId}
                        showNudge={
                          marker.id === lastMarkerId &&
                          marker.afterMessageId === lastMessageId &&
                          !dismissedNudges.has(marker.id)
                        }
                        onNewChat={startNewChat}
                        onDismiss={() =>
                          setDismissedNudges((prev) =>
                            new Set(prev).add(marker.id),
                          )
                        }
                      />
                    ))}
                  </Fragment>
                )
              })}
```

- [ ] **Step 9: Lint**

Run: `pnpm lint`
Expected: no errors. If `react-hooks/exhaustive-deps` warns about the switch-detection effect, it is intentional that it depends only on `[persona]` (it reads `messages` via `messagesRef` to avoid re-running on every streaming token). Leave the dependency array as `[persona]`; do not add `messages`.

- [ ] **Step 10: Visual check**

Run `pnpm dev`:
1. Ask a question, wait for the answer. Switch the agent (e.g. General → Legal). A divider **"Switched to Legal"** appears after the last message, with a **"Start a fresh Legal chat?"** nudge (New chat + ✕).
2. Click ✕ → nudge disappears, divider stays.
3. Switch again to another agent before sending → only one divider at that point, updated to the newest agent.
4. Send another message → the nudge on the prior divider is gone (divider remains between the two turns).
5. Click **New chat** on a nudge → conversation clears and stays scoped to the selected agent; no divider.
6. Open a past conversation from history → its persona loads with **no** spurious divider; any prior dividers are cleared.
7. Switch agent on an empty chat (no messages) → no divider.

- [ ] **Step 11: Commit**

```bash
git add src/components/chat/chat-view.tsx
git commit -m "feat: show agent switches in the transcript with a fresh-chat nudge"
```

---

## Self-Review

**Spec coverage:**
- Feature 1 (citation → full source modal) → Tasks 2 (helper), 4 (dialog + trigger). ✓
- Feature 2 (reconstructed document model) → Task 3. ✓
- Feature 3 (elevated agent selector) → Task 5. ✓
- Feature 4 (visible agent switching: divider + nudge, client-only markers, collapse, clear on reset/history, history-load suppression, empty-chat no-op) → Tasks 6 (component) + 7 (wiring). ✓
- Feature 5 (two-line topic blurbs) → Task 1. ✓
- Refactor note (lift `formatContent`) → Task 2. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to". All code blocks are complete and copy-pasteable.

**Type consistency:** `SourceDocBlock`/`SourceDoc`/`buildSourceDocument` (Task 3) match their consumption in Task 4. `AgentSwitchDivider` prop names `{ personaId, showNudge, onNewChat, onDismiss }` (Task 6) match the call site (Task 7 Step 8). `SwitchMarker = { id, personaId, afterMessageId }` (Task 7 Step 2) is used consistently in the effect (Step 7) and the render (Step 8). `formatContent(raw, type)` signature (Task 2) matches both callers (`source-card.tsx`, `source-documents.ts`). `startNewChat` matches the store action in `use-chat-session-store.ts`.

**Notes on deviations from spec:** The dialog's metadata uses Reference/Passage/Match (3 cells); the source-type is conveyed by the header `TypeBadge` rather than a duplicate meta cell, avoiding redundancy with the description. The nudge auto-hides when the next message is sent (derived from `afterMessageId !== lastMessageId`) instead of an explicit clear in `submit` — same outcome, less state.
