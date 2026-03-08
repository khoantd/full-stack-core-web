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

#### [Pattern] Removed unused hook imports and callback functions from parent component (useUpdatePaymentStatus, handleStatusChange) (2026-03-07)
- **Problem solved:** Parent page component had mutation hooks and handlers that were no longer needed after removing inline edit capability
- **Why this works:** Prevents zombie code that creates unused mutations and API call infrastructure. Eliminates API endpoints being configured but never called, reducing mental overhead for future developers
- **Trade-offs:** If inline editing needs to be re-added later, mutation hook setup and handlers must be recreated. But this is discoverable from git history and cleaner than maintaining dead code

#### [Pattern] Using git worktrees for feature branches (`.worktrees/feature-change-color`) to isolate experimental work (2026-03-07)
- **Problem solved:** Project structure shows feature work isolated in `.worktrees/feature-change-color/` directory rather than traditional git branches
- **Why this works:** Worktrees allow multiple working directories on the same repository without switching branches, enabling parallel development and isolated testing of features
- **Trade-offs:** Worktrees add filesystem complexity but enable true parallel work; requires cleanup of worktree directories; not all tools understand worktree structure

#### [Gotcha] Gradient backgrounds with multiple color stops (from-X via-Y to-Z) require updating all three values atomically to maintain visual consistency (2026-03-07)
- **Situation:** Hero section uses 3-color gradient. Updating only some color values would create visual inconsistency or mismatched color transitions
- **Root cause:** Gradients rely on color relationships for visual balance. Red-600→Red-500→Red-600 has specific contrast and saturation curve that must map consistently to Gray-600→Gray-500→Gray-600
- **How to avoid:** Maintaining multi-stop gradients preserves visual sophistication but increases coordination cost when changing themes. Single-color backgrounds would be easier to theme but less visually interesting

### Component-based styling approach using Tailwind CSS classes rather than CSS-in-JS or separate stylesheet (2026-03-07)
- **Context:** HeroSection.tsx uses inline Tailwind classes for all styling, making color changes straightforward string replacements
- **Why:** Tight coupling of styles to component structure reduces indirection. Single source of truth per element. Easy visual traceability - see className and immediately understand styling.
- **Rejected:** Separate CSS files would require mapping class names to selectors; CSS variables would add abstraction layer; styled-components would require additional dependencies
- **Trade-offs:** Easier for simple changes, harder to maintain consistent design tokens across many components. No single place to update brand colors globally without grep-and-replace.
- **Breaking if changed:** If design system later requires centralized color management, would need refactoring to extract magic color strings into config or CSS variables

### Fixed typo in multiple locations (header, footer, page title metadata) rather than just the visually apparent location (2026-03-07)
- **Context:** After fixing the header, developer proactively searched for and fixed the same typo in other files for consistency
- **Why:** Ensures brand consistency across the entire user journey and prevents confusion where same text appears with different spellings in different contexts
- **Rejected:** Fixing only the header component since that's what the user reported visually
- **Trade-offs:** Required additional edits and file reads, but prevented brand inconsistency and potential SEO issues (page title is used for search results and bookmarks)
- **Breaking if changed:** If only header was fixed: users would see 'Car Parts' in header but 'Car Partss' in footer and browser tabs, appearing unprofessional and creating duplicate/conflicting brand messaging

#### [Pattern] Component-based button styling uses Tailwind utility classes directly in JSX rather than predefined button variants for outline buttons (2026-03-07)
- **Problem solved:** HeroSection applies `text-white`, `border-white/30`, `hover:bg-white/10` inline rather than through a button variant composition
- **Why this works:** Allows one-off styling for specific use cases (hero section light theme) without creating new variant definitions. Quicker for one-off needs but creates styling inconsistency
- **Trade-offs:** Inline styling is flexible but creates maintenance burden - same style applied differently elsewhere will diverge. Changes here don't propagate

#### [Pattern] Hard-coded Tailwind color classes in component instead of centralized theme configuration (2026-03-07)
- **Problem solved:** Hero section colors are embedded directly in className strings rather than sourced from a theme or design system
- **Why this works:** Quick implementation for single-use styling; colors tightly coupled to specific component
- **Trade-offs:** Easy to implement and modify for one-off changes, but creates maintenance burden if same colors need updating elsewhere or if design system evolves

### Inline Tailwind classes within tsx component rather than extracted theme/style module (2026-03-07)
- **Context:** The HeroSection component uses inline className strings with Tailwind utility classes rather than imported color constants or CSS modules
- **Why:** Tailwind's utility-first approach encourages inline styling for rapid development and co-locating styles with JSX. For component-specific styling, this reduces indirection. However, this creates tight coupling between component logic and presentation
- **Rejected:** Alternative of exporting color tokens (e.g., BANNER_GRADIENT = 'from-gray-500 via-gray-600 to-gray-700') would centralize color changes but adds extra indirection for single-use components
- **Trade-offs:** Easier: Quick visual changes, no file-switching needed. Harder: Harder to implement global color scheme changes - requires updating multiple files if the same color is used elsewhere; no single source of truth for brand colors
- **Breaking if changed:** If brand colors need to change site-wide, this pattern requires find-and-replace across multiple component files rather than one centralized config update

#### [Pattern] Inline styling changes in component className attributes vs. extracting to separate Tailwind configuration. HeroSection uses inline gradient classes rather than custom CSS or theme extensions. (2026-03-07)
- **Problem solved:** Banner color change required modifying className string directly in the component file rather than centralizing color definitions.
- **Why this works:** Keeping styles inline with components allows for component-specific customization without adding configuration complexity. Good for one-off overrides.
- **Trade-offs:** Inline approach: easier to understand component purpose, but harder to maintain brand consistency across the app. Centralized approach: better consistency but adds abstraction.

#### [Pattern] Tailwind CSS gradient utilities (from-X-Y via-X-Y to-X-Y) enable consistent, themeable color changes across one component without CSS file duplication (2026-03-07)
- **Problem solved:** Hero section uses 3-stop gradient that needed color change from gray to yellow scale
- **Why this works:** Tailwind's utility-first approach with named color scales (500, 600, 700) ensures color consistency and makes bulk color changes straightforward. Single className change replaces what would require multiple CSS rule updates
- **Trade-offs:** Easier: className-based color changes require no CSS file management. Harder: difficult to see actual RGB values without Tailwind documentation lookup; className verbosity increases with multi-stop gradients

### Using Tailwind utility classes for gradients instead of CSS variables or design tokens (2026-03-07)
- **Context:** Hero section gradient defined as `from-cyan-500 via-blue-600 to-blue-700` directly in className
- **Why:** Tailwind's utility-first approach provides immediate visual feedback and keeps styling co-located with component logic
- **Rejected:** CSS variables or design tokens would require additional abstraction layer but would provide centralized color management across entire design system
- **Trade-offs:** Faster development and easier to read in context, but harder to enforce design system consistency. Changing color requires code modification rather than configuration
- **Breaking if changed:** If moving to design tokens system later, all Tailwind color classes would need extraction and centralization. Multiple hero sections with different colors would be difficult to manage

#### [Pattern] Used exploration-first approach (Glob patterns, Bash file discovery, Git history search) before making edits to locate component implementation (2026-03-07)
- **Problem solved:** Required to modify hero section styling but started with unknown codebase structure and file locations
- **Why this works:** Prevents blind modifications to wrong files; discovers related branches/commits showing previous similar changes; maps component hierarchy (landing folder structure)
- **Trade-offs:** Takes more time upfront but prevents rework; exploration discovered existing test file (verify-banner-color.spec.ts) and related branches (hotfix/change-text-banner)

#### [Pattern] Landing page components organized in dedicated /components/landing/ directory structure with separate concerns (HeroSection, LandingNav, FeaturedProducts, ProductCategories, LandingFooter) (2026-03-07)
- **Problem solved:** Home page is composed of multiple modular components rather than a single monolithic file
- **Why this works:** Component modularity enables reusability, independent testing, easier maintenance, and clear separation of concerns. Each section has single responsibility.
- **Trade-offs:** More files and directory nesting (slightly harder to navigate) vs better code organization and testability

### Discovery phase used multiple exploration tools (Glob patterns, Grep, Bash find commands) before reading component - redundant searches could have been consolidated (2026-03-07)
- **Context:** Executed 15+ search commands (glob, grep, find, ls) to locate HeroSection.tsx when direct path could have been inferred from naming conventions
- **Why:** Defensive exploration in unfamiliar codebase reduces risk of missing files or misunderstanding structure. Cost is verbose tool usage
- **Rejected:** Direct path assumption without verification - could miss refactored components or non-standard layouts
- **Trade-offs:** Thorough exploration is slower but more reliable; direct paths are faster but fragile to codebase reorganization
- **Breaking if changed:** Skipping exploration and hardcoding paths creates brittle scripts that break when components move or are renamed

#### [Pattern] Isolated styling changes to single component file (HeroSection.tsx) rather than creating wrapper components or separate style modules (2026-03-07)
- **Problem solved:** Need to rebrand hero section colors while maintaining component functionality
- **Why this works:** Hero section is cohesive visual unit with single responsibility - keeping all related styles together improves maintainability and reduces cognitive load. Component is self-contained and doesn't cascade styles to children
- **Trade-offs:** Gained: simplicity, quick visual feedback, direct cause-effect relationship. Lost: potential color reusability if multiple components need sea blue gradient

### Incremental color updates via multiple edit operations instead of component refactor (2026-03-07)
- **Context:** Changed hero section colors by making 4 separate Edit calls targeting specific className strings rather than extracting color to configuration
- **Why:** Direct string replacement is fastest for one-off changes; avoids unnecessary abstraction when color may not vary at runtime. Component structure remains simple
- **Rejected:** Could have extracted colors to Tailwind config or component props, but adds complexity for static styling that isn't reused elsewhere
- **Trade-offs:** Easy to implement quickly but makes future color changes harder; hardcoded classes are difficult to change globally without multiple edits
- **Breaking if changed:** If hero section needs dynamic theming or multiple color variants later, hardcoded classes would need refactoring to extract color values

#### [Pattern] Used systematic exploration (Glob patterns → directory structure → file reading) to locate and understand component before modification. Started with broad search patterns (*hero*, *banner*) then narrowed to specific file system paths. (2026-03-07)
- **Problem solved:** Task required finding and modifying a specific UI component in an unknown/large codebase structure.
- **Why this works:** This discovery pattern prevents blind assumptions about folder structure and component locations. By exploring first, avoided editing wrong files and understood the landing page component architecture.
- **Trade-offs:** Initial exploration takes more time upfront but provides confidence and prevents rework. Better for unfamiliar codebases than jumping to edits.

#### [Pattern] Color values hardcoded in component classes rather than extracted to theme config/design tokens (2026-03-07)
- **Problem solved:** HeroSection.tsx contains hardcoded Tailwind classes (bg-yellow-500, text-gray-900) with no centralized color management
- **Why this works:** Tailwind utilities are applied directly; no theme abstraction layer created despite being a landing page that may have reusable color scheme
- **Trade-offs:** Faster initial implementation vs. reduced maintainability; single color change required editing component files rather than config

### Exploration strategy: Multiple search patterns used (hero/banner/Products/button) to locate component before modification (2026-03-08)
- **Context:** Finding HeroSection.tsx required searching by pattern names (hero, banner), text content (Products), and file location (components/landing/)
- **Why:** Without a clear mental model of project structure, multiple search vectors increase probability of finding the correct component. Button text 'Products' was a unique identifier
- **Rejected:** Single grep for 'About Us' might miss the file if component uses dynamic text or translation strings
- **Trade-offs:** Multiple searches are slower but more reliable; a project index or documentation would be faster but requires maintenance
- **Breaking if changed:** If component names don't match directory structure or if UI text is dynamicized from API/translations, this discovery approach becomes unreliable