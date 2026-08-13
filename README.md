# Personify AI

Upload an ad copy image, get back the buyer personas you should be targeting —
each with paste-ready ad-platform targeting tags.

Next.js 16 (App Router) · shadcn/ui · Supabase (auth, Postgres, Storage) · OpenAI vision.

---

## 1. Add your OpenAI API key

Open [.env.local](.env.local) and paste your key on the `OPENAI_API_KEY` line:

```bash
OPENAI_API_KEY=sk-proj-...
```

Everything else in that file is already filled in (Supabase URL + publishable key
for project `qmubwpltyddnakbopsyc`). Nothing else is needed to run the app.

`OPENAI_MODEL` defaults to `gpt-4o`. Any vision-capable model that supports
Structured Outputs works — change the line in `.env.local` to switch.

## 2. Run it

```bash
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production
```

---

## How it works

```
/                 Landing page
/signup, /login   Email + password. No confirmation email — you land in the app signed in.
/chat             New analysis (empty state + composer)
/chat/[id]        A saved thread
/api/analyze      POST multipart: image + optional note
```

`POST /api/analyze` does, in order:

1. Checks the Supabase session.
2. Uploads the image to the private `ad-copies` bucket at `<user_id>/<uuid>.<ext>`.
3. Sends the image to OpenAI as a base64 data URL with a strict JSON schema
   ([src/lib/ai/persona-schema.ts](src/lib/ai/persona-schema.ts)), so the model
   *must* return well-formed personas.
4. Creates the conversation (titled from the analysis) if this is the first message.
5. Saves the user message and the assistant message (personas stored as `jsonb`).

If the model call fails, the uploaded image is deleted and nothing is persisted.

Analysis is a single request rather than a token stream — the personas are
structured data, not prose, so the UI shows a skeleton and renders the finished
cards in one go.

### What a persona contains

`name`, `tagline`, `ageRange`, `gender`, `maritalStatus`, `incomeLevel`,
`location`, `occupations`, `interests`, `behaviours`, `painPoints`,
`motivations`, `targetingTags`, `platforms`, `adAngle`, `matchScore`.

`targetingTags` are the ones that matter operationally — 8–14 terms per persona
that paste straight into Meta Ads Manager, TikTok Ads or Google Ads. Every card
has a copy button, and each analysis has a "Copy all".

---

## Database

Applied to the Supabase project already (via migrations):

| Table                | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `public.profiles`    | One row per auth user, created by an `on_auth_user_created` trigger |
| `public.conversations` | Chat threads, `updated_at` bumped by trigger on new messages |
| `public.messages`    | `role`, `content`, `image_path`, `analysis` (jsonb)          |

Storage bucket `ad-copies` is **private** (10 MB limit, images only). The browser
never gets a public URL — server components mint 1-hour signed URLs.

Row Level Security is on for every table and for storage. Each policy scopes to
`auth.uid()`, and storage policies require the first path segment to be the
user's id. Verified: a signed-out client reads nothing, and one user cannot read
another's conversations, messages, or files.

---

## Notes

- **Email confirmation is already off** in this Supabase project, so signup
  returns a live session and drops you straight into `/chat`. If you ever turn it
  back on (Authentication → Sign In / Providers → Email), the signup form will
  say so instead of silently failing.
- Consider enabling **leaked password protection** (Authentication → Policies)
  before going live — Supabase's linter flags it as off.
- `src/proxy.ts` is the Next.js 16 replacement for `middleware.ts`. It refreshes
  the Supabase cookie on every request and does the optimistic redirect; real
  authorization lives in the route handlers, server components, and RLS.
