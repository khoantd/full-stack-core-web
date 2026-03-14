---
tags: [gotcha, mistake, edge-case, bug, warning]
summary: Mistakes and edge cases to avoid
relevantTo: [error, bug, fix, issue, problem]
importance: 0.9
relatedFiles: []
usageStats:
  loaded: 83
  referenced: 51
  successfulFeatures: 51
---
# Gotchas

Mistakes and edge cases to avoid. These are lessons learned from past issues.

---



#### [Gotcha] Incomplete refactoring - changed header logo text in LandingNav.tsx but left matching text in LandingFooter.tsx and page.tsx untouched (2026-03-04)
- **Situation:** When searching for 'Car Parts' across the codebase, multiple instances were found but only one was modified
- **Root cause:** The implementation focused on the immediate grep search result without systematically identifying all occurrences that might need consistency updates
- **How to avoid:** Single targeted change is faster but risks creating brand inconsistency if other instances should also change; developer noted this in summary but didn't act on it

#### [Gotcha] Text typos in UI components can exist undetected despite being visible to end users, especially when the component structure splits text across multiple JSX elements (e.g., <span>Car</span> Partss) (2026-03-04)
- **Situation:** The typo 'Partss' existed in LandingNav.tsx line 37 where the brand name was split across a styled span and plain text
- **Root cause:** When text is fragmented across JSX elements with different styling, the cognitive burden of reading the full text is distributed, making typos harder to catch in code review and visual inspection
- **How to avoid:** Splitting styled text provides better control over component styling but increases the cognitive load for identifying text-based issues

#### [Gotcha] Code state vs visual state mismatch - file already contained 'Car Partss' with double 's', but the visual reference image showed 'Car Parts' with single 's' (2026-03-04)
- **Situation:** Task requested changing 'Car Parts' to 'Car Partss', but code inspection revealed the change was already implemented while the reference image suggested otherwise
- **Root cause:** This indicates a disconnect between the current codebase state and documentation/screenshots used to communicate requirements. The image may have been from an older version or the change was made prior to task assignment
- **How to avoid:** Required careful verification with grep patterns before taking action; prevented unnecessary edits but added investigation overhead

#### [Gotcha] Text content split across JSX elements with className styling breaks string matching in tests (2026-03-04)
- **Situation:** Header logo uses `<span className="text-primary">Car</span> Partss` - the word 'Car' is in a styled span while 'Partss' is plain text. This makes it impossible to match the full text with simple selectors.
- **Root cause:** The implementation chose to style only part of the text (Car) differently, requiring test assertions to check each part separately or use whitespace-tolerant matching
- **How to avoid:** Styling flexibility gained but test complexity increased; grepping source code works but runtime DOM testing requires whitespace normalization

#### [Gotcha] Build cache (.next folder) retains old content after source file modification, potentially masking incomplete fixes or creating confusion about actual deployed state (2026-03-04)
- **Situation:** After fixing source file, grep results still showed 'Partsssss' in .next build artifacts, creating false impression that fix didn't work
- **Root cause:** Next.js and similar frameworks generate optimized production artifacts during build. These are cached and only regenerated on explicit builds, not on source changes
- **How to avoid:** Source verification is immediate but gives false sense of security - actual verification requires running build pipeline. More reliable = slower feedback loop

#### [Gotcha] Text replacement across multiple files requires systematic discovery before modification. Initial grep search found instances in 3 different files (LandingNav.tsx, LandingFooter.tsx, page.tsx) with inconsistent states. (2026-03-04)
- **Situation:** Task appeared simple (rename 'Car Parts' to 'Car Partss') but required checking multiple locations. LandingNav.tsx already had the target state while other files didn't.
- **Root cause:** Brand name strings are duplicated across header, footer, and metadata. Without comprehensive search, some instances could be missed, leading to inconsistent brand display.
- **How to avoid:** Taking time to verify all instances before editing ensured consistency but added extra steps. Automated find-and-replace could miss context-specific variations.

#### [Gotcha] Gradient uses three color stops (from-cyan-600 via-blue-500 to-cyan-600) creating directional color flow that requires understanding Tailwind gradient syntax (2026-03-07)
- **Situation:** Original gray gradient: 'from-gray-600 via-gray-500 to-gray-600'. Replacement used same pattern with cyan/blue but subtle differences in undertone meaning
- **Root cause:** Gray gradient created visual depth with mid-tone. Direct swap to cyan-600/blue-500/cyan-600 changes gradient intensity and direction. The 'via' color (blue-500) is lighter than terminal colors, creating different visual effect than original.
- **How to avoid:** Maintained visual complexity but shifted color psychology from neutral-cool to active-cool. May appear more 'energetic' than intended.

#### [Gotcha] Visual discrepancy between screenshot and grep results: typo appeared in header visually but grep initially found matches in footer and page.tsx, not the header component (2026-03-07)
- **Situation:** Developer was troubleshooting based on visual inspection of UI but search results pointed to different files initially
- **Root cause:** The grep search without path specification may have found results in unexpected files; developer needed to explicitly search for Header components to locate the actual source
- **How to avoid:** Required additional Glob and Read operations to pinpoint the correct component, but ensured finding the actual source of truth rather than just text occurrences

#### [Gotcha] Gradient color stops use different Tailwind scales (yellow-400/500/amber-500) rather than consistent scale depth (2026-03-07)
- **Situation:** Chosen gradient: `from-yellow-400 via-yellow-500 to-amber-500` mixes yellow and amber color families
- **Root cause:** Likely chosen to create visual depth and variation in the gradient, matching the original cyan-blue pattern which also used multiple color values
- **How to avoid:** More visually dynamic but creates color inconsistency that could complicate future theme adjustments or brand color standardization

#### [Gotcha] Color keyword search complexity in monorepos with multiple file types (2026-03-07)
- **Situation:** Initial search for 'yellow|orange' across tsx/ts/css files returned many unrelated results. Required multiple grep/find iterations to isolate the actual banner component among other components using similar colors
- **Root cause:** Monorepo structure (apps/frontend) + multiple component files + CSS-in-JS (Tailwind classes embedded in tsx) means color references are scattered. A naive grep for 'yellow' could match UI elements, Tailwind config, custom CSS, documentation, etc.
- **How to avoid:** Using file-type filtering and path scoping (components/landing directory) reduced noise. But still required reading the actual component file to verify it was the banner vs another yellow element

#### [Gotcha] Gradient color stops may not be semantically aligned with actual visual appearance (2026-03-07)
- **Situation:** Using `from-cyan-500 via-blue-600 to-blue-700` creates ocean blue effect, but individual color names don't obviously convey 'ocean blue'
- **Root cause:** Tailwind color names are semantically generic (cyan, blue) rather than semantic (primary, secondary, ocean-blue). Developers new to codebase must experiment or have design context to understand the intent
- **How to avoid:** Speed of implementation vs. code clarity and maintainability. New developers need design system documentation to understand color choices

#### [Gotcha] Color gradient exploration required multiple git branch checks and file searches before finding the actual implementation location (2026-03-07)
- **Situation:** Developer had to explore codebase structure extensively (glob patterns for hero/banner/home, git history searches) before locating the actual HeroSection.tsx file
- **Root cause:** No direct documentation of component locations or naming conventions; had to infer from directory structure (components/landing/HeroSection.tsx)
- **How to avoid:** Exploratory approach discovered full project structure (beneficial) but was slower than direct path navigation would have been (inefficient)

#### [Gotcha] Tailwind color intensity levels (e.g., cyan-500 vs cyan-900) need explicit coordination - changing base color requires identifying and updating all intensity variants (2026-03-08)
- **Situation:** When replacing yellow with cyan, both yellow-500 (lighter) and yellow-900 (darker) had to be found and replaced with their cyan equivalents to avoid visual inconsistency
- **Root cause:** Tailwind's color system uses intensity suffixes that don't auto-update. A simple find-replace of 'yellow' to 'cyan' would work, but understanding the semantic meaning (background vs text contrast) prevents mistakes
- **How to avoid:** Manual verification of each color level ensures correct contrast and visual hierarchy are maintained, but increases change complexity

#### [Gotcha] Color consistency across multiple button states requires coordinated class updates (text color, hover state, contrast ratio) (2026-03-12)
- **Situation:** Button had independent color classes for text (text-red-600) and hover (hover:bg-red-50) that needed synchronized updates
- **Root cause:** CSS doesn't enforce relationships between semantically-linked classes. Changing text color without updating hover state creates visual inconsistency and fails accessibility contrast requirements.
- **How to avoid:** Manual synchronization across 7 color class changes was tedious but guaranteed consistency. Alternatively, extracting to a color token system would require additional infrastructure.

#### [Gotcha] Multiple color references scattered across component require exhaustive search before editing (2026-03-13)
- **Situation:** Hero section had 6 different color modifications needed: background, overlay, text variants, button states
- **Root cause:** Color isn't centralized in a theme or CSS module - it's hardcoded in component classNames and comments, requiring manual discovery of all instances
- **How to avoid:** Direct inline classes are simple initially but become fragile at scale; centralized theme would prevent this