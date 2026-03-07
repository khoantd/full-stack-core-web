---
tags: [architecture]
summary: architecture implementation decisions and patterns
relevantTo: [architecture]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# architecture

#### [Pattern] Component variant system lacks complete specification of all inheritable CSS properties. Outline variant only defined border and background but not text color, creating implicit dependencies on parent context. (2026-02-23)
- **Problem solved:** Button component's outline variant definition incomplete - it assumes text color comes from elsewhere, making it fragile when used in different parent contexts with different text color inheritance.
- **Why this works:** This pattern exposes a gap in component design: variants should be self-contained and not rely on parent styling assumptions. Outline buttons need to specify all color properties (border, background, text) regardless of context.
- **Trade-offs:** Making variant definitions more explicit requires more CSS rules in component definition but significantly improves component reusability. Reduces downstream styling bugs in consuming components.

#### [Gotcha] No verification that the typo fix ('Parts' to 'Partss') was intentional - appears to be a typo in the requirement itself rather than a legitimate business change (2026-03-04)
- **Situation:** The change converts valid English text to misspelled text without any context explaining why
- **Root cause:** The implementation followed the literal instruction without questioning the semantic validity of the change
- **How to avoid:** Strict instruction-following is faster but introduces a typo into production; clarity-seeking would have caught a potentially erroneous requirement

#### [Pattern] Multi-step verification pattern: code grep → file read → code edit → static verification → grep for remaining instances → build verification (2026-03-04)
- **Problem solved:** To fix a single typo with confidence, multiple verification layers were applied before and after the change
- **Why this works:** A single-pass fix without verification could mask the actual location of the typo, introduce new issues during editing, or leave related instances unfixed. Multiple verifications provide defense in depth
- **Trade-offs:** Multi-step verification takes more time and tool invocations but significantly reduces the chance of incomplete or incorrect fixes being committed

### Brand name duplication across multiple files instead of centralized constant (2026-03-04)
- **Context:** After change, 'Car Parts'/'Car Partss' exists in LandingNav.tsx, LandingFooter.tsx, and page.tsx with different contexts (navigation, footer, page title)
- **Why:** Each location has different styling/context needs, but root cause is lack of design system or constants file for brand strings
- **Rejected:** Could create brands.constants.ts or move to environment config, but would require refactoring multiple components
- **Trade-offs:** Component independence and inline readability gained, but single source of truth lost - next rebranding requires 3+ manual edits and testing
- **Breaking if changed:** If brand name needs to change again, missing any single location breaks brand consistency across the site. No CI check exists to catch this.

### Text variations exist across different components (LandingNav, LandingFooter, page title) without centralized definition (2026-03-04)
- **Context:** Header shows 'Car Partsssss', footer shows 'Car Parts', and page title shows 'Car Parts' - each location has its own hardcoded string
- **Why:** Simple copy-paste implementation for isolated text changes; no shared constant or config required
- **Rejected:** Could have extracted to a constant (SITE_NAME or BRAND_NAME) and referenced everywhere, but that adds indirection for a single change
- **Trade-offs:** Easier initial change (edit one file) but harder maintenance (consistency issues, multiple places to update for brand changes)
- **Breaking if changed:** Future brand name changes require updates in multiple files; no single source of truth means inconsistency risk

#### [Pattern] Brand name appears in 3 distinct locations: component structure (header/footer), content text, and metadata (page title). Each requires separate edits because they're in different file types and contexts. (2026-03-04)
- **Problem solved:** The 'Car Parts'/'Car Partss' string exists as: JSX content in components, plain text in link labels, and metadata string in Next.js config.
- **Why this works:** Different file types and contexts (React components, HTML content, Next.js metadata) don't share a single source of truth for the brand name.
- **Trade-offs:** Current approach: each instance edited manually - simple but error-prone for future updates. Alternative (shared constants): more maintainable long-term but adds abstraction layer.