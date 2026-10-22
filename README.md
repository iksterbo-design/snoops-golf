# AI Golf Coach

A full-stack MVP that gives golfers **coach-specific AI swing reviews**. Pick one of four
coaching personalities, upload a swing video, get structured feedback with video
checkpoints, that coach's drills, and a 7-day practice plan — then track progress over time.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. Runs end-to-end with
**zero external services** in demo mode; every external service is optional and hot-swappable.

---

## 1. Quick start (demo mode — no keys needed)

```bash
cd ai-golf-coach
npm install
cp .env.example .env.local   # already pre-filled for demo; Windows: copy .env.example .env.local
npm run dev
```

Open http://localhost:3000 and walk the full journey:

1. **Sign up** → account created instantly (local store, scrypt-hashed password, signed session cookie).
2. **Choose a coach** — Michael Schrempf, Matt Wastyn, John Schrempf, or Chris Thompson.
3. **Swing details** — club, skill level, goal, self-reported issues, free-text context.
4. **Checkout** — simulated payment ($19, marked as demo; no card, no charge).
5. **Upload** — any short video; stored locally under `uploads/`, analysis is simulated.
6. **Processing** → auto-redirects to the **completed review**: scores, video checkpoints,
   observations, strengths/priorities, drills, 7-day plan — all clearly labeled as demo output.
7. **History** — every review saved; the review page compares scores against your previous review.

### Bootstrap admin account
The first signup with the email in `ADMIN_EMAIL` becomes an administrator
(default `admin@example.com` / `change-me-now` — **change these in production**).
Admin panel: `/admin` — users, coaches (incl. prompt-template editing), swings (retry/delete),
analyses, payments.

---

## 2. Configuration

Copy `.env.example` to `.env.local` and fill in only what you use. Everything has a safe
demo fallback — the app never blocks on a missing key.

| Variable | Purpose | Demo fallback |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `true` = simulated payments/upload/analysis | `true` |
| `APP_SECRET` | Session cookie HMAC secret | `dev-secret-change-me` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin credentials | `admin@example.com` / `change-me-now` |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (+ `NEXT_PUBLIC_FIREBASE_*`) | Firestore/Storage | local `data/db.json` + `uploads/` |
| `STORAGE_DRIVER` | `local` or `firebase` | `local` |
| `STRIPE_SECRET_KEY` (+ publishable key) | Stripe Checkout | simulated payment record |
| `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL` | LLM coach generation (any OpenAI-compatible endpoint) | structured mock engine |
| `POSE_SERVICE_URL` | MediaPipe/MoveNet microservice endpoint | skipped |
| `FFMPEG_PATH` / `FFPROBE_PATH` | Real duration probe + extracted checkpoint JPEGs | skipped (client-reported duration) |
| `LLM_PROVIDER` | adapter selector (openai-compatible) | — |

Never commit real credentials; `.env.local` is gitignored.

---

## 3. Architecture

```
src/
  app/
    page.tsx                 landing
    login / signup           auth
    dashboard                golfer home + stats
    coaches                  coach selection
    swings/new               swing context form
    checkout                 demo/stripe checkout
    upload                   video upload (multipart)
    processing/[id]          polling screen
    review/[id]              full coaching review + compare-with-previous
    history                  saved reviews
    profile                  account overview
    admin/                   RBAC-protected admin panel
    api/                     route handlers (auth, coaches, swings, checkout, upload, analyze, media, admin)
  components/                reusable UI kit + guards + admin actions
  lib/
    db.ts                    Store interface: LocalStore (JSON) | FirestoreStore
    auth.ts                  scrypt passwords, HMAC session cookies, roles
    storage.ts               local disk | Firebase Storage
    payments.ts              simulated | Stripe Checkout
    llm.ts                   OpenAI-compatible chat-completions adapter
    analysis/engine.ts       deterministic mock coach-review generator
    analysis/run.ts          pipeline: pose (optional) → LLM (optional) → mock
    media/ffmpeg.ts          ffprobe duration + checkpoint JPEG extraction (optional)
    coaches/data.ts          the 4 coach profiles: philosophy, voice, drill libraries, prompts
  types/                     shared TypeScript models
firestore.rules              role-based DB rules (admin = role claim/field)
```

### How the "four different coaches" requirement is enforced
Each coach is a full profile: positioning, lesson style, communication traits, AI-behavior rules,
a **distinct drill library**, and a **distinct system prompt** (`lib/coaches/data.ts`).
The analysis pipeline feeds the swing context + coach prompt into the LLM when configured;
in demo mode the mock engine selects drills **only from the selected coach's library** and
writes the summary in that coach's voice. Same swing, four genuinely different reviews.

### Media pipeline (FFmpeg)
`src/lib/media/ffmpeg.ts` is optional tooling, not a hard dependency:
- **Upload** probes the real container duration with `ffprobe` (falls back to the
  client-reported duration).
- **Analysis** extracts one JPEG per video checkpoint into
  `uploads/<swingId>/frames/frame-NN.jpg`, served at `/api/media/<swingId>?frame=N`,
  so the review page shows an actual frame from the golfer's own video beside each
  checkpoint. When ffmpeg is not installed the app simply skips frames.

### Authorization
- **Server-first**: every API route calls `requireUser()` / `requireAdmin()`; pages re-check
  the session and ownership before rendering.
- **Middleware** (`src/middleware.ts`) redirects unauthenticated `/admin` visits to login —
  presence check only; real enforcement stays server-side.
- **Firestore rules** (`firestore.rules`) enforce per-user reads, admin-only writes, and
  server-only credentials. Hidden navigation is never the only protection.

### Extension points (post-MVP)
- **Real pose analysis**: point `POSE_SERVICE_URL` at a MediaPipe/MoveNet service; its metrics
  are injected into the coach prompt automatically.
- **More coaches**: add an entry to `lib/coaches/data.ts` (or move to a `coaches` collection).
- **Subscriptions / marketplace**: payments module is already provider-abstracted.
- **Voiceovers / drill videos / mobile apps**: review schema (`types/index.ts`) is media-ready.

---

## 4. Scripts

```bash
npm run dev        # dev server on :3000
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit
```

## 5. Demo-mode honesty

Every demo artifact is marked: reviews carry a disclaimer badge ("Demo analysis — simulated"),
payments are labeled simulated, uploads are local. Nothing claims to be genuine video analysis
unless `POSE_SERVICE_URL` + `OPENAI_API_KEY` are configured and the pipeline actually runs.
