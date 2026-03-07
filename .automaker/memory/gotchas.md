---
tags: [gotcha, mistake, edge-case, bug, warning]
summary: Mistakes and edge cases to avoid
relevantTo: [error, bug, fix, issue, problem]
importance: 0.9
relatedFiles: []
usageStats:
  loaded: 18
  referenced: 13
  successfulFeatures: 13
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