<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Personify AI

Upload an ad copy image -> OpenAI vision reads it -> the app renders target
persona cards with ad-platform targeting tags. Landing page and app live in the
same Next.js project.

## Stack

- Next.js 16 App Router (Turbopack), React 19, TypeScript, Tailwind v4
- shadcn/ui, `base-nova` style. **These components are built on Base UI, not
  Radix**: use the `render` prop, never `asChild`.
  `<Button render={<Link href="/x" />}>Label</Button>` — children go on the
  outer component, the `render` element carries the props.
- Supabase for auth, Postgres and Storage (`@supabase/ssr` cookie sessions)
- OpenAI Chat Completions with Structured Outputs (`strict: true`)

## Layout

```
src/proxy.ts                  Next 16 middleware. Refreshes the auth cookie + optimistic redirects.
src/lib/env.ts                Every env read goes through here.
src/lib/supabase/{client,server,proxy}.ts   Browser / RSC+action / proxy clients.
src/lib/ai/persona-schema.ts  Persona + AdCopyAnalysis types AND the strict JSON schema.
src/lib/ai/analyze.ts         The OpenAI call. Server-only.
src/app/api/analyze/route.ts  Upload -> analyse -> persist. The one write path.
src/app/(auth)/actions.ts     signUp / signIn / signOut server actions.
src/app/chat/                 Guarded shell (layout), new chat (page), thread ([id]).
src/components/chat/          chat-shell, chat-view, composer, message-list, analysis-panel, persona-card
```

## Rules that bite

- `cookies()`, `params`, and `searchParams` are **async** (Next 16). No sync access.
- Route/layout/page prop types come from `next typegen`: `PageProps<"/chat/[id]">`,
  `LayoutProps<"/chat">`. Route-group layouts (e.g. `(auth)/layout.tsx`) are not
  in `LayoutRoutes` — type those props by hand.
- The `ad-copies` bucket is private. Storage RLS requires the object path to
  start with `<user_id>/`. Read paths need `createSignedUrls`.
- Changing the persona shape means changing BOTH the TS type and the JSON schema
  in `persona-schema.ts`. `strict: true` requires `additionalProperties: false`
  and every key listed in `required`, at every object level.
- Base UI menu parts are stricter than Radix: `DropdownMenuLabel` renders
  `Menu.GroupLabel` and **throws** unless it sits inside a `DropdownMenuGroup`
  or `DropdownMenuRadioGroup`. A bare label crashes the page on open.
- Radio items do not close the menu on select (that is deliberate for the
  appearance switcher — you see the theme change and can try another).
- Sidebar collapse is stored in the `personify_sidebar` cookie and read in
  `src/app/chat/layout.tsx`, so the first paint matches the saved state.
- Don't call `setState` inside an effect — the ESLint config rejects it
  (`react-hooks/set-state-in-effect`). `chat-view.tsx` uses the render-phase
  "adjust state when props change" pattern instead.

## Commands

```bash
npm run dev
npm run build
npx tsc --noEmit
npx eslint .
npx next typegen     # after adding or renaming routes
```
