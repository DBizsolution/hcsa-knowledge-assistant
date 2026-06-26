# HCSA Knowledge Assistant — Requirements → URL Traceability

Prototype mapping for the HDB AI-Driven LLM Knowledge Management System tender.
Each requirement below links to the production page(s) that demonstrate it.

- **Production base URL:** https://hcsa-knowledge-assistant.vercel.app
- **Date:** 22 June 2026
- **Sources:** RFP Annex A (prototype clause C2), Annex B Product Backlog (User Stories + acceptance criteria), Specification §1.

---

## Page index

| Page | Production URL |
| --- | --- |
| Landing / entry | https://hcsa-knowledge-assistant.vercel.app |
| Login | https://hcsa-knowledge-assistant.vercel.app/login |
| Chat (knowledge assistant) | https://hcsa-knowledge-assistant.vercel.app/chat |
| Conversation history | https://hcsa-knowledge-assistant.vercel.app/history |
| Document generation | https://hcsa-knowledge-assistant.vercel.app/documents |
| Data analytics | https://hcsa-knowledge-assistant.vercel.app/analytics |
| Knowledge (overview) | https://hcsa-knowledge-assistant.vercel.app/knowledge |
| Knowledge — Sources | https://hcsa-knowledge-assistant.vercel.app/knowledge/sources |
| Knowledge — Upload | https://hcsa-knowledge-assistant.vercel.app/knowledge/upload |
| Operations (overview) | https://hcsa-knowledge-assistant.vercel.app/operations |
| Operations — Performance | https://hcsa-knowledge-assistant.vercel.app/operations/performance |
| Operations — Query testing | https://hcsa-knowledge-assistant.vercel.app/operations/testing |
| Operations — Consumption | https://hcsa-knowledge-assistant.vercel.app/operations/consumption |
| Administration (overview) | https://hcsa-knowledge-assistant.vercel.app/administration |
| Administration — Configuration | https://hcsa-knowledge-assistant.vercel.app/administration/configuration |
| Administration — Users | https://hcsa-knowledge-assistant.vercel.app/administration/users |
| Guide / about | https://hcsa-knowledge-assistant.vercel.app/guide |
| Profile | https://hcsa-knowledge-assistant.vercel.app/profile |

---

## A. Core assessed requirements (Annex B — General User Story 1 + Annex A prototype clause)

These are the capabilities scored against the 29 sample queries and the hidden mock-dataset queries.

| # | Requirement | Satisfied by | Production URL(s) |
| --- | --- | --- | --- |
| R1 | Natural-language understanding of diverse user queries | Chat | https://hcsa-knowledge-assistant.vercel.app/chat |
| R2 | Retrieve answers from the provided knowledge base only (SOPs, policies, emails, reports) | Chat; corpus browsable | https://hcsa-knowledge-assistant.vercel.app/chat · https://hcsa-knowledge-assistant.vercel.app/knowledge/sources |
| R3 | Citations provided for **every** response | Chat (inline citation chips) | https://hcsa-knowledge-assistant.vercel.app/chat |
| R4 | Direct users to the primary source and allow downloading referenced documents | Chat (citation → source) ; Sources | https://hcsa-knowledge-assistant.vercel.app/chat · https://hcsa-knowledge-assistant.vercel.app/knowledge/sources |
| R5 | Find by document title or keyword | Chat ; Sources search | https://hcsa-knowledge-assistant.vercel.app/chat · https://hcsa-knowledge-assistant.vercel.app/knowledge/sources |
| R6 | Initiate a new conversation | Chat (New chat) | https://hcsa-knowledge-assistant.vercel.app/chat |
| R7 | Abstain gracefully — state when information is not available | Chat | https://hcsa-knowledge-assistant.vercel.app/chat |
| R8 | Capture user feedback on responses | Chat (per-message feedback) | https://hcsa-knowledge-assistant.vercel.app/chat |
| R9 | Suggest follow-up questions | Chat (suggestions) | https://hcsa-knowledge-assistant.vercel.app/chat |
| R10 | Guardrails: no disclosure of system prompts, embeddings or internal config; refuse out-of-scope | Chat (runtime) ; Configuration | https://hcsa-knowledge-assistant.vercel.app/chat · https://hcsa-knowledge-assistant.vercel.app/administration/configuration |
| R11 | Authorised-scope retrieval (user only sees what they may access) | Chat (agent scope) ; RBAC | https://hcsa-knowledge-assistant.vercel.app/chat · https://hcsa-knowledge-assistant.vercel.app/administration/users |
| R12 | Low query-failure rate; evaluate against sample queries | Query testing ; Chat | https://hcsa-knowledge-assistant.vercel.app/operations/testing · https://hcsa-knowledge-assistant.vercel.app/chat |
| R13 | Report performance metrics: accuracy, recall, precision, completeness, faithfulness | Performance | https://hcsa-knowledge-assistant.vercel.app/operations/performance |
| R14 | Technical approach surfaced: LLM, vector DB, embeddings, chunking, guardrails, orchestration | Configuration ; Guide | https://hcsa-knowledge-assistant.vercel.app/administration/configuration · https://hcsa-knowledge-assistant.vercel.app/guide |
| R15 | Authenticated access / sign-in | Login | https://hcsa-knowledge-assistant.vercel.app/login |

---

## B. Advanced user-story capabilities demonstrated

Beyond the core chat, the prototype showcases higher-priority user stories from Annex B.

| # | Requirement | Satisfied by | Production URL(s) |
| --- | --- | --- | --- |
| R16 | Cross-document consistency analysis — detect conflicts between SOPs and policies, flag and explain discrepancies (General US2) | Chat (Policy Intelligence report) | https://hcsa-knowledge-assistant.vercel.app/chat |
| R17 | Chronological summary / timeline of policy & legal changes over time (Legal US1) | Chat (Policy Intelligence timeline) | https://hcsa-knowledge-assistant.vercel.app/chat |
| R18 | Draft documents from templates and historical data; download as document (Legal US3, PLG US1, IAG US2) | Document generation | https://hcsa-knowledge-assistant.vercel.app/documents |
| R19 | Structured / Excel data analysis — counts, totals, rankings, trends across project datasets (PLG US3 / BI scope) | Data analytics | https://hcsa-knowledge-assistant.vercel.app/analytics |
| R20 | Revisit and resume prior conversations | Conversation history | https://hcsa-knowledge-assistant.vercel.app/history |
| R21 | Knowledge base kept current — ingest / upload new documents | Knowledge upload | https://hcsa-knowledge-assistant.vercel.app/knowledge/upload |
| R22 | Knowledge source management & indexing status | Knowledge sources | https://hcsa-knowledge-assistant.vercel.app/knowledge/sources |
| R23 | Role-based access control / user management | Administration — Users | https://hcsa-knowledge-assistant.vercel.app/administration/users |
| R24 | System configuration — models, guardrails, retrieval settings | Administration — Configuration | https://hcsa-knowledge-assistant.vercel.app/administration/configuration |
| R25 | Usage / consumption monitoring (cost & token visibility) | Operations — Consumption | https://hcsa-knowledge-assistant.vercel.app/operations/consumption |

---

## C. UI/UX coverage (Clarification #4 — all pages present for UX evaluation)

The full set of 13+ pages exists so HDB can evaluate the proposed system's UI/UX, even where back-end wiring is out of prototype scope. The complete page index is in the table at the top of this document; entry points are:

- Sign-in: https://hcsa-knowledge-assistant.vercel.app/login
- Workspace overview sections: https://hcsa-knowledge-assistant.vercel.app/knowledge · https://hcsa-knowledge-assistant.vercel.app/operations · https://hcsa-knowledge-assistant.vercel.app/administration
- Help / about: https://hcsa-knowledge-assistant.vercel.app/guide
- User profile: https://hcsa-knowledge-assistant.vercel.app/profile

---

### Notes

- Only **Login** and **Chat** are fully functional per scope; the remaining pages are high-fidelity and present for UI/UX assessment (RFP Clarification #4: document upload, document generation, user management, access control, and dashboards are *not* functionally assessed in the hidden queries).
- All URLs resolve under the canonical production domain `https://hcsa-knowledge-assistant.vercel.app`. Routes use clean paths; the internal `(auth)` / `(console)` route groups do not appear in the URL.
