# Deployment — every platform

AI Golf Coach is a self-contained Next.js app. The same build runs on a laptop,
a VM, a container host, or a managed platform. Pick the target that fits.

| Target | Command | Notes |
|---|---|---|
| Local (Win/macOS/Linux) | `npm install && npm run dev` | demo mode needs zero keys |
| Node host / VPS | `npm ci && npm run build && npm start` | Node 18.17+ |
| Vercel | import the repo | zero config; set env vars in the dashboard |
| Docker (any arch) | `npm run docker:build && npm run docker:run` | multi-arch via `docker:buildx` |
| docker-compose | `docker compose up --build` | volumes for data + uploads |
| Fly / Railway / Render | Dockerfile detected automatically | set `PORT=3000` |

---

## 1. Local development (Windows, macOS, Linux)

```bash
npm install
npm run setup          # cross-platform: creates .env.local (no `cp` needed)
npm run dev            # http://localhost:3000
```

`npm run setup` exists because `cp .env.example .env.local` fails on
Windows cmd.exe / PowerShell.

**FFmpeg (optional):** install `ffmpeg` (includes `ffprobe`) and leave it on
`PATH`, or point `FFMPEG_PATH` / `FFPROBE_PATH` at the binaries. This unlocks
real duration probing and checkpoint frame extraction.

- Windows: `winget install Gyan.FFmpeg`
- macOS: `brew install ffmpeg`
- Debian/Ubuntu: `apt-get install ffmpeg`

## 2. Production build on any host

```bash
npm ci
npm run build          # emits .next/ + .next/standalone/server.js
npm start              # or: node .next/standalone/server.js
```

The standalone output is what makes the container image small and portable.

## 3. Docker (multi-platform)

```bash
# single-arch image for this machine
npm run docker:build

# with ffmpeg inside the image (duration probe + checkpoint frames)
npm run docker:build:ffmpeg

# multi-arch image (x86_64 + arm64) — push to a registry
docker buildx create --use
npm run docker:buildx -- -t ghcr.io/iksterbo-design/ai-golf-coach:latest --push

# run with compose
npm run docker:run
```

Runtime state lives in two volumes so rebuilding never loses data:

- `app-data` → `/app/data` (demo JSON store)
- `app-uploads` → `/app/uploads` (swing videos + extracted frames)

Health check: `GET /api/health` (also the container `HEALTHCHECK`).

## 4. Environment variables by environment

Everything has a demo fallback, so a bare `docker run` produces a working app.

| Variable | Demo | Production |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `true` | `false` |
| `APP_SECRET` | dev string | long random secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | bootstrap values | real admin account |
| `FIREBASE_*` | unset | project credentials |
| `STORAGE_DRIVER` | `local` | `firebase` |
| `STRIPE_SECRET_KEY` | unset | live secret key |
| `OPENAI_API_KEY` | unset | live key |
| `POSE_SERVICE_URL` | unset | MediaPipe/MoveNet service |
| `FFMPEG_PATH` / `FFPROBE_PATH` | unset (on PATH) | optional |

Set `STORAGE_DRIVER=firebase` plus the Firebase vars before switching off demo
mode — demo mode assumes the local disk store.

## 5. Platform-specific notes

- **Windows**: run git-bash or PowerShell; npm scripts are shell-agnostic.
  Never run `npm run build` while `npm run dev` is live — the build overwrites
  `.next` and the dev server throws `__webpack_modules__` errors until restarted.
- **macOS/Linux**: standard Node install; no changes needed.
- **ARM hosts** (Apple Silicon, Graviton, Raspberry Pi): use `linux/arm64` —
  `node:20-alpine` ships both architectures.
- **PWA**: the app is installable. Serve over HTTPS (or localhost) — browsers
  require a secure context for service workers and the install prompt.
