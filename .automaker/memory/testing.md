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

### Test assertions simplified from gradient color verification (from-red-500/via-red-600/to-red-700) to single class check (bg-yellow-500) (2026-03-07)
- **Context:** Original implementation tested multiple gradient classes; new implementation uses solid color
- **Why:** Tailwind gradient syntax is more verbose and brittle; single background class is simpler, more maintainable, and less prone to test fragility
- **Rejected:** Could have kept gradient approach with yellow gradients (from-yellow-400/via-yellow-500/to-yellow-600) but added unnecessary complexity
- **Trade-offs:** Lost color depth/sophistication from gradient for gain in simplicity and test maintainability; visual richness decreased
- **Breaking if changed:** If gradient styling is reintroduced without updating test expectations, tests will fail and mask the actual CSS changes

#### [Gotcha] Test verification uses className attribute matching rather than computed styles (2026-03-08)
- **Situation:** Playwright test checks for 'bg-red-500' presence in class string, not actual rendered color value
- **Root cause:** Tailwind CSS uses utility classes that compile to CSS; verifying the class name is simpler and more reliable than parsing computed styles which may be subject to browser rendering differences
- **How to avoid:** Class-based verification is fast and deterministic but only validates that the right class is applied, not that Tailwind actually outputs the expected color value

#### [Gotcha] Test file uses class name assertion (expect(className).toContain('bg-green-500')) instead of computed style verification (2026-03-08)
- **Situation:** Playwright E2E test for banner color verification
- **Root cause:** Class-based approach is simpler and more maintainable than computing actual CSS colors, which requires browser rendering and color space conversion
- **How to avoid:** Faster tests but couples test to implementation detail (Tailwind classes); if CSS framework changes, test breaks despite visual correctness

#### [Gotcha] Test file was updated to verify new color class name (bg-cyan-500) instead of old one (bg-green-500), preventing false-positive test passing (2026-03-10)
- **Situation:** Color change to UI elements could silently fail in production if tests weren't updated to match new implementation
- **Root cause:** CSS class names are the source of truth in Tailwind-based projects. Tests must verify the actual classes applied, not just visual appearance, because Tailwind generates styles from class names.
- **How to avoid:** Class-name based testing is implementation-specific but catches CSS generation issues early. Visual testing would be more resilient to refactoring but slower.

### Test assertions must be updated when color specifications change, requiring test maintenance to stay synchronized with implementation (2026-03-11)
- **Context:** Playwright E2E test was checking for 'bg-cyan-500' class, which would fail after color change to 'bg-red-500'
- **Why:** E2E tests verify actual CSS classes present in the DOM, not logical intent. The test tightly couples to implementation details (specific color values) rather than semantic behavior
- **Rejected:** Leaving test unchanged would create false negatives; alternatively, could write tests that verify contrast ratios or color accessibility rather than specific hex/tailwind values
- **Trade-offs:** Class-based assertions are simple and direct but brittle across design changes; semantic assertions would be more resilient but harder to implement reliably
- **Breaking if changed:** Unsynced tests create false test failures that either get ignored or cause deployment blocking; creates distrust in test suite reliability

#### [Pattern] Test file validates CSS classes directly (className contains 'bg-blue-600') rather than computed styles (2026-03-12)
- **Problem solved:** Playwright test in verify-banner-color.spec.ts checks element class attributes
- **Why this works:** Class-based validation is simpler and faster than computing rendered colors; directly tests the implementation intent rather than browser rendering variations
- **Trade-offs:** Class checking is fast and deterministic but doesn't catch CSS override bugs; won't catch if class exists but CSS file is broken

#### [Pattern] Updated Playwright test from checking 'bg-blue-600' to 'bg-yellow-500' using class attribute assertion rather than computed styles (2026-03-12)
- **Problem solved:** Component color changes require test updates to prevent false positives
- **Why this works:** Testing className directly is simpler and more reliable than checking computed CSS styles in Playwright, which requires more setup. Tailwind classes guarantee specific color values
- **Trade-offs:** Class-based testing is less robust to CSS refactoring but faster and more maintainable for Tailwind projects

### Using Tailwind class assertions in test specs rather than computed style checks (2026-03-13)
- **Context:** Test verifies `className.toContain('bg-pink-500')` rather than checking computed CSS values
- **Why:** Class-based assertions work in test environments where Tailwind compilation is available and are more readable. Avoids headless browser CSS computation complexity
- **Rejected:** Computing actual pixel colors or RGB values - requires headless browser rendering and is brittle to theme changes
- **Trade-offs:** Tightly couples tests to Tailwind framework vs being agnostic to CSS implementation
- **Breaking if changed:** If Tailwind class names change or CSS-in-JS replaces Tailwind, tests break immediately

#### [Gotcha] E2E test verification relies on Tailwind class names rather than computed styles, creating brittle coupling to CSS framework (2026-03-13)
- **Situation:** Test checks for 'bg-red-500' class presence rather than verifying actual rendered color (e.g., rgb(239, 68, 68))
- **Root cause:** Simpler to implement - just check class attribute vs. computing styles, less flaky than color value matching with browser rendering differences
- **How to avoid:** Test passes if class is present but CSS is broken/overridden; test fails if designer switches to CSS modules or different CSS solution even if visual output identical

#### [Gotcha] Test file was checking for 'bg-red-500' but component had 'bg-yellow-500', indicating test-code mismatch that would have caught this color change verification (2026-03-14)
- **Situation:** Test specification didn't match implementation, suggesting either test was outdated or implementation diverged from requirements
- **Root cause:** Discovered during update that the original test expected red but code was yellow - this mismatch means the test suite was already broken and wouldn't have caught the color change properly
- **How to avoid:** Found and fixed test during implementation, but this reveals the test suite wasn't being actively maintained. Test-driven updates are safer than code-first changes

#### [Gotcha] Test files must be updated alongside component changes - class-based assertions (toContain('bg-cyan-500')) become brittle when component implementation changes (2026-03-14)
- **Situation:** Test expected cyan class but component was changed to yellow - test would fail if not updated
- **Root cause:** Tests verify implementation details (specific CSS classes) rather than visual outcomes; this creates coupling between tests and styling strategy
- **How to avoid:** Easier: fast, simple assertions; Harder: tests break with refactoring, doesn't verify actual rendered colors

#### [Pattern] Test assertions mirror implementation changes: Updated Playwright test to verify `bg-pink-500` class instead of `bg-yellow-500`, keeping test assertions synchronized with component CSS (2026-03-14)
- **Problem solved:** Color property verification tests need to validate the exact Tailwind classes present in the component
- **Why this works:** Tests act as executable documentation and prevent regressions. If tests still check for yellow after implementation changed to pink, they would pass despite the feature being broken. Class-based assertions are appropriate for Tailwind CSS components.
- **Trade-offs:** Class-based testing tightly couples tests to implementation details (Tailwind class names) but provides deterministic validation; computed style testing would be more flexible but less reliable

### Test verifies presence of CSS class in DOM (bg-yellow-500) rather than computed CSS color property (2026-03-15)
- **Context:** Banner color verification test had to be updated when color changed
- **Why:** CSS class verification is more robust than computed color checks because: (1) it's deterministic regardless of browser rendering differences, (2) it directly verifies the developer's intent, (3) Tailwind classes are the contract in this codebase
- **Rejected:** Testing computed RGB/hex values would require browser rendering and is fragile across different rendering engines
- **Trade-offs:** Class-based testing is simpler to write and maintain but doesn't catch CSS file corruption. It assumes Tailwind is working correctly
- **Breaking if changed:** If testing switches to color property verification, any browser rendering differences or CSS compilation issues would surface as test failures

### Test uses className attribute matching (`expect(className).toContain('bg-pink-500')`) rather than computed style verification (2026-03-15)
- **Context:** Playwright test verifies banner color by checking for presence of Tailwind class in the DOM rather than checking actual computed CSS color value
- **Why:** Class-based assertion is simpler and doesn't require browser's CSS engine to compute final styles; works reliably with Tailwind's utility classes
- **Rejected:** Using `getComputedStyle()` would be more robust but requires browser style computation and is harder to maintain when theme changes
- **Trade-offs:** Class matching is faster and more maintainable but couples tests to implementation details (Tailwind class names); computed styles would be implementation-agnostic but slower
- **Breaking if changed:** If class name is renamed or CSS framework changes, test fails even if visual appearance is correct; class attribute assertion is brittle to refactoring

#### [Gotcha] Test file uses className attribute inspection which is brittle when Tailwind classes change, even though visual appearance may remain similar (2026-03-22)
- **Situation:** Test checks 'expect(className).toContain("bg-yellow-500")' rather than verifying actual computed colors or visual properties
- **Root cause:** Tailwind utility classes are straightforward to query and the test file needed quick updates. Direct class checking is faster than computing styles
- **How to avoid:** Simple string matching is easy to maintain for known Tailwind versions but breaks if Tailwind classes are refactored or custom CSS is introduced. Computed style checking would be more robust but slower