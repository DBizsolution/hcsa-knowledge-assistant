# HCSA Knowledge Assistant — prototype

AI-driven LLM knowledge management assistant for the Housing, Construction &
Sustainability Authority (HCSA / HDB) tender prototype. RAG over the
unstructured mock corpus (policies, SOPs, emails, financial reports) with
cited answers.

## Stack

- **Next.js 16** (App Router, `src/`), **React 19**, **TypeScript**
- **Tailwind v4** + **shadcn/ui** — themed from the reverse-engineered HDB
  design system in `../styleguide.md` (tweakcn-style CSS variables in
  `src/app/globals.css`)
- **Vercel AI SDK v6** — agentic chat with a retrieval tool
- **Supabase + pgvector** — vector store; **OpenAI** — chat + embeddings

## Annex B pages

| Page | Route | Status |
| --- | --- | --- |
| Login | `/login` | **Functional** |
| Chat | `/chat` | **Functional (RAG + citations)** |
| Knowledge base | `/knowledge-base` | Hi-fi mock |
| File upload | `/upload` | Hi-fi mock |
| Document generation | `/documents` | Hi-fi mock |
| Conversation history | `/history` | Hi-fi mock |
| Query testing & evaluation | `/evaluation` | Hi-fi mock |
| System performance | `/dashboard` | Hi-fi mock |
| System consumption | `/consumption` | Hi-fi mock |
| Chatbot configuration | `/configuration` | Hi-fi mock |
| User management | `/users` | Hi-fi mock |
| User profile _(optional)_ | `/profile` | Hi-fi mock |
| User guide _(optional)_ | `/guide` | Hi-fi mock |

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in OpenAI + Supabase credentials
```

1. **Database** — run `supabase/schema.sql` in the Supabase SQL editor (enables
   pgvector, creates `documents` / `chunks` and the `match_chunks` function).
2. **Auth** — create a user in Supabase Auth (email/password) to sign in.
3. **Ingest the corpus**:

   ```bash
   pnpm ingest --dry-run   # parse + chunk only (no API calls)
   pnpm ingest             # embed + upsert into Supabase
   ```

4. **Run**:

   ```bash
   pnpm dev
   ```

> Without Supabase configured the app runs in **demo mode** — the login page
> opens the console directly so the UI can be reviewed without credentials.
> The chat requires `OPENAI_API_KEY` and an ingested knowledge base.

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm lint` · `pnpm typecheck`
- `pnpm ingest [--dry-run]` — ingest the mock corpus
