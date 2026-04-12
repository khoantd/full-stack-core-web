# Project Context — `full-stack-core-web`

This repo is a **pnpm monorepo** containing:

- **`apps/frontend`**: Next.js App Router web app (Tailwind + shadcn/ui, React Query, RHF + Zod).
- **`apps/backend`**: NestJS API (MongoDB via Mongoose, JWT auth, Swagger docs, integrations like Telegram/MinIO/email).

If you’re an AI agent or a new contributor: this file is the “entry point” to understand **what lives where**, **how to run it**, and **what conventions matter**.

## High-level architecture

```text
Browser (Next.js)  --->  Backend API (NestJS)  --->  MongoDB
         |                     |
         |                     +--> Swagger docs at /api-docs
         |
         +--> Auth tokens stored client-side (see axios client) + refresh flow
```

## Repo layout

```text
.
├─ apps/
│  ├─ backend/                 # NestJS app (API)
│  └─ frontend/                # Next.js app (UI)
├─ AI_AGENT_GUIDE.md           # Agent coding conventions (read this first if using an agent)
├─ DOCKER.md                   # How to run the stack via Docker
├─ .env.example                # Root env template (primarily for docker-compose)
├─ pnpm-workspace.yaml         # pnpm workspace config
└─ package.json                # Root scripts to run frontend/backend
```

## Quickstart (local dev)

### Prereqs

- Node.js + **pnpm**
- MongoDB (local or cloud)

### 1) Install

```bash
pnpm install
```

### 2) Configure env

- **Backend**: copy `apps/backend/.env.example` → `apps/backend/.env` and fill in values.
- **Frontend**: copy `apps/frontend/.env.example` → `apps/frontend/.env.local` (or `.env`) and set `NEXT_PUBLIC_API_URL`.

Notes:
- Backend defaults to **port 3001** (see `apps/backend/src/main.ts`).
- Frontend dev server runs on **port 3000** (see `apps/frontend/package.json`).

### 3) Run

Run both apps:

```bash
pnpm dev
```

Or run separately:

```bash
pnpm dev:backend
pnpm dev:frontend
```

## Quickstart (Docker)

See `DOCKER.md`. The short version is:

```bash
cp .env.example .env
docker compose up -d --build
```

Expected defaults:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Key endpoints and docs

- **Swagger**: `http://localhost:3001/api-docs` (configured in `apps/backend/src/main.ts`)
- **Auth routes** (backend): under `/auth/*` (see `apps/backend/src/auth/auth.controller.ts`)

## Multi-tenancy (organizations / tenants)

This project is **multi-tenant**. A “tenant” represents an organization and most business data is scoped by `tenantId`.

### Backend: how tenant context is resolved and enforced

- **Tenant model**: `apps/backend/src/tenant/schemas/tenant.schema.ts`
  - Key fields: `name`, `slug` (unique), `status` (defaults to `active`), `enabledFeatures` (defaults to all), `landingConfig`.
- **User ↔ tenant relationship**
  - `User.tenantId` stores the user’s **active** tenant (`apps/backend/src/auth/schemas/user.schema.ts`).
  - `tenant_memberships` stores which tenants a user belongs to (for switching / listing): `apps/backend/src/tenant-membership/schemas/tenant-membership.schema.ts`.
- **Enforcement**: `TenantGuard` (`apps/backend/src/guards/tenant.guard.ts`)
  - Runs after `AuthGuard` on most controllers.
  - Resolves an “effective” tenant using `TenantService.resolveActiveTenantForRequest()`:
    - Prefer **JWT** `tenantId` if valid
    - Else fall back to the user’s stored `User.tenantId`
    - Else “repair” legacy users by assigning the **oldest** tenant in the DB
  - Attaches the result to `request.tenantId` for downstream handlers.
- **Accessing tenantId in controllers**
  - Use `@CurrentTenant()` from `apps/backend/src/guards/tenant.decorator.ts` to read `request.tenantId`.
  - Use `@SkipTenantGuard()` on routes that must not require a tenant (example appears in `apps/backend/src/user/user.controller.ts`).

### Backend: tenant switching + tenant-scoped settings

- **Switch active tenant**: `POST /tenants/my/switch` (`apps/backend/src/tenant/tenant.controller.ts`)
  - Validates the user is a member of the target tenant via `TenantMembershipService.isMember()`
  - Updates `User.tenantId` and issues **new JWTs** with the selected `tenantId` and `tenantSlug` (`apps/backend/src/auth/auth.service.ts`)
- **List my tenants**: `GET /tenants` returns tenants from active memberships.
- **Per-tenant feature flags**: `enabledFeatures` on `Tenant`
  - Update current tenant features via `PATCH /tenants/my/features` (reads tenant from JWT/user context).
  - **Rule for new work**: any new tenant-facing feature must ship with **enable/disable controls** so each tenant can turn it on/off.
    - Add a new `FeatureKey` in `apps/backend/src/tenant/schemas/tenant.schema.ts` (and ensure defaults/migrations make sense).
    - Enforce the flag on the backend (don’t rely on UI-only hiding) and hide/disable UX on the frontend (see `FEATURE_NAV_MAP` in `apps/frontend/components/app-sidebar.tsx`).

### Frontend: tenant selection + subdomain routing

- **Tenant identity in session**:
  - The access token payload includes `tenantId` and `tenantSlug` (`apps/frontend/lib/jwt.ts`).
  - Many React Query keys include `tenantId` to prevent cross-tenant cache bleed.
- **Switching organizations in the UI**:
  - `apps/frontend/components/app-sidebar.tsx` calls `tenantService.switchMyTenant()`, stores the returned tokens, clears React Query cache, and then navigates to the tenant’s domain/subdomain.
- **Subdomain parsing**:
  - `apps/frontend/lib/tenant-slug-from-host.ts` extracts tenant slug from Host (supports local `foo.localhost` and Vercel preview `foo---*.vercel.app`).
  - `apps/frontend/proxy.ts` sets `x-tenant-slug` and rewrites `/` to `/dashboard` when a subdomain is present.

## Environment variables

### Root `.env` (Docker-focused)

`/.env.example` contains ports and compose-related settings like:
- `BACKEND_PORT`, `FRONTEND_PORT`, `MONGODB_URI`
- `JWT_SECRET`, `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL` (frontend must point to backend)

### Backend `.env`

`apps/backend/.env.example` includes (not exhaustive):
- **Core**: `MONGO_URI`, `PORT`, `JWT_SECRET`, `FRONTEND_URL`
- **Email/SMTP**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- **Telegram**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_URL`, `TELEGRAM_SKIP_LAUNCH`
- **MinIO**: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- **LeadSpark**: `LEADSPARK_PROJECT_REF`, `LEADSPARK_API_KEY`, `LEADSPARK_ORGANIZATION_ID`

Backend reads config via `apps/backend/src/config/config.ts` (and likely other modules’ config).

### Frontend `.env.local`

`apps/frontend/.env.example`:
- `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001` inside the axios client)

`apps/frontend/app/layout.tsx` also references:
- `NEXT_PUBLIC_APP_URL` (for Next.js `metadataBase`; optional, defaults to `http://localhost:3000`)

## Frontend: data/auth conventions

### Axios client + token refresh flow

Main client lives at `apps/frontend/api/axiosClient.ts`:

- Stores tokens in `localStorage`:
  - `access_token`
  - `refresh_token`
- Automatically attaches `Authorization: Bearer <token>` on requests.
- On **401** (non-`/auth/*` requests), it calls `POST /auth/refresh` and retries the original request.
- If refresh fails, it clears tokens and redirects to `/login`.

Important behavior: token refresh is **queued** to avoid multiple refresh calls at once.

### Redirects

`apps/frontend/next.config.ts` currently redirects older “marketing” routes (e.g. `/services`, `/blog`, `/about`) into `/dashboard`.

## Backend: conventions

### NestJS module structure

Backend follows standard Nest structure:
- `*.module.ts` wires controllers/services/providers
- `*.controller.ts` defines routes
- `*.service.ts` contains business logic
- DTOs typically live under `dto/`
- Mongoose schemas under `schemas/`

### CORS + ports + Swagger

`apps/backend/src/main.ts`:
- Enables permissive CORS (`origin: '*'`).
- Serves Swagger at `/api-docs`.
- Listens on `process.env.PORT ?? 3001`.

## CI/CD secrets (GitHub Actions)

See `.github/workflows/README-SECRETS.md` for deployment secrets, including:
- Docker Hub creds (`DOCKER_USERNAME`, `DOCKER_PASSWORD`)
- VPS SSH/deploy secrets (`VPS_HOST`, `VPS_USERNAME`, `VPS_KEY`, optional `VPS_PASSWORD`)
- Runtime/build env (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`)

## Where to look for “how do I…?”

- **Agent/conventions**: `AI_AGENT_GUIDE.md`
- **Docker**: `DOCKER.md`
- **Backend feature docs / curl samples**: `apps/backend/docs/`
- **Telegram integration**: `apps/backend/src/telegram/README.md`
- **Frontend pages**: `apps/frontend/app/**/page.tsx`

## Guardrails (to avoid breaking working pieces)

- Prefer **small, isolated changes** with tight scope.
- Keep **API contracts** stable (frontend depends on backend routes).
- Update `.env.example` files when adding new required config.
- Avoid introducing new global redirects in Next.js unless necessary.

## i18n rule (default for all future features)

All new features must be built **i18n-first** across **frontend and backend**. This is a hard requirement to avoid shipping untranslated UI and inconsistent API messaging.

- **No hardcoded user-facing strings (frontend)**: any UI copy (labels, buttons, errors, empty states, toasts, confirmations) must come from translation messages.
- **No hardcoded user-facing strings (backend)**: controllers/services must not embed end-user text in thrown errors or responses; return **error codes / i18n keys** (and optional params) that the frontend can translate, or use the backend i18n utilities when already established.
- **Ship both locales (frontend)**: when adding a new message key, update **both** `apps/frontend/messages/en.json` and `apps/frontend/messages/vi.json` in the same change.
- **Ship both locales (backend)**: when adding backend-facing message keys, update the backend translation source (see `apps/backend/src/common/i18n/translations.ts`, if present in the repo) for all supported locales.
- **Keys over prose**: use stable, namespaced keys (feature + screen + component) and reuse existing keys when meaning matches.
- **Validation errors**: DTO / schema validation errors should be surfaced as codes/keys rather than raw English strings where feasible.
- **Definition of done**: a feature is not complete until it renders correctly in all supported locales and has no missing translation keys at runtime.

## i18n architecture — lessons learned

### next-intl middleware lives in `proxy.ts`, NOT `middleware.ts`

This project runs on **Next.js 16**, which replaces `middleware.ts` with **`proxy.ts`**. Both files cannot coexist — Next.js will throw `"Both middleware file and proxy file are detected"` and break the app.

`apps/frontend/proxy.ts` already integrates next-intl:
- Calls `createMiddleware(routing)` on every request.
- Rewrites locale-prefixed URLs (`/en/…`, `/vi/…`) to internal paths.
- Merges next-intl headers/cookies into all responses.

**Never create `middleware.ts` in this project.** All middleware logic (auth guards, subdomain routing, locale handling) belongs in `proxy.ts`.

### In `proxy.ts`, locale must be forwarded via `{ request: { headers } }` on the rewrite

`requestLocale` in `i18n/request.ts` reads the `x-next-intl-locale` **request** header that reaches the page handler. In Next.js 16 proxy/middleware, setting `x-middleware-request-x-next-intl-locale` directly on the rewrite response object (e.g. via `mergeIntlHeaders`) does **not** reliably reach the server component.

The correct pattern in `proxy.ts` for any manual `NextResponse.rewrite()`:

```ts
const reqHeaders = new Headers(request.headers);
reqHeaders.set('x-next-intl-locale', locale);

const res = NextResponse.rewrite(new URL(internalPath, request.url), {
  request: { headers: reqHeaders },   // ← this is what makes requestLocale work
});
```

Without the `{ request: { headers } }` option, `requestLocale` is `undefined` and the locale falls back to `defaultLocale` (`'en'`), so all pages render in English regardless of the URL.

### Locale switching must use a hard navigation (`window.location.href`), not `router.replace`

This app does **not** use a `[locale]` dynamic segment in the app directory (routes live directly under `app/`). next-intl middleware rewrites `/vi/dashboard/…` → `/dashboard/…` before Next.js routing sees it.

Consequence: `router.replace(path, { locale })` (soft client-side nav) does not trigger a re-render of the root `layout.tsx`, so `getLocale()` / `getMessages()` are never re-called and `NextIntlClientProvider` keeps the original locale's messages — **the UI text never changes**.

**Rule**: when switching locale programmatically, always do a hard navigation:

```ts
window.location.href = `/${newLocale}${pathname}${query ? `?${query}` : ""}`;
```

This forces a full server round-trip, middleware runs, the root layout re-executes, and `NextIntlClientProvider` is hydrated with the correct messages.

### Keep the `LANGUAGES` list in sync with `routing.locales`

`apps/frontend/app/dashboard/settings/profile-form.tsx` lists language options for the Settings UI. Only locales that exist in `routing.locales` (`apps/frontend/i18n/routing.ts`) will trigger a navigation; unsupported codes are silently ignored. When adding a new locale, update **both** `routing.locales` and the `LANGUAGES` array (and ship the matching `messages/<locale>.json` file).

