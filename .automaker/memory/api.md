---
tags: [api]
summary: api implementation decisions and patterns
relevantTo: [api]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 8
  referenced: 6
  successfulFeatures: 6
---
# api

### Implemented pagination with special 'page=all' string value rather than using a boolean flag or separate endpoint (2026-02-27)
- **Context:** Need to support both paginated and full dataset retrieval for list operations
- **Why:** Allows single endpoint flexibility - clients can request all data by passing 'page=all' string, which is more discoverable than a boolean flag and doesn't require separate endpoint logic
- **Rejected:** Boolean flag like 'noPagination=true' would be less intuitive; separate '/blogs/all' endpoint would duplicate controller logic
- **Trade-offs:** String comparison required in service layer adds minimal logic; type checking becomes looser (page: number | string) but query parameter strings are naturally strings anyway
- **Breaking if changed:** Changing to boolean flag or removing this feature breaks clients relying on full dataset retrieval in single request

#### [Gotcha] Response format wraps paginated data in 'data' array with separate 'pagination' metadata object (2026-02-27)
- **Situation:** Clients need both the actual blog records and pagination information (total, hasNextPage, etc.) in single response
- **Root cause:** Separating data from metadata prevents confusion, allows metadata to scale independently, provides clear contract for clients consuming the API
- **How to avoid:** One extra nesting level in JSON response; clients must understand response structure, but structure is predictable and consistent

#### [Pattern] Using ValidationPipe with whitelist: true to strip unknown properties from DTO validation (2026-02-27)
- **Problem solved:** Accepting DTO objects from HTTP requests without explicit field validation
- **Why this works:** Prevents property pollution attacks and accidental data leakage; whitelist ensures only declared DTO fields are processed, unknown fields silently discarded
- **Trade-offs:** Silent field stripping can hide client errors (malformed requests don't error), but security benefit outweighs debugging cost

### Sorting results by createdAt descending (newest first) as default behavior without sorting parameter (2026-02-27)
- **Context:** List endpoint returns blogs in specific order for consistent UX
- **Why:** Newest-first ordering matches typical social media/content patterns (feeds show recent content first), hardcoded default provides predictable behavior without requiring sort parameter
- **Rejected:** Oldest-first would show stale content first; allowing sort parameter would add complexity without clear benefit for initial implementation
- **Trade-offs:** Clients can't customize sort order, but consistent ordering enables predictable pagination; adding sort later is backward compatible
- **Breaking if changed:** Changing default sort order changes existing pagination consistency - clients relying on order will see different results

#### [Pattern] Created custom hooks (useBlogs, useBlog, useCreateBlog, etc.) wrapping React Query mutations and queries rather than calling API directly from components (2026-02-27)
- **Problem solved:** Need to handle loading states, error handling, cache invalidation, and data fetching across multiple components
- **Why this works:** React Query hooks encapsulate caching, request deduplication, and cache invalidation logic. Custom hooks create semantic layer abstracting implementation details. Calling invalidateQueries on mutations ensures data consistency automatically
- **Trade-offs:** Extra abstraction layer adds indirection but provides automatic cache management, prevents duplicate requests, and centralizes mutation logic

### Implemented dual pagination mode: standard pagination (page/limit) AND special 'page=all' mode that bypasses pagination entirely (2026-02-28)
- **Context:** Need to support both paginated list views for large datasets and full dataset exports/filters
- **Why:** Avoids performance degradation for small datasets (categories usually <100) while protecting against accidental full-dataset queries on large datasets. Client explicitly requests full data with page=all rather than assuming it
- **Rejected:** Single pagination mode would force unnecessary pagination overhead on small datasets; no pagination would risk memory issues on large product lists; limit-only approach unclear about total pages
- **Trade-offs:** Adds conditional logic in service (+5 lines) but eliminates need for frontend pagination UI for certain views. Requires API documentation and client awareness of this pattern
- **Breaking if changed:** Removing page=all handling breaks bulk export/report features; removing pagination entirely breaks large product list performance

#### [Pattern] Search implemented as regex pattern with case-insensitive matching on name field rather than full-text search or exact matching (2026-02-28)
- **Problem solved:** Users need to find categories/products by partial name match (e.g., 'elect' finds 'Electronics')
- **Why this works:** Regex with $i flag provides case-insensitive prefix/substring matching without full-text index overhead. Works with existing string field without schema migration. Simple and performant for small datasets (<10k records)
- **Trade-offs:** More flexible than exact match but slower on very large datasets without index (+index on name field recommended). Requires escaping special regex characters in production

### Products API accepts category filter as query parameter with server-side filtering rather than client-side filtering of all products (2026-02-28)
- **Context:** Products page includes category dropdown filter; pagination limits table to 10 items per page
- **Why:** With server-side pagination (10 items), fetching all products to filter client-side would miss products on other pages. Server-side filter ensures accurate result count and proper pagination boundaries.
- **Rejected:** Client-side filtering would require fetching all products into memory, breaking pagination UX and consuming excessive bandwidth
- **Trade-offs:** Adds query parameter complexity to hook, but eliminates N+1 query problems and keeps pagination logic correct
- **Breaking if changed:** If hooks removed server-side filtering, pagination would show incomplete result sets when category filter active

### Zod schemas duplicated in frontend types rather than shared with backend - each validates independently (2026-02-28)
- **Context:** ProductForm and CategoryProductForm validate input before submission; backend has its own DTO validation
- **Why:** Frontend and backend in separate repositories/monorepos. Frontend can't import backend types. Independent validation provides defense-in-depth and faster feedback UX.
- **Rejected:** Code generation from backend schema (OpenAPI) would add build complexity and dependency
- **Trade-offs:** Type duplication (DRY violation) but independent evolution path. Frontend validation can differ from backend (stricter or looser) based on UX needs.
- **Breaking if changed:** If backend schema changes (adds required field, changes constraints), frontend validation won't catch it - must manually update both. Inconsistency risks silent failures.

### Implemented date validation at DTO level (endDate > startDate) using class-validator decorators rather than in controller/service (2026-02-28)
- **Context:** Events require logical validation that endDate must be after startDate before persisting to database
- **Why:** DTO-level validation follows NestJS conventions, provides automatic error responses with proper HTTP status codes, validates before service layer processes data, prevents invalid state in database
- **Rejected:** Service-layer validation would require duplicate checks, controller validation scattered logic, database constraints alone wouldn't provide user-friendly error messages
- **Trade-offs:** DTO validation is automatic but less flexible; complex business logic still needs service layer. Simpler code path for happy cases.
- **Breaking if changed:** Moving validation to service creates inconsistent error handling across endpoints and allows invalid data through other code paths

### Backend returns paginated results with page/limit query params but also supports `page=all` option to bypass pagination (2026-02-28)
- **Context:** Frontend needs both paginated table view and potential full list exports/selects
- **Why:** Allows single endpoint to serve different UI needs without extra parameters. Page=all is explicit marker, doesn't require special client logic.
- **Rejected:** Separate endpoints (/events/all, /events/paginated) creates API duplication. Unlimited default returns breaks frontend pagination UI.
- **Trade-offs:** Single endpoint complexity but flexible. Must document that page=all returns all results (could be 10K+ docs), client must handle large payloads.
- **Breaking if changed:** Removing page=all option forces separate endpoint creation or client-side filtering of full results (memory inefficient)

### Support page='all' query parameter alongside numeric pagination (2026-03-01)
- **Context:** Event dropdown needs all events at once, but main table needs pagination for performance
- **Why:** Allows flexible client usage - dropdown can request all with single query, table pagination independently manages large datasets. Avoids multiple requests for dropdowns.
- **Rejected:** Always paginate or always return all - would either require multiple requests in dropdowns or break table performance with large datasets
- **Trade-offs:** Service must handle both cases, slightly more complex. But eliminates N+1 query patterns on client side.
- **Breaking if changed:** Without this, dropdown components must either make multiple paginated requests or frontend receives huge payloads, breaking UX or performance

#### [Pattern] Combined search and filter parameters (userName/userEmail search + eventId and status filters simultaneously) (2026-03-01)
- **Problem solved:** User needs to find 'payments for John Smith in the January event that are pending'
- **Why this works:** Search and filters are orthogonal - both should compose. Database regex and equality filters both apply. Matches user mental model of refining results.
- **Trade-offs:** Query complexity higher, service logic must combine conditions properly. But powerful and matches user expectations.

### Separate PATCH endpoint for status updates only (/payments/:id/status) instead of using PUT for full updates (2026-03-01)
- **Context:** Payment status needs independent updating from form, particularly from table UI dropdown without full payment data
- **Why:** Prevents accidental overwrites of payment data when only status should change. Allows granular permission control (update-status vs full-update). Table dropdown can call status-only endpoint without loading full form data
- **Rejected:** Include status in PUT endpoint for full updates - would require always sending complete payment object, risks data loss
- **Trade-offs:** Easier: Intent clarity, smaller payloads, independent permission scopes. Harder: Two endpoints to maintain, client must know which to call for different operations
- **Breaking if changed:** If merged back into PUT endpoint, need to validate all fields present and handle partial updates carefully to avoid data loss