# AI Golf Coach — Database Schema

The app uses a single `Store` interface (`src/lib/db.ts`) with two interchangeable
implementations:

| Driver | When | Where data lives |
|---|---|---|
| `LocalStore` (demo) | default, no Firebase env | `data/db.json` (atomic JSON writes) |
| `FirestoreStore` | `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` set | Cloud Firestore |

Collections / shapes below apply to both. Firestore rules enforcing these shapes live in
`firestore.rules`; server-side enforcement lives in `src/lib/auth.ts` (`requireUser` /
`requireAdmin`) and every API route.

---

## Collection: `users`

| Field | Type | Notes |
|---|---|---|
| `id` | string | doc id, `usr_…` |
| `email` | string | unique, lowercased |
| `name` | string | display name |
| `role` | `"golfer" \| "admin"` | RBAC source of truth (server-checked) |
| `handicap` | string? | optional profile field |
| `createdAt` | ISO string | |

Rules: users read/update their own record; only admins update roles; credentials are
server-only (see `credentials`).

## Collection: `credentials`  (server-only — `allow read, write: if false`)

| Field | Type |
|---|---|
| `hash` | string (scrypt, hex) |
| `salt` | string (hex) |

## Collection: `swings`

| Field | Type | Notes |
|---|---|---|
| `id` | string | doc id, `swg_…` |
| `userId` | string | owner — all queries are scoped by this |
| `coachId` | string | one of `michaelSchrempf`, `mattWastyn`, `johnSchrempf`, `chrisThompson` |
| `input` | object | `{ club, skillLevel: beginner\|intermediate\|advanced, goal, context, issues[] }` |
| `videoPath` | string \| null | `local:swings/<id>/video.<ext>` or a Storage object path |
| `videoName` | string \| null | original filename |
| `durationSec` | number | |
| `status` | `"processing" \| "completed" \| "failed"` | polled by `/processing/[id]` |
| `analysis` | object \| null | see below |
| `paymentId` | string \| null | |
| `mode` | `"demo" \| "live"` | demo artifacts must render disclaimers |
| `error` | string? | failure detail (admin can retry) |
| `createdAt` / `updatedAt` | ISO string | |

Ownership: a golfer can read/create/update/delete **only** their own swings
(`swing.userId === user.id`); admins have full access plus retry/delete.

### Embedded `analysis` object

```
{
  summary: string                    // coach-voiced paragraph
  scores: { contact, consistency, distance, tempo, sequencing }   // 0–100, comparable across reviews
  observations: [{ title, detail, severity: good|attention|priority,
                   checkpoint: { t: "0:12", label: "Impact" } }]
  strengths: string[]
  priorities: string[]
  drills: [{ name, why, how, reps, tags[] }]        // drawn ONLY from the coach's library
  plan: [{ day: 1..7, focus, activities[] }]         // 7-day practice plan
  disclaimer: string
  generatedBy: "mock-v1" | "llm"
  createdAt: ISO string
}
```

## Collection: `payments`

| Field | Type | Notes |
|---|---|---|
| `id` | string | `pay_…` |
| `userId` | string | |
| `swingId` | string \| null | |
| `amountCents` | number | MVP price: `1900` (`PRICE_REVIEW_CENTS`) |
| `currency` | string | `usd` |
| `provider` | `"demo" \| "stripe"` | demo payments are records only — never charge |
| `status` | `"succeeded" \| "pending" \| "failed"` | Stripe status set by webhook (admin-only writes) |
| `createdAt` | ISO string | |

## Collection: `coachOverrides`  (admin-editable prompt templates)

| Field | Type | Notes |
|---|---|---|
| `systemPrompt` | string? | overrides `lib/coaches/data.ts` default |
| `drills` | Drill[]? | replaces the coach's drill library |

Doc id = coach id. Readable by any signed-in user; writable only by admins.

---

## Firestore indexes (production)

| Collection | Fields | Query |
|---|---|---|
| `users` | `email` asc | login lookup |
| `swings` | `userId` asc, `createdAt` desc | user history |
| `swings` | `createdAt` desc | admin list |
| `payments` | `userId` asc, `createdAt` desc | user payments |

## Seed data

- **Coaches** are seeded in code (`src/lib/coaches/data.ts`) — 4 active profiles.
- **Admin** is bootstrapped on first login/signup matching `ADMIN_EMAIL`
  (`src/lib/auth.ts → resetAdminIfRequested`).
