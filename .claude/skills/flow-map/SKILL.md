---
name: flow-map
description: >-
  Traces one user-facing action or feature through daily-app's stack — UI
  component -> fetch -> Next.js Route Handler -> Drizzle -> Supabase and back
  -> UI re-render — and publishes a diagram (sequence/flowchart) with exact
  file:line references as a Claude Artifact. Use when catching up on
  unfamiliar or AI-generated parts of this codebase, when asked "このボタンを
  押すと何が起きる？" / "〇〇はどこで実装されてる？" / "動きを図で見せて", or when joining
  mid-development and needing to see how a feature is wired end-to-end across
  files.
---

# Flow Map

Turns "I don't know how this feature actually works across files" into a
diagram the user can follow, anchored to this repo's real layers (see
`docs/ai-dev-guide.md` §3.2, §5 for the canonical request flow and layout).

## This repo's layers (map every step to one of these)

1. **UI / trigger** — `src/app/**/page.tsx`, `src/app/components/*.tsx`.
   Where the user actually taps/clicks (a button's `onClick`, a form submit).
   Note: `today`/`next`/`overdue`/`buffs` page files are stub shells
   (`return null`) — the real UI for those lives in `SpaceNavigator.tsx`.
2. **Client state / fetch** — `useState`/`useEffect`/handler functions inside
   the component that call `fetch("/api/...")` (e.g. `SpaceNavigator.tsx`,
   `HexagonStatus.tsx`, `TaskCardCreate.tsx`).
3. **API** — `src/app/api/**/route.ts` (Next.js Route Handlers: GET / POST /
   PATCH / DELETE). This is the only layer allowed to touch the DB
   (`docs/ai-dev-guide.md` §3.5).
4. **Data** — `lib/db/schema.ts` (Drizzle schema) and `lib/db/index.ts`
   (Supabase Postgres client).
5. **Shared types** — `types/task.ts`, used by both the API layer and UI.

If the traced flow doesn't touch the network (pure client-side interaction,
e.g. a modal open/close or a carousel drag), stop at layer 1-2 and say so —
don't invent API/DB steps that don't exist.

## Workflow

1. **Scope the trace.** If the user didn't name a specific action (e.g. "タス
   クを完了にする", "タスク追加ボタン", "ログイン"), ask which one. Don't try to
   map the whole app in one diagram — one user action or one feature per run.
2. **Find the entry point.** Grep the UI layer for the trigger (button label,
   handler name). Read the component fully, not just an excerpt.
3. **Follow the call chain forward**, collecting `file:line` at each hop:
   trigger handler -> `fetch(...)` call + HTTP method + URL -> matching
   `route.ts` export -> Drizzle query -> table/columns touched -> response
   shape -> where the client applies the response (state update, refetch,
   `router.push`, etc.) -> what re-renders.
4. **Note validation/error handling** briefly if present (e.g. category/screen
   validation in `route.ts`) — one line per branch, not full code dumps.
5. **Pick the diagram shape**:
   - A request/response with a clear time order (click -> fetch -> API ->
     DB -> re-render) -> **sequence diagram**.
   - Branching UI logic (e.g. "if screen is overdue, show X, else Y") ->
     **flowchart**.
   Load the `artifact-diagramming` skill for Mermaid mechanics before
   drawing either.
6. **Build the artifact.** Load `artifact-design` first (mandatory before
   writing any artifact). Structure:
   - One-paragraph plain-language summary of the flow at the top.
   - The Mermaid diagram, with each node/participant labeled by component or
     function name (not generic "Frontend"/"Backend").
   - A table directly under the diagram: `Step | File:Line | What happens` —
     this is the part the user will actually click through to catch up, so
     keep paths accurate and copy-pasteable.
   - If a step is a stub/placeholder (e.g. a `return null` page), call that
     out explicitly instead of glossing over it.
7. **Publish as a Markdown Artifact** (diagram + table reads better as
   Markdown than a designed HTML page for this use case). Give the user the
   link plus a 1-2 sentence summary of what the diagram shows.

## Notes

- Prefer forking (`Agent` with `subagent_type: "fork"`) for the file-tracing
  legwork if the chain is long, so raw grep/read output doesn't fill the main
  conversation — bring back only the resolved file:line chain.
- Don't guess at file:line — verify every reference by reading the file, per
  the project's own memory/verification discipline. A stale reference defeats
  the point of a catch-up tool.
- If the user asks for a broader map (e.g. "アプリ全体のデータフロー"), break it
  into 2-4 separate diagrams (one per major feature/screen) rather than one
  overloaded diagram — cross-link them in the summary instead of merging.
