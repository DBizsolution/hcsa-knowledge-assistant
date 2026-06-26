# Citation detail view, prominent agent selector & visible agent switching

Date: 2026-06-26
Status: Approved design — ready for implementation plan
Scope: `singapore/web` (HCSA RAG chatbot prototype)

## Background

The chat surfaces RAG citations as inline `[n]` chips plus an expandable list of
`SourceCard`s. Each card expands inline to show a cleaned excerpt and its source
path — but there is no way to read the source "in full". Separately, the agent
("persona") selector is a low-key header dropdown, and switching agents
mid-conversation happens silently with no marker in the transcript and no clean
way to start a fresh scoped chat.

This is a tender-demo prototype. The corpus stores only chunked excerpts (no full
documents), so a "full document view" is necessarily a *representative
reconstruction*, presented honestly as such.

### Relevant current code

- `src/components/chat/source-card.tsx` — inline expand/collapse card; excerpt
  cleaned by `formatContent`. Expanded region at lines 76–83.
- `src/components/chat/chat-message.tsx` — owns citation→card wiring; renders the
  `Collapsible` source list (lines 190–216).
- `src/components/chat/types.ts` — `ChatSource` type (lines 5–14): `ref`,
  `documentTitle`, `sourceType`, `sourceLabel`, `sourcePath`, `chunkIndex`,
  `similarity`, `content`. No `url`/`page`.
- `src/components/chat/persona-selector.tsx` — header dropdown + scope badges.
- `src/lib/personas.ts` — 6 personas, each with `code`, `label`, `scopeLabel`,
  `sources`, `icon`, `accentClass`, `chipClass`.
- `src/components/chat/chat-view.tsx` — `useChat` orchestration; persona read at
  submit and sent per-request (line 94); reset via `resetKey` effect (62–67);
  history load via `pending` effect (70–75); message map (113–124); topic grid
  blurb `truncate` (line 287).
- `src/lib/use-chat-session-store.ts` — `startNewChat()` archives the current
  chat and bumps `resetKey`; `pending`/`consumePending` for history load.
- `src/components/shell/document-preview.tsx` — existing Dialog pattern for a
  representative document view (render-prop trigger, per base-ui).
- `src/components/shell/type-badge.tsx` — `TypeBadge({ type })`.
- `src/data/generated-docs.ts` — block model precedent (`DocBlock` /
  `DocPage` / `DocSpan`) for paginated "paper" docs.

No test runner is configured (`package.json` has no test script). Verification is
`pnpm lint` + visual checks in `pnpm dev`.

## Goals

1. Let users read a citation's source "in full" via a detail modal, with the real
   excerpt highlighted in context.
2. Make the agent selector clearly the primary scoping control.
3. Make mid-conversation agent switches visible in the transcript and offer a
   clean way to start a fresh scoped chat.
4. Fix truncated topic-card blurbs on the General empty state (two lines).

## Non-goals

- No real document store / DMS integration. The full-document view is mock.
- No change to retrieval, the API route, or how persona affects the system
  prompt. Switching still applies to the *next* message (existing behaviour).
- No change to inline `[n]` chip behaviour or the renumbering logic.
- No persona-color theming of the corpus document (the doc belongs to the corpus,
  not the active agent).

---

## Feature 1 — Citation → full source modal

The inline excerpt expand in `SourceCard` is unchanged. Inside the expanded
region, add an **"Open full source"** action (text button, e.g. `Maximize2`
icon, teal accent) that triggers a new `SourceDocumentDialog`.

**`src/components/chat/source-document-dialog.tsx`** (new)

- Props: `{ source: ChatSource; trigger: ReactElement }`. Uses the existing
  `Dialog` with `<DialogTrigger render={trigger} />` (base-ui render-prop), as in
  `document-preview.tsx`.
- `DialogContent` `sm:max-w-2xl`.
- **Header:** `TypeBadge` for `source.sourceType`; `DialogTitle` =
  `source.documentTitle`; sub-line (`DialogDescription`):
  `{sourcePath} · passage {chunkIndex + 1} · {Math.round(similarity*100)}% match`.
- **Body:** scrollable (`max-h-[60vh]`) bordered "paper" rendering the
  reconstructed document (Feature 2). The cited passage is a **highlight block**:
  tinted background + left accent border (teal / source-type accent), a small
  "Cited passage" tag, holding `formatContent(source.content, source.sourceType)`
  (reuse the existing cleanup; export it from `source-card.tsx` or lift it to a
  shared util — see Refactor note).
- **Footer:** disclosure text "Representative reconstruction of the indexed
  source — the full document opens in the source system." + a mock
  **"Open in source system →"** button (`ArrowUpRight`) that calls
  `toast('Opens in the connected source system')` (no navigation).

**`src/components/chat/source-card.tsx`** (modified)

- In the expanded `<div>` (lines 76–83), after the path line, add the
  "Open full source" button wrapped as the dialog trigger.
- `formatContent` is reused by the dialog; export it (or move to a small shared
  helper imported by both).

## Feature 2 — Reconstructed document model

**`src/data/source-documents.ts`** (new)

A focused, self-contained block model (independent of `generated-docs.ts`, which
carries multi-`cite` spans we don't need here):

```ts
export type SourceDocBlock =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'para'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'callout'; text: string }
  | { type: 'highlight'; text: string }   // the real cited excerpt

export type SourceDoc = {
  title: string
  sourceType: string
  meta: { label: string; value: string }[]
  blocks: SourceDocBlock[]
}

export function buildSourceDocument(source: ChatSource): SourceDoc
```

- One believable scaffold **per `sourceType`**:
  - `policy` → Purpose & scope / Eligibility / Review & appeals
  - `sop` → Objective / Procedure (list) / Records
  - `email` → thread framing (From/Subject style intro) / body / outcome
  - `report` → Financial highlights / Operational review / Notes (table)
- The builder injects exactly one `highlight` block (the cleaned
  `source.content`) into the section where it reads most naturally for that type
  (e.g. policy → under Eligibility; email → the body; report → highlights).
- `meta` derived from the source: e.g. Reference = `sourcePath`,
  Passage = `chunkIndex + 1`, Type = `sourceLabel`, Match =
  `{similarity}%`.
- Scaffold prose adapts the existing representative copy in
  `document-preview.tsx`'s `EXCERPTS` so tone stays consistent.

The dialog renders blocks with a small local renderer (headings, paras, list,
table, callout, and the highlighted excerpt). No shared renderer is extracted
from the documents page (kept out of scope to avoid touching unrelated UI).

## Feature 3 — Elevated agent selector

**`src/components/chat/persona-selector.tsx`** (restyle only; menu unchanged)

- Add a small **"Agent"** eyebrow label so the control reads as the agent picker.
- Make the trigger a primary control: larger padding, agent `label` in semibold,
  and a subtle tint using the active persona's accent (reuse `active.chipClass`
  for the icon chip — already present — and an accent border/background derived
  from `active.accentClass`).
- Keep the scope visible: show `active.scopeLabel` / source badges integrated so
  the active agent **and** its authorised sources always read as one prominent
  unit against the `bg-muted/30` header bar.
- Dropdown menu contents (the persona list, `DropdownMenuGroup` +
  `DropdownMenuLabel`, check marks) are unchanged.

No placement change — stays in the header (`chat-view.tsx:102–106`), shown in both
empty and active states.

## Feature 4 — Visible agent switching (divider + fresh-chat nudge)

Behaviour is preserved (switch applies to the next message; prior messages stay
on screen and in model context), but the switch becomes visible and offers a
clean exit. Markers are **client-only UI annotations** — never injected into
`useChat` messages, so `convertToModelMessages` is unaffected.

**`src/components/chat/chat-view.tsx`** (modified)

- New state: `switchMarkers: SwitchMarker[]` where
  `SwitchMarker = { id: string; personaId: PersonaId; afterMessageId: string }`.
  `id` from a module/ref counter (no `Date.now`/`Math.random` needed).
- New state/ref: `activeNudgeMarkerId: string | null` (which marker still shows
  the fresh-chat nudge), and `prevPersona` ref.
- **Detect switch:** `useEffect` keyed on `persona`:
  - Skip if persona unchanged from `prevPersona`.
  - Skip the history-load case: when the `pending` effect sets persona alongside
    messages, set a `skipNextPersonaMarker` ref so this effect no-ops once.
  - If `messages.length === 0`, just update `prevPersona` (no marker — switching
    before the chat starts needs none).
  - Otherwise append a marker anchored to
    `messages[messages.length - 1].id` and set it active for the nudge.
  - **Collapse consecutive switches at the same anchor:** if the last marker has
    the same `afterMessageId` (i.e. no message sent since), replace it instead of
    appending, so rapid A→B→C switching shows a single up-to-date divider.
- **Clear markers** in the `resetKey` effect (62–67) and the `pending` effect
  (70–75); clear `activeNudgeMarkerId` too.
- **Dismiss the nudge** when the user sends the next message: in `submit`, clear
  `activeNudgeMarkerId`.
- **Interleave in render** (message map, 113–124): after each `<ChatMessage>`,
  render any `switchMarkers` whose `afterMessageId === message.id`.

**`src/components/chat/agent-switch-divider.tsx`** (new)

- Props:
  `{ personaId: PersonaId; showNudge: boolean; onNewChat: () => void; onDismiss: () => void }`.
- Renders a subtle horizontal rule with a centered pill: persona icon chip
  (`chipClass`) + "Switched to {label}".
- When `showNudge`, a compact row beneath: "Start a fresh {label} chat?" with a
  `[New chat]` button (calls `onNewChat`) and a dismiss `✕` (calls `onDismiss`).
- `onNewChat` is wired in `chat-view.tsx` to `useChatSessionStore.startNewChat()`
  (archives the current chat, bumps `resetKey`); the selected persona persists in
  its own store, so the fresh chat opens already scoped to the new agent.

## Feature 5 — Two-line topic blurbs

**`src/components/chat/chat-view.tsx`** — `TopicGrid` card blurb (line 287):
change `truncate` → `line-clamp-2`. Grid rows already stretch to equal height, so
mixed blurb lengths stay aligned. One-line CSS change, no logic.

---

## Files

**New**
- `src/data/source-documents.ts`
- `src/components/chat/source-document-dialog.tsx`
- `src/components/chat/agent-switch-divider.tsx`

**Modified**
- `src/components/chat/source-card.tsx` — open-full-source action; export/reuse
  `formatContent`.
- `src/components/chat/persona-selector.tsx` — elevated styling.
- `src/components/chat/chat-view.tsx` — switch markers (state, effect, interleave,
  clear-on-reset/history, nudge dismiss on submit); topic blurb `line-clamp-2`.

### Refactor note (in-scope tidy)

`formatContent` currently lives in `source-card.tsx`. The dialog needs the same
cleanup, so export it from `source-card.tsx` or lift it to a tiny shared helper
(e.g. `src/components/chat/format-content.ts`). Prefer the shared helper to avoid
a component importing from a sibling component.

## Edge cases

- **Switch while empty chat:** no marker; only `prevPersona` updates.
- **Switch to same persona:** no-op.
- **Rapid multi-switch before sending:** collapses to one divider at that anchor
  reflecting the final agent.
- **History load:** persona set with messages must NOT create a divider
  (`skipNextPersonaMarker`); existing markers cleared.
- **New chat / reset:** markers and active nudge cleared.
- **Nudge lifecycle:** shows for the latest switch until dismissed (`✕`),
  superseded by a newer switch, the next message is sent, or the chat resets.
- **Source dialog content:** unknown `sourceType` falls back to the `report`
  scaffold (mirrors `document-preview.tsx`).

## Verification

- `pnpm lint` clean.
- Visual (`pnpm dev`, screenshots):
  - Open a citation → "Open full source" → modal shows reconstructed doc with the
    excerpt highlighted; header metadata correct; footer toast works.
  - Selector reads as a prominent, accented control in empty + active states.
  - Switch agent mid-chat → divider appears after the last message; nudge "Start a
    fresh {agent} chat" works and dismisses on send/✕; new-chat opens scoped to
    the new agent; no divider on history load or first switch in an empty chat.
  - General empty state topic blurbs wrap to two lines, cards aligned.

## Git

On `main` (default) with unrelated pre-existing changes in the working tree
(administration/analytics/charts/structured-result/structured-data + untracked
REQUIREMENTS-TRACEABILITY.md). Create a feature branch and commit **only** the
files for this work; leave the pre-existing changes untouched.
