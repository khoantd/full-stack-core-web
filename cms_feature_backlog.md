# CMS Feature Backlog

> 5 Epics · 28 User Stories · MoSCoW prioritized · WSJF ordered

---

## Summary

| Metric | Value |
|---|---|
| Epics | 5 |
| User Stories | 28 |
| Must Have | 12 stories |
| Should Have | 10 stories |
| Could Have | 4 stories |
| Total Story Points | ~157sp |

---

## MoSCoW Legend

- 🔴 **Must Have** — without this, the release fails
- 🟡 **Should Have** — important but not critical
- 🟢 **Could Have** — nice to have if time allows
- ⚫ **Won't Have (now)** — explicitly out of scope this cycle

---

## EP-01 · Dashboard & Core System

> Routes: `/dashboard` · `/dashboard/settings`  
> Priority: 🔴 Must Have

### US-001 · Admin overview dashboard · 5sp · 🔴 Must Have

**As an** admin, **I want** a `/dashboard` overview page **so that** I can see system health and key metrics at a glance.

**Acceptance Criteria:**

- Given I am logged in as admin, when I visit `/dashboard`, then I see total users, active sessions, recent content, and system status
- When the dashboard loads, then widgets display data from the last 24 hours by default
- When a system metric is degraded, then a visual alert badge appears on the relevant widget
- When I click a widget, then I navigate to the relevant management page

**Dependencies:** JWT Auth (US-005)

---

### US-002 · System settings configuration · 3sp · 🔴 Must Have

**As an** admin, **I want** a `/dashboard/settings` page **so that** I can manage system-wide configuration without touching the codebase.

**Acceptance Criteria:**

- Given I visit `/dashboard/settings`, then I see grouped settings sections: General, Security, Integrations, Notifications
- When I update a setting and click Save, then the change persists immediately without a restart
- When I change a security-sensitive setting, then a confirmation dialog appears before saving
- When a setting is invalid, then an inline error message is shown before submission

**Dependencies:** US-001

---

### US-003 · User preferences settings · 2sp · 🟡 Should Have

**As** any authenticated user, **I want** personal preferences (language, timezone, notifications) **so that** the system adapts to my context.

**Acceptance Criteria:**

- Given I visit `/dashboard/settings/profile`, then I see my editable profile and preferences
- When I update my timezone, then all date/time displays across the CMS reflect the change
- When I save preferences, then a success toast appears and changes persist across sessions

**Dependencies:** US-005

---

## EP-02 · User & Authentication Management

> Routes: `/dashboard/users` · JWT · Socket.IO Friend Module  
> Priority: 🔴 Must Have

### US-004 · User management CRUD · 8sp · 🔴 Must Have

**As an** admin, **I want** a `/dashboard/users` page to view, search, create, edit, and deactivate users **so that** I can govern access.

**Acceptance Criteria:**

- Given I visit `/dashboard/users`, then I see a paginated, searchable, filterable list of all users
- When I create a user, then a welcome email with a temporary password is sent
- When I deactivate a user, then their active JWT sessions are invalidated within 60 seconds
- When I click a user row, then I see a detail panel with role, activity history, and action buttons

**Dependencies:** US-005, US-006

---

### US-005 · JWT login and authentication · 8sp · 🔴 Must Have

**As a** user, **I want** to log in with my email and password **so that** I receive a JWT that grants me access to permitted routes.

**Acceptance Criteria:**

- Given valid credentials, when I submit the login form, then I receive an access token (15min) and refresh token (7d)
- Given an expired access token, when I make a request, then the system silently refreshes using the refresh token
- When I log out, then both tokens are invalidated server-side and removed from storage
- After 5 failed login attempts, then my account is temporarily locked for 15 minutes

**Dependencies:** None

---

### US-006 · Role-based route guards · 5sp · 🔴 Must Have

**As a** developer, **I want** JWT-based security guards on all dashboard routes **so that** unauthorized users cannot access admin features.

**Acceptance Criteria:**

- Given an unauthenticated request to any `/dashboard` route, when the guard runs, then redirect to `/login`
- Given a user without admin role, when they visit a restricted route, then return 403 with a clear message
- When a JWT is tampered with, then the guard rejects it and logs the attempt
- Given a valid token for a deactivated user, then the guard rejects all requests immediately

**Dependencies:** US-005

---

### US-007 · User registration flow · 5sp · 🟡 Should Have

**As a** new user, **I want** to self-register with email verification **so that** I can access permitted CMS features after approval.

**Acceptance Criteria:**

- When I submit the registration form, then an email verification link is sent within 60 seconds
- When I click the verification link, then my account is activated and I am redirected to onboarding
- When I try to register with an existing email, then an inline error appears without revealing account existence
- When registration requires admin approval, then I see a "pending approval" status until an admin activates me

**Dependencies:** US-005

---

### US-008 · Friend module — real-time connectivity · 13sp · 🟢 Could Have

**As a** user, **I want** to see which of my contacts are online and exchange real-time messages **so that** we can collaborate in context.

**Acceptance Criteria:**

- When I log in, then my online status is broadcast to my friend list within 2 seconds via Socket.IO
- When a friend sends me a message, then I receive it in real time without polling
- When a friend goes offline, then their status updates in my UI within 5 seconds
- When I am offline and a friend messages me, then I see unread badges when I next log in

**Dependencies:** US-005, US-004

---

## EP-03 · Content Management

> Routes: `/dashboard/blogs` · `/dashboard/events`  
> Priority: 🔴 Must Have

### US-009 · Blog article CRUD · 8sp · 🔴 Must Have

**As a** content editor, **I want** to create, edit, and publish blog articles at `/dashboard/blogs` **so that** I can manage the publication without developer involvement.

**Acceptance Criteria:**

- Given I visit `/dashboard/blogs`, then I see all articles with status (Draft, Published, Archived), author, and date
- When I create an article, then I have a rich-text editor with image upload support via MinIO
- When I publish an article, then it becomes publicly visible and SEO metadata is auto-generated
- When I save a draft, then an autosave occurs every 30 seconds to prevent data loss

**Dependencies:** US-005, MinIO (US-018)

---

### US-010 · Blog article versioning · 5sp · 🟡 Should Have

**As an** editor, **I want** to view and restore previous versions of articles **so that** I can safely experiment without losing approved content.

**Acceptance Criteria:**

- When I save an article, then a version snapshot is created automatically
- When I view version history, then I see a diff comparison between any two versions
- When I restore a version, then the current draft is replaced and a new version is saved

**Dependencies:** US-009

---

### US-011 · Event creation and calendar view · 8sp · 🔴 Must Have

**As an** event coordinator, **I want** to create and manage events at `/dashboard/events` **so that** attendees can discover upcoming activities.

**Acceptance Criteria:**

- When I create an event, then I must specify title, date/time, location, capacity, and registration type
- When I view `/dashboard/events`, then I see both a calendar view and a list view with filter by status
- When an event reaches capacity, then registration is automatically closed and a waitlist is offered
- When an event is updated, then registered attendees receive an email notification

**Dependencies:** US-005

---

### US-012 · Event attendee management · 5sp · 🟡 Should Have

**As an** event coordinator, **I want** to view and export attendee lists **so that** I can manage check-ins and communications.

**Acceptance Criteria:**

- When I open an event, then I see an attendee roster with registration time and status
- When I export attendees, then I receive a CSV with name, email, and registration metadata
- When I mark attendance, then each attendee status updates in real time

**Dependencies:** US-011

---

## EP-04 · E-commerce & Catalog

> Routes: `/dashboard/products` · `/dashboard/category-products` · `/dashboard/payments` · Automakers  
> Priority: 🔴 Must Have

### US-013 · Product listing management · 8sp · 🔴 Must Have

**As a** catalog manager, **I want** to create and manage product listings at `/dashboard/products` **so that** customers can browse accurate inventory.

**Acceptance Criteria:**

- When I create a product, then I must provide name, SKU, price, stock, images, and category
- When stock reaches zero, then the product is automatically marked out-of-stock in the frontend
- When I bulk-import products via CSV, then errors are reported per row without halting the entire import
- When I search products, then results filter in under 300ms across all fields

**Dependencies:** US-014 (categories), MinIO (US-018)

---

### US-014 · Product category hierarchy · 5sp · 🔴 Must Have

**As a** catalog manager, **I want** hierarchical product categories at `/dashboard/category-products` **so that** customers can navigate a logical taxonomy.

**Acceptance Criteria:**

- When I create a category, then I can assign it a parent to create a tree up to 3 levels deep
- When I move a category, then all child categories and product assignments are preserved
- When I delete a category, then I am warned of assigned products and must reassign before deletion

**Dependencies:** None

---

### US-015 · Payment processing and transactions · 13sp · 🔴 Must Have

**As a** finance admin, **I want** a `/dashboard/payments` view to monitor and manage payment transactions **so that** I can handle disputes and reconciliation.

**Acceptance Criteria:**

- When a payment is processed, then I see it in the dashboard within 30 seconds with status and metadata
- When I filter by date range, then only transactions within that range are shown
- When I initiate a refund, then a confirmation dialog shows the refund amount and a reason is required
- When a payment fails, then the order status updates and the customer is notified automatically

**Dependencies:** US-005, US-013

---

### US-016 · Automaker module — manufacturer management · 8sp · 🟡 Should Have

**As a** catalog manager, **I want** to manage car manufacturers **so that** products can be linked to specific makes and models for automotive-specific filtering.

**Acceptance Criteria:**

- When I create an automaker entry, then I provide name, country, logo, and supported model years
- When I assign a product to an automaker, then it appears in filtered views for that make
- When I search by automaker in the product catalog, then only compatible parts appear
- When an automaker entry is deleted, then product associations are flagged for reassignment

**Dependencies:** US-013, US-014

---

### US-017 · Inventory alerts and thresholds · 3sp · 🟡 Should Have

**As a** catalog manager, **I want** low-stock alerts **so that** I can reorder before products go out of stock.

**Acceptance Criteria:**

- When a product stock falls below the configured threshold, then an alert appears in the dashboard
- When I configure a reorder threshold per product, then the value persists and is shown in the list
- When stock is replenished above the threshold, then the alert is automatically dismissed

**Dependencies:** US-013

---

## EP-05 · Utilities & Integrations

> MinIO file storage · Telegram bot  
> Priority: 🟡 Should Have

### US-018 · MinIO file upload and management · 8sp · 🔴 Must Have

**As** any content user, **I want** to upload and manage files through the CMS **so that** all media is stored securely in one place.

**Acceptance Criteria:**

- When I upload a file, then it is stored in MinIO and a CDN-compatible URL is returned within 3 seconds
- When I upload an image, then thumbnail variants (200px, 800px) are auto-generated
- When I delete a file from the CMS, then it is removed from MinIO and all references are flagged
- When file upload fails, then a clear error message is shown and the upload can be retried

**Dependencies:** US-005

---

### US-019 · File storage browser UI · 5sp · 🟡 Should Have

**As a** content editor, **I want** a browsable media library **so that** I can reuse existing assets without re-uploading.

**Acceptance Criteria:**

- When I open the media library, then I see all uploaded files with thumbnail previews, name, and size
- When I search or filter by type (image, document, video), then results update immediately
- When I select a file, then its URL is copied or injected into the active editor

**Dependencies:** US-018

---

### US-020 · Telegram bot — system notifications · 5sp · 🟡 Should Have

**As an** admin, **I want** the CMS to send Telegram notifications for critical events **so that** I am alerted without checking the dashboard.

**Acceptance Criteria:**

- When a payment fails or is disputed, then a Telegram message is sent to the configured admin channel
- When a new user registers, then an optional Telegram notification is dispatched if enabled in settings
- When a system error occurs (e.g. MinIO unreachable), then a Telegram alert fires within 60 seconds
- When I configure the Telegram bot in settings, then I can test the connection with a test message button

**Dependencies:** US-002

---

### US-021 · Telegram bot — interactive commands · 8sp · 🟢 Could Have

**As an** admin, **I want** to query CMS stats via Telegram commands **so that** I can get quick reports without opening the dashboard.

**Acceptance Criteria:**

- When I send `/stats` to the bot, then I receive today's sales, new users, and top products
- When I send `/orders [status]`, then I receive a paginated list of matching orders
- When an unauthorized user attempts a bot command, then the bot ignores and logs the attempt
- When I send `/help`, then I receive a list of all available commands with descriptions

**Dependencies:** US-020

---

### US-022 · Audit log — admin actions · 5sp · 🟡 Should Have

**As an** admin, **I want** an immutable audit log of all admin actions **so that** I can trace who changed what and when.

**Acceptance Criteria:**

- When an admin creates, updates, or deletes any entity, then an audit entry is recorded with user, timestamp, and diff
- When I view the audit log, then I can filter by user, action type, entity, and date range
- When I export the audit log, then I receive a CSV covering the selected range

**Dependencies:** US-005, US-004

---

## Delivery Roadmap

### Now — Sprints 1–3 (Weeks 1–6)

#### Sprint 1 · Foundation · Weeks 1–2 · ~29sp

| Story | Title | Points | Priority |
|---|---|---|---|
| US-005 | JWT auth: login, refresh, logout | 8sp | 🔴 Must Have |
| US-006 | Role-based route guards | 5sp | 🔴 Must Have |
| US-018 | MinIO file upload integration | 8sp | 🔴 Must Have |
| US-014 | Product category hierarchy | 5sp | 🔴 Must Have |

**Sprint Outcome:** Secure access layer live; file storage operational; category tree ready

#### Sprint 2 · Core CMS Features · Weeks 3–4 · ~34sp

| Story | Title | Points | Priority |
|---|---|---|---|
| US-001 | Admin dashboard & statistics | 5sp | 🔴 Must Have |
| US-002 | System settings page | 3sp | 🔴 Must Have |
| US-004 | User management CRUD | 8sp | 🔴 Must Have |
| US-009 | Blog article CRUD + rich editor | 8sp | 🔴 Must Have |

**Sprint Outcome:** Admins can log in, manage users, configure system, and publish content

#### Sprint 3 · Commerce Core · Weeks 5–6 · ~34sp

| Story | Title | Points | Priority |
|---|---|---|---|
| US-013 | Product listing management | 8sp | 🔴 Must Have |
| US-015 | Payment processing dashboard | 13sp | 🔴 Must Have |
| US-011 | Event creation & calendar view | 8sp | 🔴 Must Have |
| US-007 | User registration flow | 5sp | 🟡 Should Have |

**Sprint Outcome:** Full e-commerce and event management operable; self-registration live

---

### Next — Sprints 4–5 (Weeks 7–10)

#### Sprint 4 · Enrichment · Weeks 7–8 · ~26sp

| Story | Title | Points | Priority |
|---|---|---|---|
| US-016 | Automaker module | 8sp | 🟡 Should Have |
| US-010 | Blog versioning & history | 5sp | 🟡 Should Have |
| US-012 | Event attendee management | 5sp | 🟡 Should Have |
| US-017 | Inventory alerts & thresholds | 3sp | 🟡 Should Have |

**Sprint Outcome:** Automotive catalog live; content safety via versioning; ops alerts active

#### Sprint 5 · Ops & Governance · Weeks 9–10 · ~23sp

| Story | Title | Points | Priority |
|---|---|---|---|
| US-020 | Telegram system notifications | 5sp | 🟡 Should Have |
| US-019 | Media library browser UI | 5sp | 🟡 Should Have |
| US-022 | Audit log — admin actions | 5sp | 🟡 Should Have |
| US-003 | User preferences settings | 2sp | 🟡 Should Have |

**Sprint Outcome:** Ops team has real-time alerts; compliance-ready audit trail in place

---

### Later — Sprint 6+ (Weeks 11+)

| Story | Title | Points | Priority |
|---|---|---|---|
| US-008 | Friend module (Socket.IO) | 13sp | 🟢 Could Have |
| US-021 | Telegram interactive commands | 8sp | 🟢 Could Have |

**Horizon Outcome:** Real-time collaboration; remote ops via Telegram bot commands

---

## Open Questions (confirm before Sprint 1 Planning)

1. **Payment gateway** — Which gateway is in scope (Stripe, PayPal, etc.)? This directly affects US-015 complexity and integration scope.
2. **Automaker data source** — Is there an existing manufacturer dataset to seed, or does the team build the list from scratch?
3. **Telegram bot hosting** — Runs as part of the CMS backend, or as a standalone service? Affects US-020/US-021 estimates.
4. **Team velocity** — Sprint sizes (29–34sp) assume 2–3 developers at ~10sp/dev/sprint. Adjust sprint boundaries to match actual capacity.

---

*Generated by Product Owner Mastery · PSPO / SAFe aligned · MoSCoW + WSJF prioritized*
