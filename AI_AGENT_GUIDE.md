# AI Agent Context Guide

This document is intended to provide AI coding agents (such as Cursor, Windsurf, Copilot) with deep context into the `full-stack-core-web` repository structure and conventions.

## 1. Monorepo Architecture
Our monorepo manages two main applications:
- `apps/frontend`: User-facing Web Application.
- `apps/backend`: Core API Engine.

To start the applications locally, use the root-level scripts in `package.json`:
- `pnpm dev:frontend`: Starts Next.js dev server.
- `pnpm dev:backend`: Starts NestJS dev server.

## 2. Frontend Guidelines (`apps/frontend`)
- **Routing**: Follow Next.js App Router conventions (`app/page.tsx`, `app/layout.tsx`).
- **Styling**: Tailwind CSS is the primary styling solution. We use `shadcn/ui` for our base UI components.
- **Forms**: Use `react-hook-form` with `zod` schema validation.
- **Data Fetching**: Use `@tanstack/react-query` for API interaction or React Server Components directly for server-side fetching.
- **Testing**: Playwright is set up for end-to-end testing (see `playwright.config.ts`).

## 3. Backend Guidelines (`apps/backend`)
- **Architecture**: Strict NestJS structure. Expect a Module, Controller, and Service for specific domain resources. Use DTOs for incoming data objects.
- **Database**: We use MongoDB with `@nestjs/mongoose`. Define schemas using NestJS decorators.
- **Authentication**: Using `firebase-admin` combined with standard NestJS Guards and JWT implementations (`@nestjs/jwt`).
- **Cloud & External APIs**:
  - AWS SDK for cloud services.
  - `googleapis` and `nodemailer` for standard email services.
  - `nestjs-telegraf` mapped workflows for Telegram bot integrations.
- **Testing**: Use Jest for both unit tests and e2e (`test/jest-e2e.json`).

## 4. General Workflows & Rules
- Rely on established CLI conventions for tasks (`pnpm build`, `pnpm test`, `pnpm lint`).
- Ensure all newly contributed code correctly declares dependencies in its respective `package.json` and runs `pnpm install` if a new dependency is added.
- **Important**: Focus explanation in code comments mainly on the "why" instead of the "what". Ensure AI responses maintain brevity while providing robust contextual code.
