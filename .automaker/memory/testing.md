---
tags: [testing]
summary: testing implementation decisions and patterns
relevantTo: [testing]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# testing

#### [Gotcha] Category deletion has no cascade delete protection on backend - orphaned products will remain after category deleted (2026-02-28)
- **Situation:** Summary notes flagged this as 'no cascade delete implemented' but implementation doesn't prevent user from deleting in-use categories
- **Root cause:** Frontend has no relationship integrity checks. Backend likely has same issue. User can delete category from dropdown even if products reference it.
- **How to avoid:** Simple delete implementation vs data integrity risk. Solution requires backend cascade delete or soft-delete approach.

#### [Gotcha] Status update logic must be tested in isolation (PATCH endpoint) AND in create/update flows since both trigger paidAt changes (2026-03-01)
- **Situation:** Business logic for setting/clearing paidAt exists in multiple code paths
- **Root cause:** Ensures consistency across all payment state changes. Single source of truth would be helper function, but spread across service means testing prevents divergence.
- **How to avoid:** More test cases required, but catches subtle bugs where status logic diverges between endpoints.

#### [Gotcha] PaymentTable status dropdown relies on usePaymentUpdate hook which requires React Query setup - integration test complexity (2026-03-01)
- **Situation:** Changing status from table cell dropdown invokes mutation that needs mocking
- **Root cause:** Realistic pattern - mutations tied to UI components. Ensures status changes actually update server
- **How to avoid:** Easier: Tests catch real issues. Harder: Need React Query mock setup, async test handling, loading states

#### [Gotcha] Playwright end-to-end tests cannot be easily executed in resource-constrained environments (missing system dependencies like libglib-2.0.so.0), requiring fallback to static code verification (2026-03-04)
- **Situation:** Attempted to create and run Playwright tests to verify the UI text change, but browser installation failed due to missing system libraries
- **Root cause:** Playwright requires the full browser runtime stack including system-level graphics and C libraries, which may not be available in minimal CI/CD or development environments
- **How to avoid:** Static code verification is faster and more reliable in constrained environments but provides less assurance about actual UI rendering compared to browser-based tests

#### [Gotcha] Playwright browser tests require system-level dependencies (libglib-2.0.so.0) that may not be available in all environments, causing test execution to fail even when Playwright is installed via npm (2026-03-04)
- **Situation:** Attempted to create and run Playwright E2E tests to verify UI text changes in a sandboxed/containerized environment
- **Root cause:** Playwright requires headless browser binaries which depend on system libraries. The npm package alone is insufficient - chromium/firefox binaries need OS-level dependencies
- **How to avoid:** Visual verification through browser tests is ideal for UI changes but adds environment complexity; file inspection + build verification is faster for simple text changes but provides less confidence in actual rendering

### Fallback to build verification instead of E2E tests when Playwright environment is unavailable, using successful compilation as a proxy for correctness (2026-03-04)
- **Context:** Needed to verify a simple text change in a banner component when full browser testing wasn't feasible
- **Why:** Build success guarantees TypeScript compilation passed and component syntax is valid; for straightforward text replacements, this is sufficient to catch structural issues, and file inspection confirms the text change
- **Rejected:** Skipping verification entirely; pursuing complex Playwright setup in incompatible environment
- **Trade-offs:** Build verification is fast and works in any environment but doesn't catch runtime issues, CSS problems, or incorrect rendering; full E2E tests catch more issues but require significant environment setup
- **Breaking if changed:** If component has syntax errors or TypeScript issues unrelated to the text change, build verification catches them; but rendering bugs (wrong element targeted, CSS hiding text) would be missed

#### [Gotcha] Playwright E2E tests require system dependencies (libglib-2.0.so.0) that may not be available in all environments, causing test execution to fail even when tests are syntactically correct (2026-03-04)
- **Situation:** Attempted to create and run Playwright tests to verify UI text changes in a headless environment
- **Root cause:** Playwright uses Chromium under the hood which requires system-level libraries. These aren't installed by default in minimal/containerized environments
- **How to avoid:** E2E tests provide confidence in UI changes but add environmental setup burden. Manual browser verification or CI/CD environments with proper dependencies are more practical

### Chose to verify changes through file reading and grep patterns rather than relying on failed E2E test infrastructure (2026-03-04)
- **Context:** Playwright test execution failed due to missing system dependencies, needed alternative verification method
- **Why:** Direct file inspection and grep are reliable, environment-agnostic, and provide immediate proof that text changes were applied correctly at the source level
- **Rejected:** Could have forced Playwright setup or waited for proper test environment; instead chose pragmatic verification
- **Trade-offs:** Direct file verification confirms code changes but doesn't verify runtime rendering or CSS application. Acceptable for simple text changes but insufficient for complex UI logic
- **Breaking if changed:** If the banner text is only rendered through template processing or dynamic rendering at runtime, static file inspection wouldn't catch those issues

#### [Gotcha] Playwright headless browser requires system libraries (libglib-2.0) not available in all CI/container environments (2026-03-04)
- **Situation:** Attempted to run Playwright test to verify header change but browser failed to initialize due to missing system dependencies
- **Root cause:** Playwright chromium needs glib and other system libraries for rendering; some container/CI images strip non-essential packages
- **How to avoid:** Real browser testing is more accurate but fragile in limited environments; pure unit testing would be faster but wouldn't catch rendering issues

#### [Gotcha] Playwright E2E testing was attempted but failed due to missing system libraries (libglib-2.0.so.0) in the environment, requiring fallback to source code verification and build validation (2026-03-04)
- **Situation:** After making a UI text change, the team attempted to create and run a Playwright test to verify the change, but the test environment lacked necessary system dependencies
- **Root cause:** E2E tests provide comprehensive verification including rendering and actual DOM state, but require a fully configured browser environment. In constrained CI/deployment environments, this dependency chain can break
- **How to avoid:** E2E tests are more thorough but fragile; build-time source code verification is faster and more reliable but less comprehensive. The fallback to grep + build verification traded test coverage for reliability

#### [Pattern] Fallback verification strategy: grep source code + npm build instead of E2E tests when environment is unavailable (2026-03-04)
- **Problem solved:** When Playwright couldn't run, verification shifted to checking that the literal string change existed in source and that the build succeeded
- **Why this works:** Source code verification is environment-agnostic and catches syntax/import errors immediately. Build step validates compilation without requiring browser automation. Together they provide reasonable confidence for simple text changes
- **Trade-offs:** Build verification catches compile errors and import issues but cannot detect rendering problems, CSS issues, or user interaction flow problems. Good for text changes, insufficient for layout or logic changes

#### [Gotcha] Playwright browser testing requires system dependencies (libglib-2.0.so.0) that may not be available in sandboxed environments, making browser-based E2E tests fail silently (2026-03-04)
- **Situation:** Attempted to create and run Playwright tests to verify the UI text fix but execution failed due to missing browser runtime dependencies
- **Root cause:** Playwright needs to spawn actual browser instances which require system-level libraries. Sandboxed/minimal environments often strip these for security and size constraints
- **How to avoid:** Had to fall back to source code verification (grep) instead of actual user-facing visual verification. Faster iteration but less confidence in actual UI rendering

#### [Gotcha] Playwright E2E test creation for simple text verification failed due to missing system libraries (libglib-2.0.so.0), forcing fallback to source code verification via grep. (2026-03-04)
- **Situation:** Attempted to create automated test to verify changes, but environment lacked required dependencies for Playwright browser automation.
- **Root cause:** E2E tests provide reliable verification that changes are actually rendered correctly in the browser, not just present in source code.
- **How to avoid:** Manual source code verification (grep search) is faster and doesn't require environment setup, but doesn't verify actual rendering. E2E tests catch CSS hiding, conditional rendering issues.

#### [Gotcha] Playwright browser installation and test execution failed in CI environment due to missing system libraries (libglib-2.0.so.0), requiring fallback to static code analysis for verification (2026-03-07)
- **Situation:** Attempted to create and run Playwright end-to-end tests to verify status column displays badge instead of select, but hit environment limitations
- **Root cause:** Full headless browser testing requires complete system library stack. Static analysis (linting, type checking) provided sufficient verification for this change
- **How to avoid:** No runtime verification of DOM structure/element visibility (would catch unmounted components, selector changes), but code structure changes were fully verified via static checks

#### [Gotcha] CSS class name changes in JSX components are not automatically tested without explicit visual regression or snapshot testing. The curl verification only checks if the class string appears in HTML, not if styles actually render. (2026-03-07)
- **Situation:** Implementation verified via grep'ing HTML output for the string 'from-gray-500 via-gray-600 to-gray-700', but this doesn't guarantee the browser interprets Tailwind correctly.
- **Root cause:** String presence in HTML doesn't equal working styles - Tailwind compilation, CSS ordering, specificity conflicts, or PurgeCSS could all prevent styles from rendering.
- **How to avoid:** Quick grep verification is fast and requires no infrastructure, but provides false confidence. Proper visual testing catches real issues but adds complexity.

#### [Gotcha] Test assertions must be updated in lockstep with UI changes, not as separate commits (2026-03-07)
- **Situation:** Color change in HeroSection.tsx required corresponding updates in verify-banner-color.spec.ts for tests to remain valid
- **Root cause:** Tests serve as contracts that verify expected behavior. If UI changes without test updates, tests become misleading documentation that no longer validate actual behavior
- **How to avoid:** Easier: immediate feedback that color change was complete. Harder: requires finding and updating all related test assertions across the codebase

#### [Gotcha] Test assertions must match exact Tailwind class names - updating UI colors requires parallel test updates or tests fail silently (2026-03-07)
- **Situation:** Changed hero section gradient from pink to red, which required updating both component className and test assertions checking for specific color classes
- **Root cause:** E2E tests use getAttribute('class') to verify CSS classes applied - Tailwind class names are the source of truth, not computed styles. Mismatch between component and test causes false negatives
- **How to avoid:** Class-based assertions are more brittle to refactoring but more reliable across browsers; computed style checks are resilient but environment-dependent