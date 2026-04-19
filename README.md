<p align="center">
  <h1 align="center">FinanceKite</h1>
  <p align="center">
    <strong>Financial management for solopreneurs who run one or more businesses.</strong>
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/.NET-9.0-purple?logo=dotnet" alt=".NET 9">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js 16">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

---

## Project Overview & Demo

Solopreneurs and freelancers often manage finances across multiple businesses using a patchwork of spreadsheets, separate invoicing tools, and manual reminders. Tracking which invoices are overdue, what expenses belong to which business, and when recurring payments are due becomes a time-consuming chore that pulls focus away from actual work.

FinanceKite is a full-stack SaaS application that unifies invoicing, expense tracking, recurring payment scheduling, and financial reporting under a single dashboard. It supports multiple businesses per account, automates overdue invoice detection, sends payment reminder emails on schedule, and provides at-a-glance financial summaries with interactive charts — all scoped to the authenticated user for complete data isolation.

<!-- 
### Live Demo

| | URL |
|---|---|
| **Frontend** | [finance-kite.vercel.app](https://finance-kite.vercel.app) |
| **API (Swagger)** | [financekite-backend.onrender.com/swagger](https://financekite-backend.onrender.com/swagger) |
-->

> **Demo placeholder** — Replace the block above with your live URLs, or add an animated GIF:
>
> ```md
> ![FinanceKite Demo](docs/demo.gif)
> ```

---

## Tech Stack & Rationale

### Backend

| Technology | Version | Rationale |
|---|---|---|
| **.NET 9 / ASP.NET Core** | 9.0 | Cross-platform, high-performance runtime with built-in DI, middleware pipeline, and first-class support for background services — ideal for a financial API that needs reliability and structured architecture. |
| **Entity Framework Core + Npgsql** | 9.0.4 | Strongly-typed ORM with migration support and LINQ queries, paired with the Npgsql provider for native PostgreSQL features like `jsonb` and efficient bulk operations. |
| **FluentValidation** | 12.1.1 | Declarative, testable validation rules that keep validation logic out of controllers and services — validators are auto-discovered via assembly scanning. |
| **Supabase .NET SDK** | 1.1.1 | Provides both authentication (JWT verification via OIDC) and file storage (invoice documents, expense receipts) through a single managed platform, reducing infrastructure overhead. |
| **Resend** | 0.2.2 | Developer-first transactional email API with a simple SDK — chosen over SendGrid for its cleaner API surface and straightforward pricing for low-volume transactional emails. |
| **Swashbuckle** | 7.3.1 | Auto-generates OpenAPI/Swagger documentation from controller attributes, providing an interactive API explorer at `/swagger` during development. |

### Frontend

| Technology | Version | Rationale |
|---|---|---|
| **Next.js** | 16.2.1 | React meta-framework with App Router, server components, and Turbopack — provides file-based routing, built-in API routes for the OAuth callback, and optimized production builds. |
| **React** | 19.2.4 | Latest React with compiler optimizations — paired with the `babel-plugin-react-compiler` for automatic memoization, reducing manual `useMemo`/`useCallback` overhead. |
| **TypeScript** | 5.x | Static typing across the entire frontend catches contract mismatches between API responses and UI components at compile time rather than runtime. |
| **Tailwind CSS** | 3.4.19 | Utility-first CSS framework that eliminates context-switching between files — combined with CSS custom properties for HSL-based theming and dark mode support. |
| **shadcn/ui + Radix UI** | 4.1.0 / 1.4.3 | Copy-paste component library built on accessible Radix primitives — provides full ownership of component code without locking into a rigid design system. |
| **Axios** | 1.13.6 | Chosen over `fetch` for its interceptor system — a request interceptor auto-attaches the Supabase JWT to every API call, and a response interceptor handles 401 redirects globally. |
| **Recharts** | 3.8.0 | Composable React charting library for the revenue and expense visualizations — built on D3 but with a declarative React API that fits naturally into the component tree. |
| **Framer Motion + GSAP** | 12.38.0 / 3.15.0 | Framer Motion for layout and gesture animations in the dashboard; GSAP for scroll-driven landing page effects — each library plays to its strength. |
| **Sonner** | 2.0.7 | Lightweight toast notification library that integrates cleanly with Next.js — provides stacked, dismissible notifications without the bundle weight of full notification systems. |

### Infrastructure

| Technology | Purpose | Rationale |
|---|---|---|
| **PostgreSQL** | Primary database | ACID-compliant relational database hosted by Supabase — handles financial data integrity requirements (decimal precision, referential constraints) natively. |
| **Supabase Auth** | Authentication | Managed auth with email/password and Google OAuth, issuing JWTs that both the frontend (session) and backend (API validation) consume — no custom auth server needed. |
| **Supabase Storage** | File uploads | S3-compatible object storage for invoice documents and expense receipts, accessible via signed URLs with the service role key on the backend. |
| **Docker** | Containerization | Multi-stage build produces a ~200MB runtime image from `bookworm-slim`, with GC tuning for memory-constrained hosting (512MB on Render). |
| **Render** | Backend hosting | Docker-native PaaS with managed TLS, automatic deploys from GitHub, and a PostgreSQL add-on option — simpler than raw cloud VMs for a solo-maintained API. |
| **Vercel** | Frontend hosting | Purpose-built for Next.js with edge network CDN, automatic preview deployments, and zero-config App Router support. |

---

## Key Features

- **Multi-business management** — Create and switch between multiple businesses, each with its own currency (ZAR, USD, EUR, GBP), clients, and financial data.
- **Invoice lifecycle tracking** — Manage invoices through Pending → Overdue → Paid / Loss states, upload invoice documents, and view overdue alerts on the dashboard.
- **Expense tracking with proof uploads** — Log expenses by category (Hosting, Domain, Tools, Service, Other) and attach proof-of-payment files stored in Supabase Storage.
- **Recurring payments (expenses)** — Schedule weekly, monthly, or yearly expense payments with a category. When a payment's due date arrives, the scheduler automatically creates an Expense record and advances to the next cycle.
- **Recurring invoices (income)** — Schedule recurring client invoices. When due, the scheduler auto-generates an Invoice with Pending status, emails the client a reminder, and advances to the next cycle.
- **Financial dashboard** — Revenue chart, expenses donut breakdown, overdue invoices list, and upcoming recurring items (both payments and invoices) — all in one view with real-time data.
- **Client health metrics** — Track outstanding balances per client to identify who owes what and flag at-risk accounts.
- **Dark / light theme** — System-aware theme toggle powered by `next-themes`, with HSL-based custom properties for consistent styling.
- **API rate limiting** — Built-in .NET rate limiter with a global 60 req/min policy and a stricter 10 req/min policy on file upload endpoints, returning `429 Too Many Requests` on excess traffic.

---

## Architecture & Design

### Clean Architecture (Backend)

The backend follows Clean Architecture with strict layer dependencies — outer layers depend on inner layers, never the reverse:

```
┌─────────────────────────────────────────────┐
│  API Layer                                  │
│  Controllers, Middleware, DI, Background     │
│  Services                                   │
├─────────────────────────────────────────────┤
│  Infrastructure Layer                        │
│  EF Core, Repositories, Supabase Storage,   │
│  Resend Email, PostgreSQL                    │
├─────────────────────────────────────────────┤
│  Application Layer                           │
│  Services, DTOs, Validators, Interfaces      │
├─────────────────────────────────────────────┤
│  Domain Layer                                │
│  Entities, Enums, Base Classes               │
│  (Zero external dependencies)                │
└─────────────────────────────────────────────┘
```

### Multi-Tenancy

Every database query is scoped by `UserId` extracted from the JWT. The `BaseController` exposes `CurrentUserId`, and all service methods filter by this value — ensuring complete data isolation between users without relying on database-level row security.

### Background Scheduler

`FinancialSchedulerService` is a hosted `BackgroundService` that runs on a configurable interval (default: every hour). Each cycle it:
1. **Marks overdue invoices** — Pending invoices past their due date are set to Overdue.
2. **Processes recurring payments** — Due payments auto-generate an Expense record (with the payment's category) and advance to the next billing cycle.
3. **Processes recurring invoices** — Due recurring invoices auto-generate an Invoice (status: Pending), send a reminder email to the client via Resend, and advance to the next billing cycle.

### Rate Limiting

The API uses ASP.NET Core's built-in rate limiting middleware to protect against abuse:

| Policy | Limit | Scope | Applied To |
|---|---|---|---|
| `fixed` | 60 requests / minute | Per IP | All controller endpoints |
| `uploads` | 10 requests / minute | Per IP | File upload endpoints only |

Excess requests receive a `429 Too Many Requests` response with a JSON body. Rate limiting runs after CORS but before authentication in the middleware pipeline.

### Project Structure

```
financekite/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── FinanceKite.slnx
│   └── src/
│       ├── FinanceKite.Domain/          # Entities, enums, base classes
│       ├── FinanceKite.Application/     # Services, DTOs, validators
│       ├── FinanceKite.Infrastructure/  # EF Core, repos, external services
│       └── FinanceKite.API/             # Controllers, middleware, Program.cs
│           └── BackgroundServices/      # FinancialSchedulerService
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                 # Sign-in, sign-up, OAuth callback
│   │   │   ├── (landing)/             # Public landing page
│   │   │   └── dashboard/             # Protected dashboard routes
│   │   │       ├── recurring-payments/ # Recurring expense management
│   │   │       └── recurring-invoices/ # Recurring income management
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── dashboard/            # Dashboard widgets & charts
│   │   │   └── landing/              # Landing page sections
│   │   └── lib/
│   │       ├── api/                   # Typed Axios clients per resource
│   │       ├── supabase/             # Browser & server Supabase clients
│   │       ├── contexts/             # Business & sidebar state
│   │       └── types/                # TypeScript interfaces for all DTOs
│   └── tailwind.config.ts
│
├── README.md
└── LICENSE
```

---

## Containerization & Deployment

### Docker

The backend uses a **multi-stage Docker build** optimized for Render's 512MB RAM limit:

**Build stage** — Uses `dotnet/sdk:9.0-bookworm-slim` to restore, build, and publish in Release mode. Project files are copied before source code to maximize NuGet restore layer caching.

**Runtime stage** — Uses `dotnet/aspnet:9.0-bookworm-slim` (~200MB) with the following memory optimizations:

| Setting | Value | Purpose |
|---|---|---|
| `DOTNET_gcServer` | `0` | Workstation GC — lower memory footprint for single-vCPU hosts |
| `DOTNET_GCHeapHardLimit` | `0xC800000` | Caps managed heap at ~200MB |
| `DOTNET_GCConserveMemory` | `9` | Maximum GC memory conservation |
| `DOTNET_EnableDiagnostics` | `0` | Disables diagnostic pipes to save resources |

```bash
# Build the image
docker build -t financekite-api ./backend

# Run locally (create a .env file with your secrets first)
docker run -p 10000:10000 --env-file .env financekite-api

# Verify
curl http://localhost:10000/health
# → { "status": "healthy" }
```

### Environment Variables

#### Backend (set in Render dashboard or `.env` for local Docker)

| Variable | Description |
|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `Supabase__Url` | Supabase project URL |
| `Supabase__ServiceRoleKey` | Supabase service role key (backend only) |
| `Supabase__JwtSecret` | Supabase JWT signing secret |
| `Resend__ApiKey` | Resend API key for transactional emails |
| `Cors__AllowedOrigins__0` | Production frontend URL (e.g. `https://finance-kite.vercel.app`) |

#### Frontend (set in Vercel dashboard or `.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for client-side) |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `https://financekite-backend.onrender.com`) |

### Deployment

#### Backend → Render

1. Create a new **Web Service** on Render, connect your GitHub repo.
2. Set **Root Directory** to `backend`.
3. Set **Environment** to `Docker`.
4. Add environment variables listed above in the **Environment** tab.
5. Deploy — Render builds the Dockerfile and starts the container on port `10000`.

#### Frontend → Vercel

1. Import your GitHub repo into Vercel.
2. Set **Framework Preset** to `Next.js`.
3. Set **Root Directory** to `frontend`.
4. Add environment variables listed above in **Settings → Environment Variables**.
5. Deploy — Vercel builds with `next build` and serves via its edge network.

> **Note:** `NEXT_PUBLIC_` variables are embedded at build time. After changing them, you must redeploy for changes to take effect.

#### Google OAuth Setup

Google login requires credentials from Google Cloud Console and configuration in Supabase.

**1. Create Google OAuth credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or select an existing one).
3. Navigate to **APIs & Services → OAuth consent screen** and configure it:
   - User type: **External**
   - App name, support email, developer contact email
   - Scopes: `email`, `profile`, `openid`
4. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
5. Application type: **Web application**.
6. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://<your-vercel-domain>.vercel.app
   ```
7. **Authorized redirect URI:**
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```
8. Copy the **Client ID** and **Client Secret**.

**2. Configure Supabase:**

1. Go to **Supabase Dashboard → Authentication → Providers → Google**.
2. Enable **Sign in with Google**.
3. Paste the **Client ID** and **Client Secret** from Google.
4. Save.

**3. Configure Supabase redirect URLs:**

1. Go to **Supabase Dashboard → Authentication → URL Configuration**.
2. Set **Site URL** to your production frontend URL (e.g. `https://finance-kite.vercel.app`).
3. Add both URLs to **Redirect URLs**:
   ```
   http://localhost:3000/callback
   https://<your-vercel-domain>.vercel.app/callback
   ```

**Important notes:**
- The app is initially in **Testing** mode — only manually added test users can sign in. Add test users under **APIs & Services → OAuth consent screen → Test users** in Google Cloud Console.
- To allow any Google account, click **Publish App** on the consent screen. Google may require verification for sensitive scopes.
- The **Site URL** in Supabase controls the default redirect destination. Set it to your production URL — local development still works because the code dynamically uses `window.location.origin`.
- The OAuth callback route lives at `/callback` (not `/auth/callback`) due to Next.js route groups — the `(auth)` folder is invisible in the URL.

---

## Getting Started (Local Setup)

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| .NET SDK | 9.0+ | [dot.net/download](https://dot.net/download) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Git | Any | [git-scm.com](https://git-scm.com) |
| Supabase account | Free tier | [supabase.com](https://supabase.com) |

> PostgreSQL is hosted by Supabase — no local install required.

### 1. Clone the repository

```bash
git clone https://github.com/Jano-Esterhuizen/FinanceKite.git
cd FinanceKite
```

### 2. Set up the backend

```bash
cd backend/src/FinanceKite.API

# Configure secrets (stored outside the repo in your user profile)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your-supabase-postgres-connection-string>"
dotnet user-secrets set "Supabase:Url" "https://<your-project>.supabase.co"
dotnet user-secrets set "Supabase:ServiceRoleKey" "<your-service-role-key>"
dotnet user-secrets set "Supabase:JwtSecret" "<your-jwt-secret>"
dotnet user-secrets set "Resend:ApiKey" "<your-resend-api-key>"

# Apply database migrations
dotnet ef database update

# Start the API
dotnet run
# → Running on http://localhost:5224
# → Swagger UI at http://localhost:5224/swagger
```

> **Where do I find these values?** Connection string and keys are in your Supabase project dashboard under **Settings → API** and **Settings → Database**. The Resend API key is in the [Resend dashboard](https://resend.com). Secrets are stored via .NET User Secrets (outside the repo, in your OS user profile) — they never touch source control.

### 3. Set up the frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Then edit .env.local with your values:
#   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
#   NEXT_PUBLIC_API_URL=http://localhost:5224

# Start the dev server
npm run dev
# → Running on http://localhost:3000
```

### 4. Verify

1. Open `http://localhost:3000` — you should see the landing page.
2. Sign up with email or Google OAuth (requires [Google OAuth setup](#google-oauth-setup) above).
3. Create a business and start adding clients, invoices, and expenses.

---

## Contributing & License

### Contributing

Contributions are welcome. To get started:

1. **Fork** this repository.
2. **Create a branch** for your feature or fix: `git checkout -b feature/your-feature`.
3. **Commit** your changes with a clear message.
4. **Push** to your fork and open a **Pull Request** against `main`.

Please ensure your code follows the existing patterns:
- Backend: Clean Architecture layer boundaries, FluentValidation for request validation.
- Frontend: App Router conventions, shadcn/ui for new components, typed API clients in `lib/api/`.

### License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Jano Esterhuizen
