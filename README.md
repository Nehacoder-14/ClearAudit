# ClearAudit

**AI-powered contract intelligence SaaS platform.** Upload contracts, extract key terms with Claude AI, search semantically, chat with your portfolio, and never miss a renewal deadline.

**Live:** [https://clearaudit-zeta.vercel.app](https://clearaudit-zeta.vercel.app)

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, React Bits |
| 3D / Animation | Three.js, React Three Fiber, GSAP, Lenis |
| Database | PostgreSQL 15+ with pgvector (or JSON file fallback) |
| ORM | Prisma 6 |
| AI | Anthropic Claude (with rule-based fallback) |
| Auth | NextAuth v5 (Credentials + Google OAuth) |
| Payments | Stripe (Checkout + Billing Portal + Webhooks) |
| Queue | BullMQ + Redis (optional, falls back to in-process) |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| TypeScript | 5.8 |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/clearaudit.git
cd clearaudit

# 2. Environment
cp .env.example .env
# Edit .env — at minimum set AUTH_SECRET and NEXT_PUBLIC_APP_URL

# 3. Install (legacy-peer-deps required due to peer dependency conflicts)
npm install --legacy-peer-deps

# 4. Database (optional — app works without PostgreSQL via JSON fallback)
npx prisma generate
npx prisma db push

# 5. Start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker (optional)

Spin up PostgreSQL 16 (pgvector) and Redis with:

```bash
docker-compose up -d
```

This creates a `clearaudit-db` instance on port 5432 and Redis on port 6379.

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `http://localhost:3000` | Public app URL used in emails, CORS, redirects |
| `AUTH_SECRET` | **Yes** | — | NextAuth v5 secret. Generate with `openssl rand -base64 32` |
| `AUTH_URL` | No | `http://localhost:3000` | NextAuth v5 base URL |
| `NEXTAUTH_SECRET` | No | — | Alias for `AUTH_SECRET` (backward compat) |
| `NEXTAUTH_URL` | No | — | Alias for `AUTH_URL` (backward compat) |
| `AUTH_GOOGLE_ID` | No | — | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | No | — | Google OAuth Client Secret |
| `GOOGLE_CLIENT_ID` | No | — | Alias for `AUTH_GOOGLE_ID` |
| `GOOGLE_CLIENT_SECRET` | No | — | Alias for `AUTH_GOOGLE_SECRET` |
| `DATABASE_URL` | No | — | PostgreSQL connection string. Falls back to `clearaudit-db.json` |
| `DIRECT_URL` | No | — | PostgreSQL direct URL (bypasses connection pooler) |
| `ANTHROPIC_API_KEY` | No | — | Claude API key. Without it, rule-based fallback handles extraction |
| `OPENAI_API_KEY` | No | — | Reserved for future embedding use |
| `USE_REDIS` | No | `false` | Enable BullMQ background queue via Redis |
| `REDIS_URL` | No | `redis://127.0.0.1:6379` | Redis connection string |
| `UPSTASH_REDIS_REST_URL` | No | — | Upstash Redis REST URL (serverless) |
| `UPSTASH_REDIS_REST_TOKEN` | No | — | Upstash Redis REST token |
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key (test or live) |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | — | Stripe publishable key (exposed to browser) |
| `STRIPE_PRO_PRICE_ID` | No | — | Stripe Price ID for Pro tier |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | — | SMTP username. Without it, emails log to console |
| `SMTP_PASS` | No | — | SMTP password |
| `EMAIL_FROM` | No | `ClearAudit <noreply@clearaudit.app>` | Sender address for outgoing email |
| `JWT_SECRET` | No | — | JWT signing secret |
| `ENCRYPTION_KEY` | No | — | 32-character AES key for data encryption |
| `SENTRY_DSN` | No | — | Sentry DSN for error tracking |
| `ALLOW_DEMO_SEED` | No | `true` | Allow seeding without auth in development |

## Features

- **Contract Management** — Upload, view, and manage contracts with status tracking (active, expired, needs review, draft)
- **AI Metadata Extraction** — Claude-powered extraction of parties, dates, payment terms, obligations, and key clause excerpts. Falls back to rule-based parsing when no API key is set
- **Semantic Search** — 384-dimensional vector embeddings with cosine similarity search, powered by pgvector in PostgreSQL mode or a local hasher in JSON mode
- **AI Chat Assistant** — RAG-style chat grounded in your contract portfolio. Ask questions like "Which contracts expire this month?" or "Draft a renewal email"
- **Smart Alerts** — Automatic scheduling of renewal and expiration alerts (notice period, 14-day, 7-day)
- **Stripe Billing** — Free tier (5 contracts), Pro tier ($29/mo, unlimited), Enterprise (custom). Checkout, billing portal, and webhook handling
- **File Upload** — PDF and DOCX parsing with progress tracking via a background job queue
- **Email Notifications** — Verification emails, password resets, and contract alerts via SMTP
- **Authentication** — Credentials (email/password) + Google OAuth with email verification and password reset flows
- **3D Hero** — Interactive 3D visualization on the landing page using Three.js / React Three Fiber

## Project Structure

```
clearaudit/
├── prisma/
│   └── schema.prisma          # Database schema (PostgreSQL + pgvector)
├── public/
│   └── uploads/               # Uploaded contract files
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Public pages (pricing, landing)
│   │   ├── (dashboard)/       # Authenticated pages (alerts, assistant, search, settings)
│   │   ├── api/               # API route handlers
│   │   │   ├── alerts/        # Alert CRUD
│   │   │   ├── auth/          # NextAuth + signup + password reset
│   │   │   ├── chat/          # AI chat endpoint
│   │   │   ├── contracts/     # Contract CRUD + [id]
│   │   │   ├── health/        # Health check
│   │   │   ├── seed/          # Database seeding
│   │   │   ├── stripe/        # Checkout + portal
│   │   │   ├── upload/        # File upload + status
│   │   │   └── webhooks/      # Stripe webhooks
│   │   ├── contracts/         # Contract detail pages
│   │   ├── dashboard/         # Dashboard page
│   │   └── upload/            # Upload page
│   ├── components/
│   │   └── ui/                # Shared UI components
│   ├── lib/
│   │   ├── ai.js              # Anthropic Claude + fallback parser + chat
│   │   ├── auth/config.ts     # NextAuth v5 configuration
│   │   ├── db.js              # Dual-mode DB (PostgreSQL + JSON fallback)
│   │   ├── db/prisma.ts       # Prisma client singleton
│   │   ├── email.ts           # Nodemailer email service
│   │   ├── embeddings.js      # 384-dim vector embeddings + cosine similarity
│   │   ├── queue.js           # BullMQ / in-process job queue
│   │   ├── rate-limit.ts      # In-memory rate limiter
│   │   ├── seed.js            # Demo data seeder
│   │   └── stripe/client.ts   # Stripe client + tier limits + pricing
│   └── types/                 # TypeScript type definitions
├── clearaudit-db.json         # JSON fallback database (auto-created)
├── docker-compose.yml         # PostgreSQL (pgvector) + Redis
├── schema.sql                 # Raw SQL schema (for reference)
├── .env.example               # Environment variable template
└── package.json
```

## Database

ClearAudit supports two database modes:

### PostgreSQL (recommended)

Requires PostgreSQL 15+ with the [pgvector](https://github.com/pgvector/pgvector) extension. Provides full-text search, vector similarity via `vector(384)`, and reliable persistence. Use `docker-compose up -d` to spin up a local instance.

### JSON Fallback (zero config)

When `DATABASE_URL` is not set or PostgreSQL is unreachable, the app automatically falls back to a local `clearaudit-db.json` file. This mode is suitable for development and demos. Embeddings and search still work using a local 384-dimensional hasher.

## API Routes

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth v5 handler |
| `/api/auth/signup` | POST | Register new account |
| `/api/auth/verify-email` | GET | Verify email address |
| `/api/auth/reset-password` | POST | Request password reset |
| `/api/auth/reset-password/confirm` | POST | Confirm password reset |
| `/api/contracts` | GET/POST | List or create contracts |
| `/api/contracts/[id]` | GET/PUT/DELETE | Single contract CRUD |
| `/api/upload` | POST | Upload contract file (PDF/DOCX) |
| `/api/upload/status` | GET | Check upload job progress |
| `/api/chat` | POST | Chat with AI assistant |
| `/api/alerts` | GET/POST | List or create alerts |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/portal` | POST | Create Stripe billing portal session |
| `/api/webhooks/stripe` | POST | Handle Stripe webhook events |
| `/api/seed` | POST | Seed demo data |
| `/api/health` | GET | Health check endpoint |

## Deployment

### Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Set environment variables in the Vercel dashboard
4. Deploy — `npm run build` runs `prisma generate` automatically

### Database (Supabase)

1. Create a project at [Supabase](https://supabase.com)
2. Enable the `vector` extension in the SQL editor
3. Copy the connection string to `DATABASE_URL` and `DIRECT_URL`

### Redis (Upstash)

1. Create a Redis instance at [Upstash](https://upstash.com)
2. Copy the REST URL and token to `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Set `USE_REDIS=true`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio |

> **Note:** Always use `npm install --legacy-peer-deps` when installing dependencies. This project has peer dependency conflicts between some packages that require this flag.
