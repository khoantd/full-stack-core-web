---
tags: [ui]
summary: ui implementation decisions and patterns
relevantTo: [ui]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# ui

#### [Gotcha] Button outline variant with white border on light background creates invisible text when using text-white class (2026-02-23)
- **Situation:** The 'About Us' button used variant='outline' with border-white/30 and text-white, resulting in white text on white/light background making it invisible
- **Root cause:** The outline variant likely renders with a light/white background by default, and the white text color class doesn't account for this background. The developer assumed text-white would work but didn't test contrast on the actual rendered background.
- **How to avoid:** Changing to text-black improves visibility but changes the original design intent (white text suggests dark background expectation). May need to reconsider the entire button styling strategy - either use text-white on dark backgrounds or text-black/dark on light backgrounds consistently.

#### [Pattern] Using Tailwind utility classes (text-white, text-black) on component buttons without considering the component's variant-specific default backgrounds (2026-02-23)
- **Problem solved:** The Button component has variants (outline, solid, etc.) that likely have different default background colors, but the className prop is applied uniformly without variant awareness
- **Why this works:** Tailwind allows arbitrary class composition, but this creates a maintenance burden where developers must know all variant backgrounds to apply correct text colors
- **Trade-offs:** Current approach is flexible (can override anything) but error-prone. Component-level defaults would be safer but less flexible for one-off customizations.

#### [Gotcha] CSS class specificity conflict: `text-black` was being overridden by button variant styles, requiring `!text-black` (important modifier) to force the intended text color (2026-02-23)
- **Situation:** Button with `variant="outline"` had explicit `text-black` class applied but text was still rendering white/invisible on white background
- **Root cause:** Tailwind CSS variant styles (outline) were applying higher specificity rules to text color that overrode the base `text-black` class. The `!` important modifier was needed to break the specificity chain
- **How to avoid:** Using `!important` is generally discouraged in CSS but was necessary here to prevent component-level defaults from interfering with page-specific styling needs. This indicates a potential design issue in the button component's variant specificity

#### [Pattern] Applied state-specific styling (`hover:!text-black`) to maintain text visibility across interactive states (2026-02-23)
- **Problem solved:** Button needed consistent text color not just in default state but also on hover to prevent disappearing text during user interaction
- **Why this works:** Interactive components must maintain readability through all visual states. Hovering triggers style changes that could override the base text color again if not explicitly handled
- **Trade-offs:** Explicit state handling in component className is verbose but guarantees consistent behavior. Alternative would be fixing this at the button component level for all usages

#### [Gotcha] CSS class inheritance conflicts when using Tailwind utility classes with component variants. The `!text-black` utility with important modifier failed to override inherited `text-white` from parent container due to specificity and CSS cascade timing in component composition. (2026-02-23)
- **Situation:** Button component with outline variant inheriting white text color from parent Hero Section that applies `text-white` class, making button text invisible on white background despite explicit `!text-black` class in className prop.
- **Root cause:** The outline variant's base styles did not explicitly define text color, allowing parent container styles to cascade down. Important modifier alone was insufficient because the button component's internal structure or style application order prevented proper override.
- **How to avoid:** Explicit color application on button (`bg-white text-black`) is less maintainable than variant-based approach but guarantees visibility. Increases button-specific styling coupling but eliminates cascade-related bugs.

### Changed from semantic approach (`hover:bg-white/10` with low opacity) to explicit high-contrast approach (`hover:bg-white/90` with high opacity) for outline button hover state. (2026-02-23)
- **Context:** Original hover state used subtle semi-transparent white (`/10` opacity) which would be nearly invisible. Fix required hover state to maintain readability and clear interaction feedback.
- **Why:** Low opacity hover state contradicts accessibility requirements - users need clear visual feedback that button is interactive. High opacity ensures sufficient contrast ratio between hover and normal states.
- **Rejected:** Keeping original `hover:bg-white/10` which provides minimal visual feedback; using grayscale hover effect which doesn't align with white button background.
- **Trade-offs:** More aggressive hover styling is more obvious but potentially less subtle/elegant; however gains in usability and accessibility justify the trade-off. Requires component to stand out more visually.
- **Breaking if changed:** If hover opacity reverted to `/10`, users may not recognize button as interactive element, reducing discoverability and usability metrics.

#### [Gotcha] CSS Tailwind class specificity conflicts when component variants apply conflicting text color utilities that override inline className declarations (2026-02-23)
- **Situation:** Button with variant='outline' had text-black in className but appeared white due to variant styles taking precedence. Issue masked by parent container's text-white class.
- **Root cause:** Component variants in shadcn/ui button apply base styles that can have equal or higher specificity than className props, causing silent overrides without explicit !important
- **How to avoid:** Using !important modifier (!) in Tailwind breaks the cascade principle but guarantees visibility. Alternative would be creating a new button variant, which adds maintenance burden.

#### [Pattern] Using Tailwind's !important modifier (!text-black) as a targeted override for component variant conflicts rather than modifying the component definition (2026-02-23)
- **Problem solved:** Rather than editing the button.tsx component variant to hardcode text-black, the fix was applied at the HeroSection usage level
- **Why this works:** Preserves component reusability - button variant='outline' remains generic. The specific text color need is contextual to HeroSection's white background design.
- **Trade-offs:** Local ! usage is more readable at call site but violates Tailwind best practices. Keeping variants generic costs slightly more complexity when specificity conflicts occur.

#### [Pattern] Used Grep to search content first, then Glob for file discovery, then Read + Edit for precise modification (2026-03-04)
- **Problem solved:** Finding and modifying a specific text string in a frontend component
- **Why this works:** Methodical approach: search → locate → read → verify → edit → verify again reduces risk of modifying wrong content
- **Trade-offs:** Multiple tool calls add latency but provide confidence and auditability; single-step approach would be faster but riskier

#### [Gotcha] Text split across JSX elements with className styling creates inconsistent branding across components (2026-03-04)
- **Situation:** Logo text 'Car' is wrapped in <span className="text-primary"> while 'Parts' is plain text, then same text appears elsewhere (footer, page title) without this styling inconsistency
- **Root cause:** The partial styling of 'Car' in primary color suggests intentional design, but creates maintenance burden when same text needs updating in multiple files with different formatting
- **How to avoid:** Styling flexibility gained (only 'Car' in primary color) vs maintainability cost (text updates must be made in 3+ places with different formats)

#### [Pattern] Inconsistent branding string across multiple components - 'Car Parts' vs 'Car Partss' appears in multiple locations (navigation, footer, page title) but selective updates suggest intentional variation (2026-03-04)
- **Problem solved:** Investigation found the string scattered across LandingNav.tsx, LandingFooter.tsx, and page.tsx with only header updated to 'Partss'
- **Why this works:** The selective update pattern (header only) suggests this may be a deliberate branding choice limited to primary navigation rather than a global find-replace operation
- **Trade-offs:** Maintaining consistency requires manual verification across multiple locations, but allows targeted updates where needed without affecting other branding touchpoints

#### [Pattern] Banner text placed in JSX component as simple string literal rather than externalized to configuration or i18n system (2026-03-04)
- **Problem solved:** Found 'Quality Parts' text hardcoded directly in HeroSection.tsx component
- **Why this works:** For static, single-language UI text in marketing sections, inline strings reduce indirection and are simpler than i18n or config systems
- **Trade-offs:** Simpler code structure but creates tight coupling between UI component and text content. Future changes require code modification

### Changed only the visible text 'Explore Products' to 'Products' while preserving the href='/#products' link target (2026-03-04)
- **Context:** Button text was being shortened on the hero banner landing page
- **Why:** Decoupling display text from navigation semantics. The link target anchor remains consistent, so existing deep links and navigation logic continue working. Only the UX messaging changed
- **Rejected:** Changing href to match shorter text (like '/#prod'), which would break existing bookmarks and shared links
- **Trade-offs:** Shorter text is less descriptive but takes less space. Preserving href maintains backward compatibility at the cost of slight semantic mismatch between text and target
- **Breaking if changed:** If any analytics, tracking, or link validation relies on text matching href, this creates a discrepancy. Any screenshots or documentation using old text will be outdated

#### [Pattern] Text split across multiple JSX elements with className styling applied to only first part (<span className='text-primary'>Car</span> Parts) to achieve selective styling while keeping content in single semantic unit (2026-03-04)
- **Problem solved:** Header brand name 'Car Parts' where only 'Car' should have primary color styling, requiring text to be split across elements
- **Why this works:** React/JSX requires styling to be applied to elements, but only first word needs the color. Splitting the text allows applying className to only the relevant word without losing semantic meaning
- **Trade-offs:** Slightly more verbose but provides explicit control. More readable than CSS-only selectors. Harder to refactor if branding text changes (need to update multiple places)

### Changed text color from white to slate-900 when switching banner background from dark to yellow (2026-03-07)
- **Context:** Banner background changed from dark gradient (slate-900) to bright yellow (yellow-500/yellow-400)
- **Why:** White text on yellow background creates poor contrast and readability. Dark text (slate-900) on bright yellow maintains WCAG contrast requirements and ensures accessibility
- **Rejected:** Keeping white text would result in barely visible content on the bright yellow background
- **Trade-offs:** Bright foreground colors on bright backgrounds reduce visual depth - now relies on structural hierarchy rather than color contrast for emphasis
- **Breaking if changed:** Removing the text color adjustment would make the banner content unreadable with the yellow background

#### [Pattern] Coordinated all related color elements (text, buttons, overlays, icons) when changing background color (2026-03-07)
- **Problem solved:** Single banner background color change required cascading updates to secondary text, buttons, SVG pattern overlays, and icon colors
- **Why this works:** Prevents visual inconsistency where some elements remain styled for the old dark background while the banner is now bright. Maintains cohesive design language
- **Trade-offs:** Requires more edits and coordination, but prevents visual debt and maintains intentional design consistency

### Adjusted SVG pattern overlay fill-opacity from white (fill='%23ffffff') to black (fill='%23000000') with matching opacity (2026-03-07)
- **Context:** Light gray background with repeating SVG pattern - white pattern visible on dark background, but invisible on bright yellow
- **Why:** White pattern with low opacity blends into the bright yellow background. Switching to black maintains the subtle texture pattern visibility and depth on the new background
- **Rejected:** Keeping white fill would make the texture pattern disappear entirely, losing the subtle visual detail that provides visual interest
- **Trade-offs:** Black overlay on yellow is more visible than white on dark - required opacity reduction to maintain subtlety and prevent overwhelming the content
- **Breaking if changed:** Without this adjustment, the banner would lose its texture depth and appear flat, eliminating the visual layering that separated background from content

### Removed interactive Select dropdown from Status column, keeping status as read-only badge display (2026-03-07)
- **Context:** Payment table previously allowed inline status editing via dropdown select component, now status is display-only
- **Why:** Centralizes status editing through dedicated Edit workflow (Action menu → Edit) rather than scattered inline controls. Simplifies table interaction model and reduces cognitive load for users - one edit path instead of two
- **Rejected:** Keeping dual edit paths (inline select + edit modal). Would create inconsistent UX and maintenance burden
- **Trade-offs:** Faster status changes removed (requires full edit modal now), but cleaner UI and consistent state management. More clicks for status-only updates vs inline changes
- **Breaking if changed:** Any code or external integrations expecting onStatusChange callback on PaymentTable will break. Must route through Edit workflow instead

#### [Pattern] Coordinated color system change across multiple text elements and interactive components when updating banner background (2026-03-07)
- **Problem solved:** Changing banner from yellow to red required updates to: main background gradient, text colors, pattern overlay SVG, subtitle text, body text, and button styling
- **Why this works:** Yellow background with slate-900 text has high contrast. Red background requires white/light text for accessibility. SVG pattern fill needed color inversion to remain visible. Button border/hover states must coordinate with new palette to maintain visual hierarchy
- **Trade-offs:** More edit points mean higher maintenance burden if colors change again, but ensures consistent contrast and visual coherence across the component. Required coordinating 5+ style updates instead of 1

### Changed text-slate-900 to text-white instead of using red-900 or other red variants for primary text contrast (2026-03-07)
- **Context:** When switching background from yellow to red, needed to ensure text remains readable
- **Why:** White provides maximum contrast ratio (21:1) against red-600/red-500 gradients, guaranteeing WCAG AAA compliance. Red-900 text on red background would fail contrast requirements entirely. White is safer and more universal
- **Rejected:** Using text-red-100 or text-red-50 for primary heading would reduce contrast and require additional visual testing. Using complementary colors (cyan/blue) would introduce brand inconsistency
- **Trade-offs:** White text is less visually interesting than a coordinated red palette, but prioritizes accessibility and clarity. Simpler to maintain across future iterations
- **Breaking if changed:** If contrast falls below WCAG AA (4.5:1 for normal text), site becomes inaccessible to visually impaired users and may fail compliance audits

#### [Gotcha] SVG pattern fill color must be inverted when background color changes significantly (2026-03-07)
- **Situation:** Yellow background used fill='%23000000' (black) at opacity-50. Red background requires fill='%23ffffff' (white) to remain visible
- **Root cause:** Pattern overlay visibility depends on contrast with background. Black pattern on yellow is visible. Black pattern on red becomes nearly invisible. Inverting fill color maintains consistent texture perception
- **How to avoid:** Requires understanding SVG data URLs and color encoding. Easy to miss during quick refactors. Worth documenting as a 'pattern inversion rule'

#### [Gotcha] Visual discrepancy between design mockup (yellow banner) and implementation (red banner) - multiple worktrees/branches with different color states created confusion during investigation (2026-03-07)
- **Situation:** Feature request showed yellow banner in reference image, but current codebase had red gradient. Multiple file paths and worktree versions existed, making it unclear which was the source of truth.
- **Root cause:** Branch-based development with multiple worktrees can lead to different states. The implementation had already been changed from yellow→red, but the reference image showed the original yellow state.
- **How to avoid:** Image-based requirements vs code reality - worktrees allow isolated work but create version confusion. Having the 'before' image helps confirm the change was intentional.

#### [Pattern] Used Tailwind gradient with three color stops (from-red-600 via-red-500 to-red-600) instead of flat color - creates subtle depth effect (2026-03-07)
- **Problem solved:** Banner background color implementation for hero section
- **Why this works:** Gradient (600→500→600) creates visual interest and depth while maintaining color consistency - the middle 500 creates a slight lightening effect across the width/height
- **Trade-offs:** Slightly more complex (3 color values vs 1) but provides better visual polish. Gradient direction matters for the effect.

### Text hierarchy maintained with two color levels: primary text white (text-white) and secondary text muted red (text-red-100) on red gradient background (2026-03-07)
- **Context:** Ensuring readability and visual hierarchy when banner color changed from yellow to red
- **Why:** White on red-600 provides strong contrast (WCAG compliant). Using text-red-100 for secondary content instead of another gray maintains color theme cohesion while establishing hierarchy through tone variation.
- **Rejected:** Could have used gray colors (text-gray-200) for secondary text, but would break the red color theme. Using white for all text would eliminate hierarchy.
- **Trade-offs:** text-red-100 is less contrasted than gray would be, but maintains design cohesion. Requires verification that contrast ratio still meets accessibility standards.
- **Breaking if changed:** Removing the text-red-100 distinction would flatten the visual hierarchy. Using text-gray/text-slate would create visual discord with the red theme

#### [Gotcha] Visual color mismatch between CSS class names and actual rendering: CSS classes named 'red-*' were rendering as yellow in the UI (2026-03-07)
- **Situation:** Banner styling used Tailwind classes `from-red-600 via-red-500 to-red-600` but appeared yellow in the browser, requiring color change to purple
- **Root cause:** Indicates either incorrect Tailwind color mapping, custom theme configuration, or CSS override elsewhere in the codebase that wasn't immediately visible
- **How to avoid:** Required visual inspection and source code reading to identify the actual color being used; automation/CSS linting wouldn't catch this mismatch

### Systematic replacement of color tokens across all text variations (primary color, subtitles, descriptions, secondary elements) to maintain visual cohesion (2026-03-07)
- **Context:** Changed 4 separate CSS selectors containing color references from red to purple, all on the same component
- **Why:** Ensures design consistency - primary gradient, supporting text, and secondary accents must all harmonize; changing only the background would create visual discord
- **Rejected:** Changing only the main gradient background would result in mismatched accent colors that contradict design intent
- **Trade-offs:** More edits required but prevents design inconsistency; single source of truth approach would be better
- **Breaking if changed:** Missing any color reference creates visual inconsistency; if new accent colors are added to the component later, they must follow the same pattern

#### [Pattern] Color theme migration using systematic find-and-replace across gradient and text color classes (2026-03-07)
- **Problem solved:** Changing hero banner from red to gray theme required updating multiple CSS classes across a single component
- **Why this works:** Tailwind CSS uses consistent naming patterns (red-600, red-500, red-100 → gray-600, gray-500, gray-100) allowing mechanical replacement while maintaining design system coherence
- **Trade-offs:** Quick mechanical replacement is easy for one-off changes but creates maintenance burden if theme system needs flexibility later. No centralized color definition means theme changes require component edits

### Color semantic preservation: text color hierarchy (primary text white, secondary text gray-100) maintained independently from background color migration (2026-03-07)
- **Context:** Some color changes (red-100 → gray-100) affected text elements that denote semantic importance levels, not backgrounds
- **Why:** Text contrast and readability require semantic relationship to background color. Gray-100 on gray-600 maintains sufficient contrast as gray-100 on red-600 did, but the semantic meaning differs - gray on gray is more muted/secondary than red on red
- **Rejected:** Keeping red-100 text (would clash with gray background); using pure white everywhere (would lose semantic hierarchy); using completely different gray values for text
- **Trade-offs:** Consistent mechanical color replacement simplified the change but may have subtly altered the visual hierarchy/emphasis of secondary text elements. Gray-100 on gray background feels more subtle than red-100 on red background
- **Breaking if changed:** If contrast ratios drop below WCAG standards (unlikely with gray-100 on gray-600) or if designers intended different visual emphasis for secondary text, this mapping fails the visual design intent

#### [Pattern] Coordinated color palette updates across multiple text elements when changing banner gradient (2026-03-07)
- **Problem solved:** Banner color changed from gray to ocean blue gradient, requiring supporting text color adjustments
- **Why this works:** Maintaining visual hierarchy and contrast ratios. Gray text (gray-100) on gray gradient is high contrast, but gray text on blue gradient reduces readability. Cyan-100 on cyan/blue gradient maintains intended contrast levels.
- **Trade-offs:** More granular edits required (4 separate changes vs 1) but ensures cohesive design. Risk of missing text elements if not done systematically.

#### [Pattern] Text split across JSX elements using className styling: `<span className="text-primary">Car</span> Partss` separates 'Car' into styled span while 'Partss' remains as text node (2026-03-07)
- **Problem solved:** Header branding in LandingNav.tsx uses partial styling for visual effect (making 'Car' a different color)
- **Why this works:** Allows styling specific portions of text differently (primary color) while keeping code maintainable; spans don't add semantic meaning, just styling
- **Trade-offs:** Makes the typo less obvious visually (people parse 'Car' and 'Parts' separately), but also means the typo is easier to miss during code review

#### [Gotcha] White text on white background (outline button with white border) renders invisible despite being technically present in DOM (2026-03-07)
- **Situation:** Button with `text-white` class on outline variant button appears broken/missing in UI even though code is correct
- **Root cause:** Outline buttons have transparent/light backgrounds. When text color matches button appearance (white), contrast fails completely. This is a contrast issue that only manifests at runtime, not in code review
- **How to avoid:** Text color change is minimal and focused, but reveals that outline button styling might need contrast validation for all text colors used with it

### Used `text-black` instead of `text-gray-900` or other dark variants for contrast fix (2026-03-07)
- **Context:** White text on outline button was invisible; needed dark text that works on white/light backgrounds
- **Why:** Simplest, guaranteed maximum contrast against white/light backgrounds. No semantic meaning needed here - pure contrast requirement
- **Rejected:** Could use `text-gray-900` for softer appearance, but white button demands maximum contrast for accessibility
- **Trade-offs:** `text-black` is harsh but guarantees readability. `text-gray-900` would be gentler but might fail contrast requirements depending on button background actual color value
- **Breaking if changed:** If design system later requires consistent gray text instead of pure black, this specific button becomes inconsistent with pattern

### Color change applied to both background gradient and dependent text colors simultaneously (2026-03-07)
- **Context:** Changing hero banner from cyan-blue gradient to yellow gradient required coordinating multiple color properties across the component
- **Why:** Text color must change in tandem with background to maintain contrast and readability. Cyan-100 text on yellow background would have poor contrast; yellow-100 text maintains proper contrast on yellow background
- **Rejected:** Changing only the background gradient while keeping cyan-100 text would result in unreadable/low-contrast UI
- **Trade-offs:** More edits required (3 separate color changes) but ensures visual coherence and accessibility. Could have been simplified with CSS custom properties or theme tokens
- **Breaking if changed:** If background is reverted but text colors aren't, or vice versa, the UI becomes visually broken with poor contrast ratios

#### [Pattern] Color palette consistency across semantic layers - gradient definition paired with text color updates (2026-03-07)
- **Problem solved:** Changing banner background from yellow/orange gradient to gray required updating not just the background but all dependent text colors to maintain contrast and visual hierarchy
- **Why this works:** Tailwind gradient classes (from-yellow-400 via-yellow-500 to-amber-500) define multiple color stops. When changed to gray, text colors using yellow-100 became invisible. The pattern shows semantic color dependency: background gradient → text color tokens must be updated together as a unit
- **Trade-offs:** Easier: Tailwind's utility classes make color changes explicit and traceable. Harder: No automatic color relationship enforcement - requires developer discipline to update dependent layers

#### [Gotcha] Tailwind gradient classes require specific order (from-X via-Y to-Z) where 'via' must be the middle stop. Using incorrect gradient syntax silently fails without visual indication. (2026-03-07)
- **Situation:** Changed banner from 'from-amber-500 via-yellow-500 to-amber-600' to 'from-gray-500 via-gray-600 to-gray-700'. The gradient naming convention is not self-documenting.
- **Root cause:** Tailwind's gradient implementation expects this specific ordering. Arbitrary ordering or missing 'via' stops will render but not as intended.
- **How to avoid:** Three-stop gradients provide better visual hierarchy but require more specific color palette planning. Single colors are simpler but less sophisticated.

### Text color (white) was intentionally preserved during color change to maintain contrast ratio accessibility (2026-03-07)
- **Context:** Changing background from gray to yellow without adjusting text color could affect WCAG contrast compliance
- **Why:** White text on yellow-600/700 maintains sufficient contrast (gray backgrounds may have different contrast requirements). Changing only background without verifying text contrast would risk accessibility regression
- **Rejected:** Changing text color to match new palette without accessibility verification
- **Trade-offs:** Easier: simpler changeset with fewer edits. Harder: requires accessibility knowledge to verify contrast was maintained during color migration
- **Breaking if changed:** If text color is later changed without contrast verification, section becomes inaccessible to users with low vision or color blindness

#### [Pattern] Component-based color system using Tailwind CSS gradients for hero sections (2026-03-07)
- **Problem solved:** Hero section styling isolated in dedicated HeroSection component with gradient background
- **Why this works:** Centralizing UI styling in dedicated components allows for consistent theme application and easier maintenance of visual hierarchy across the application
- **Trade-offs:** Easier to update brand colors globally (single file change), but requires developers to know component structure. Tailwind CSS constraint means gradients limited to predefined color stops rather than arbitrary values

#### [Gotcha] Changing color gradients in Tailwind requires modifying all three gradient stops (from-, via-, to-) consistently to maintain visual coherence (2026-03-07)
- **Situation:** Changed hero section from cyan-blue gradient (from-cyan-500 via-blue-600 to-blue-700) to green gradient (from-green-500 via-green-600 to-green-700)
- **Root cause:** Using three-stop gradients with varying shades creates depth; changing only one stop creates visual inconsistency and broken contrast
- **How to avoid:** Multi-stop gradients provide richer visuals but require coordinated updates across all stops; single-color backgrounds are simpler to maintain

### Kept text colors (white, gray-200) and SVG overlay patterns unchanged when modifying hero section background gradient (2026-03-07)
- **Context:** Hero section redesign involved color scheme change from blue to green while maintaining accessibility and visual hierarchy
- **Why:** Text contrast ratios against green-700 remain compliant with WCAG standards; white text on green maintains existing readability. SVG patterns with low opacity work across color schemes
- **Rejected:** Re-optimizing text colors and patterns for each color scheme would introduce maintenance burden with diminishing returns on contrast improvements
- **Trade-offs:** Simpler maintenance and fewer files modified vs. potential minor accessibility gains from re-tuning all dependent elements
- **Breaking if changed:** If text colors were removed or SVG patterns deleted, the hero section would lose visual hierarchy and become harder to read

### Used Tailwind CSS gradient classes (from-purple-500 via-purple-600 to-purple-700) for hero section background instead of hardcoded CSS or inline styles (2026-03-07)
- **Context:** Needed to change hero banner color from green to purple on home page
- **Why:** Tailwind CSS provides semantic color naming, responsive utilities, and consistency across the design system. Gradient composition with from/via/to allows smooth color transitions.
- **Rejected:** Direct CSS color values (#hex), CSS-in-JS solutions, or separate CSS modules would require additional setup and lose the utility-first composability
- **Trade-offs:** Tight coupling to Tailwind's color palette (limited to predefined values) vs flexibility of arbitrary colors; requires Tailwind configured in project; className string length increases but bundling handles minification
- **Breaking if changed:** Removing Tailwind CSS would break the entire color system. Changing gradient direction (bg-gradient-to-br) would break the visual design intent.

#### [Pattern] Hero section uses responsive padding classes (pt-24 pb-20 lg:pt-32 lg:pb-28) for vertical spacing instead of fixed pixel values (2026-03-07)
- **Problem solved:** Hero section needs to adapt vertical spacing between mobile and desktop viewports
- **Why this works:** Tailwind's responsive prefixes (lg:) enable mobile-first design that scales gracefully. Relative spacing (24, 28 units) maintains proportions across screen sizes rather than hardcoded breakpoints.
- **Trade-offs:** Responsive classes add className length but provide built-in mobile optimization; requires understanding Tailwind breakpoint system

#### [Pattern] Used Tailwind CSS gradient utility classes (from-pink-500 via-pink-600 to-pink-700) for hero section background instead of custom CSS or CSS-in-JS (2026-03-07)
- **Problem solved:** Need to change hero section color scheme from purple to pink gradient
- **Why this works:** Tailwind gradient utilities provide semantic, maintainable color transitions that leverage the design system token set. The via- modifier creates smooth 3-step gradients without manual color interpolation
- **Trade-offs:** Tailwind approach trades explicit control for consistency and maintenance; changes to design tokens automatically cascade to all gradient uses

#### [Pattern] Using Tailwind gradient color stops (from/via/to) for consistent color transitions instead of hardcoded hex values (2026-03-07)
- **Problem solved:** Hero section uses `bg-gradient-to-br from-red-500 via-red-600 to-red-700` to create direction and intensity progression
- **Why this works:** Semantic color tokens ensure design system consistency, enable global theme changes, and make maintenance declarative. Three-stop gradients provide smoother visual transitions than two-stop
- **Trade-offs:** Tailwind classes are more readable and themeable but less flexible for arbitrary angles/positions; custom CSS offers more control but requires manual color management

### Used Tailwind CSS gradient classes (from-cyan-500 via-blue-500 to-blue-700) instead of custom CSS or hex colors (2026-03-07)
- **Context:** Changing hero section background from gray gradient to sea blue gradient
- **Why:** Tailwind's built-in color palette ensures consistency with design system, maintains responsive behavior, and avoids CSS specificity conflicts. Using gradient-to-br direction preserves the diagonal flow established in original design
- **Rejected:** Custom hex colors (#0891b2 to #1e40af) would require separate CSS file, risking design token divergence from Tailwind theme
- **Trade-offs:** Gained: design consistency, easier maintenance, built-in color scale transitions. Lost: precise color control without theme customization
- **Breaking if changed:** If Tailwind version changes or theme colors are modified, this component automatically inherits new values - could cause unexpected appearance changes

#### [Gotcha] Text color hierarchy needed adjustment from gray-200 to cyan-100 across multiple text elements, not just background (2026-03-07)
- **Situation:** Changing background colors impacts contrast ratios with existing text colors
- **Root cause:** Gray-200 provides insufficient contrast against blue/cyan backgrounds (likely WCAG AA failure). Cyan-100 maintains proper luminance contrast while keeping visual harmony with new color scheme
- **How to avoid:** Gained: proper color theory application, better visual elegance. Lost: maximum contrast ratio - but still meets WCAG AA standards with cyan-100

#### [Gotcha] Color contrast requirements when changing background colors in hero sections (2026-03-07)
- **Situation:** Changed hero section background from gradient (cyan-blue) to black, requiring secondary text color updates from cyan-100 to gray-300
- **Root cause:** Black background requires different text colors to maintain WCAG contrast ratios. Cyan-100 becomes unreadable on black, necessitating gray-300 for sufficient contrast
- **How to avoid:** Gray-300 is less vibrant than cyan-100 but maintains usability; changing to black simplifies design but removes color branding from hero section

#### [Pattern] Preserving SVG pattern overlays when changing background colors (2026-03-07)
- **Problem solved:** White SVG pattern overlay (opacity 0.05) was retained despite changing from gradient to solid black background
- **Why this works:** SVG pattern serves as subtle texture/depth layer independent of background color. With low opacity (0.05), it works across different backgrounds by adding visual complexity without being dominant
- **Trade-offs:** Single overlay pattern works universally but may need opacity adjustments for different backgrounds; lower opacity required for black vs gradient

#### [Gotcha] SVG pattern overlays with opacity can create visual complexity that obscures intent. The original HeroSection used a data-URI SVG pattern with 5% fill-opacity nested inside a 50% opacity container, creating a compounded opacity effect (0.05 * 0.50 = 0.025 effective opacity). (2026-03-07)
- **Situation:** Hero banner background appeared to have visual decoration but the opacity layering made the actual visual contribution minimal and confusing to maintain.
- **Root cause:** Removing the pattern overlay simplifies the DOM structure and eliminates unnecessary data-URIs. This reduces cognitive load for future maintainers who need to understand the component's appearance.
- **How to avoid:** Lost potential subtle texture/depth effect in exchange for clarity and performance (one less SVG render). Component now matches modern minimalist design trends over decorated backgrounds.

### Preserved all non-background styling (padding, text color, overflow handling) while only modifying the background treatment. Changed from dynamic background declaration to explicit `bg-black` on container and simple `absolute inset-0 bg-black` for the overlay div. (2026-03-07)
- **Context:** Needed to change visual appearance of hero without breaking layout or affecting text content.
- **Why:** Minimal change surface area reduces risk of unintended side effects. By keeping margin/padding/typography intact, the component continues to function identically except for background appearance.
- **Rejected:** Could have completely rewritten the section styling or introduced new classes, but that introduces risk of breaking responsive behavior or spacing.
- **Trade-offs:** Conservative change is safer but less flexible if future requirements need other styling adjustments. Would require another edit cycle.
- **Breaking if changed:** If future code relies on the SVG pattern existing (e.g., CSS selectors looking for specific opacity values, or animations targeting the pattern div), those would break. Unlikely since pattern was decorative, but worth documenting in commit message.

#### [Gotcha] Changing background color from red to yellow required simultaneous text color adjustments (white→gray-900, gray-300→gray-700) to maintain readability (2026-03-07)
- **Situation:** Yellow background has different contrast properties than red; white text on yellow becomes illegible
- **Root cause:** Luminance values differ significantly: red-600 is darker (~30% brightness) vs yellow-500 is lighter (~90% brightness), requiring inverted text color strategy
- **How to avoid:** Gained readability and accessibility but lost the original 'light text on dark background' pattern consistency across the site

### Used red-600 instead of red-500 for hero section background color (2026-03-08)
- **Context:** Color scheme migration from yellow-500 to red for landing page hero banner
- **Why:** red-600 provides better visual weight and professional appearance for a primary brand color, especially for e-commerce automotive parts site where authority and trust matter
- **Rejected:** red-500 (lighter variant) would appear less authoritative; red-700 (darker) would reduce readability of white text
- **Trade-offs:** red-600 is slightly darker reducing brightness but improving perceived quality and contrast with white text elements. Trade-off between vibrance and professionalism favored the latter.
- **Breaking if changed:** Changing to lighter reds (red-400/red-500) would require re-evaluating text contrast ratios for WCAG accessibility compliance; darker reds (red-700+) would reduce button visibility

#### [Pattern] Coordinated color palette across text hierarchy: main text (white), secondary text (red-100), tertiary elements (white/red combos on buttons) (2026-03-08)
- **Problem solved:** Maintaining visual hierarchy and readability when changing from yellow (high contrast dark text) to red background
- **Why this works:** Prevents color chaos - by using red-100 for secondary text instead of random grays, maintains cohesive red family palette while ensuring 4.5:1+ contrast ratio for accessibility. Buttons use opposite poles (white bg/red text vs red bg/white text) for clear CTA distinction.
- **Trade-offs:** Red-100 is less familiar as secondary text color but provides better thematic consistency; requires slightly more careful attention to contrast ratios compared to neutral grays

#### [Gotcha] Button styling requires inverse logic when background color changes: primary CTA button inverted to white background with red text instead of matching red background with white text (2026-03-08)
- **Situation:** Converting yellow hero section (naturally bright, needed dark text) to red (naturally dark, works with light text), requiring opposite button treatment
- **Root cause:** The primary CTA button (Products) needs maximum visual distinction from the background. On yellow, dark button text worked. On red, white background button with red text creates stronger contrast and draws eye better than red button with white text, which blends with surrounding text.
- **How to avoid:** Inverted button styling is less conventional (white-on-red) but more effective for CTA emphasis; requires developers to understand context-specific button logic rather than applying one consistent style

#### [Pattern] Tailwind CSS utility classes used for direct styling instead of CSS modules or inline styles (2026-03-08)
- **Problem solved:** Button component styling in HeroSection using className with Tailwind utilities like 'text-white', 'border-white/30', 'hover:bg-white/10'
- **Why this works:** Tailwind enables rapid prototyping and maintains consistency through predefined color palette (red-600 = #dc2626). Opacity modifiers (white/30) provide fine-grained control without custom CSS
- **Trade-offs:** Easier to modify and audit styling changes (single className string), but className strings become long and harder to read; no type safety for class names

#### [Gotcha] Color contrast and hover states require simultaneous consideration - changing text color from white to red-600 on transparent/outlined button may impact readability (2026-03-08)
- **Situation:** Button has border-white/30 and hover:bg-white/10 defined. Changing text from white to red-600 changes the contrast relationship with these backgrounds
- **Root cause:** When text color changes on buttons with semi-transparent backgrounds and hover effects, the visual hierarchy and accessibility implications shift
- **How to avoid:** Full change maintains visual cohesion but requires understanding the complete style chain; partial change creates visual inconsistency

#### [Gotcha] Color contrast degradation when changing from red to yellow on white text backgrounds (2026-03-08)
- **Situation:** Changed hero section from red theme to yellow theme, but white text on yellow-500 creates poor contrast ratio
- **Root cause:** Yellow-500 is much lighter than red-600, causing white text to become nearly illegible. The original design assumed darker background colors.
- **How to avoid:** Had to use yellow-900 for text contrast instead of maintaining white, which changes the visual hierarchy and requires different text colors for different sections

#### [Pattern] Component-scoped color theming without centralized design tokens (2026-03-08)
- **Problem solved:** HeroSection component has hardcoded Tailwind color classes scattered throughout (bg-yellow-500, text-yellow-900, border-yellow-900/30, etc.)
- **Why this works:** Quick inline editing allows rapid iteration, but creates tight coupling between component logic and styling
- **Trade-offs:** Faster to implement now, but changing brand colors later requires finding and updating multiple scattered class references. Easier to miss edge cases like hover states, borders, and text variants.

#### [Gotcha] Inconsistent text color application across semantic variations (2026-03-08)
- **Situation:** Primary text uses yellow-900, secondary text uses yellow-900, button text uses yellow-600, but hover/outline states have mixed color strategies
- **Root cause:** Color replacement was done mechanically (red→yellow) without re-evaluating semantic color hierarchy for the new base color
- **How to avoid:** Simpler regex-style replacement completed faster, but results in unclear color intention and harder to maintain. Future designers won't know if yellow-900 vs yellow-600 distinction is intentional.

#### [Pattern] Systematic color palette replacement across all related UI elements (background, text, buttons, borders) when updating theme colors (2026-03-08)
- **Problem solved:** Changing hero section from yellow to cyan required updating not just the main background but also text colors, button hover states, and border colors to maintain visual consistency and contrast ratios
- **Why this works:** Partial color updates would break contrast accessibility and visual coherence. All interdependent color values must change together to maintain the design system's integrity
- **Trade-offs:** Requires more edits per color change but ensures accessibility standards (WCAG contrast) and design consistency are maintained throughout

### Color scheme changed from cyan to red across entire hero section component and tests (2026-03-08)
- **Context:** Banner color update required consistent color application across multiple UI elements and test assertions
- **Why:** Maintaining visual consistency requires updating background, text, button states, and borders simultaneously to avoid color mismatches that degrade UX
- **Rejected:** Partial updates (e.g., only background) would create visual inconsistency between banner and interactive elements
- **Trade-offs:** More files to update (component + test) but ensures coherent visual design; single-color changes are easier to implement but risk inconsistent appearance
- **Breaking if changed:** If color values don't match between section background (bg-red-500) and text foreground (text-red-900), contrast fails accessibility standards; tests fail if color classes don't match implementation

#### [Pattern] Color scheme change requires synchronized updates across component (background, text, buttons, borders) - no centralized color token (2026-03-08)
- **Problem solved:** Updating HeroSection from red to green required 6+ separate edits across multiple CSS classes
- **Why this works:** Direct Tailwind class usage provides runtime flexibility but creates refactoring burden
- **Trade-offs:** Easier initial development (no abstraction layer) but harder maintenance; all color changes require multiple edits

### Used Tailwind CSS color system (cyan-500, cyan-900, cyan-600, cyan-50) for cohesive theme changes across all UI elements (2026-03-10)
- **Context:** Changing hero section theme from green to cyan required updating multiple color references across components, buttons, text, borders, and hover states
- **Why:** Tailwind's semantic color scale ensures visual consistency. Using the same color family (cyan-X00) maintains proper contrast ratios and visual hierarchy automatically. Single color family change cascades across all shades.
- **Rejected:** Using arbitrary hex colors or CSS variables would require manual contrast validation and multiple updates if brand color changes again
- **Trade-offs:** Tailwind constraints mean limited customization, but gain atomic predictability and automatic responsive-safe color variations
- **Breaking if changed:** If cyan color scale is removed from Tailwind config, all styling breaks. Changing from semantic to arbitrary colors loses auto-generated shade system.

#### [Pattern] Applied color changes systematically across semantic layers: background (bg-), text (text-), borders (border-), and interaction states (hover:) (2026-03-10)
- **Problem solved:** Single feature change (hero color) touched 6+ different Tailwind utilities across primary button, secondary button, background, text, and hover states
- **Why this works:** Component design separates concerns into base, text, interactive, and state layers. Updating all layers together prevents visual inconsistency where interactive states don't match base colors.
- **Trade-offs:** More changes to coordinate (higher complexity), but ensures professional, polished appearance. Fewer changes = risk of incomplete theming.

### Used Tailwind CSS color system (yellow-500, yellow-900) instead of hex values for theming hero section (2026-03-10)
- **Context:** Changing hero banner color from cyan to yellow across multiple CSS classes and text elements
- **Why:** Tailwind's semantic color naming enables consistent theming, easier maintenance, and automatic contrast pairing (yellow-500 for background, yellow-900 for text ensures readability)
- **Rejected:** Direct hex color values (#eab308, #713f12) - would require manual updates across multiple properties and lose semantic meaning
- **Trade-offs:** Easier to change theme globally later vs. less granular control over exact color values; more constrained to predefined palette
- **Breaking if changed:** Changing from yellow back to another color requires updates across: background (bg-*), text (text-*), hover states (hover:bg-*), borders (border-*/30), and button text colors

#### [Gotcha] Text color contrast must be maintained when changing background colors - yellow-900 chosen for text specifically to work with yellow-500 background (2026-03-10)
- **Situation:** Simply changing all instances of cyan-* to yellow-* could result in low contrast if not carefully paired
- **Root cause:** WCAG accessibility requires sufficient contrast ratio; cyan-900 on cyan-500 works, but yellow requires yellow-900 (darker shade) on yellow-500 to maintain readability
- **How to avoid:** Requires understanding of color shade hierarchy vs. simple find-replace; safer approach prevents accessibility violations

### Color palette consistency required updates across multiple interconnected UI elements when changing hero section background color (2026-03-11)
- **Context:** Changing hero section from yellow to red necessitated coordinated updates to text colors, button styles, and hover states to maintain visual hierarchy and contrast
- **Why:** A single color change in a prominent component cascades through dependent UI elements. Text colors must maintain WCAG contrast ratios against the new background, and interactive elements (buttons) need coordinated styling to preserve intended visual feedback
- **Rejected:** Direct color replacement without considering contrast ratios would result in unreadable text or loss of visual hierarchy
- **Trade-offs:** More comprehensive changes required upfront (7 edit operations) but ensures consistent UX; alternatively, could have used CSS variables to centralize color definitions for future maintainability
- **Breaking if changed:** Partial color updates would result in broken contrast ratios (e.g., yellow text on red background), making content inaccessible and visually incoherent

#### [Gotcha] Text color adjustments on colored backgrounds require different strategies: primary text uses opposite end of spectrum (white) while secondary/accent text uses lighter tones (e.g., red-100 instead of red-900) (2026-03-11)
- **Situation:** Initial color changes attempted to map yellow-900 directly to red-900, which would have poor contrast on red-500 background
- **Root cause:** Yellow and red have different luminance characteristics in Tailwind's color scale. Red-900 is too dark against red-500, requiring white or red-100 depending on semantic importance of the text
- **How to avoid:** More complex color decisions upfront ensure accessibility, but requires understanding color theory and Tailwind's luminance scale

#### [Pattern] Button styling on colored backgrounds uses inverted contrast strategy: white button with colored text on colored background, with matching colored hover states (2026-03-11)
- **Problem solved:** Primary CTA button needed to stand out on red hero background while maintaining visual hierarchy and interaction feedback
- **Why this works:** White-on-red provides maximum contrast for readability while red text (matching background) on white hover state creates visual continuity. This pattern preserves accessibility while maintaining design coherence
- **Trade-offs:** Requires coordinating button color with background color for optimal UX; if background changes, button strategy may need revision. Benefits: clear CTAs, good accessibility, coherent design

#### [Gotcha] Component discovery required multi-step exploration across file patterns (hero*, banner*, home*, index*) before finding the target. Direct search for 'About Us' text was necessary to pinpoint the exact location. (2026-03-11)
- **Situation:** Locating a specific UI element (hero banner button with 'About Us' text) in a large monorepo without knowing exact file structure
- **Root cause:** Naming conventions in the codebase weren't immediately obvious - the HeroSection component was found in /components/landing/ directory, not directly under common patterns
- **How to avoid:** More tool calls needed upfront but discovered correct component structure and naming conventions for future reference

### Used Tailwind CSS utility class `text-red-500` for text color styling instead of inline CSS or CSS modules (2026-03-11)
- **Context:** Styling the 'About Us' button text to display in red color
- **Why:** The existing codebase uses Tailwind CSS (evident from className with border-white/30, text-white patterns), so maintaining consistency with existing style patterns
- **Rejected:** Creating new CSS class or using styled-components would introduce style system inconsistency; inline styles would bypass design system
- **Trade-offs:** Easier maintenance and consistency with existing codebase, but creates dependency on Tailwind color scale; requires knowledge of Tailwind utility naming to modify later
- **Breaking if changed:** If Tailwind CSS is removed or configuration changes, this styling breaks; color changes require understanding Tailwind's color scale (text-red-500 vs text-red-600)

#### [Pattern] Color system migration using semantic Tailwind classes across component hierarchy (2026-03-12)
- **Problem solved:** Changed hero section from red to orange color scheme by replacing all Tailwind color classes
- **Why this works:** Tailwind CSS provides built-in color scales (red-*, orange-*) that maintain consistent design tokens across component variants. Using semantic class names allows batch replacement and ensures design coherence across all color intensities (100, 500, 600, 50).
- **Trade-offs:** Mass find-replace is simple but couples component styling to framework class names; refactoring to CSS modules or styled-components would decouple but add complexity

### Used Tailwind's blue-600 (#2563eb) as 'ocean blue' rather than creating custom color (2026-03-12)
- **Context:** Feature required changing hero banner color to 'màu xanh biển' (ocean blue)
- **Why:** Tailwind's predefined color palette provides consistency and avoids custom color management. blue-600 is dark enough to provide sufficient contrast with white text while being recognizable as ocean blue
- **Rejected:** Could have added custom color to tailwind.config.ts (e.g., 'oceanBlue': '#0066cc') or used arbitrary Tailwind values like bg-[#0066cc]
- **Trade-offs:** Predefined colors reduce configuration overhead but lose semantic naming specificity; custom colors would be self-documenting but require config maintenance
- **Breaking if changed:** If design system later requires a different shade of 'ocean blue', all color references would need updating rather than a single config change

#### [Gotcha] Secondary button text color changed from orange-500 to white instead of blue-500 (2026-03-12)
- **Situation:** When updating button styles, the secondary 'About Us' button's text color strategy differed from primary button
- **Root cause:** Secondary button uses outline variant with transparent background, so text needs sufficient contrast against white overlay on blue background. blue-500 text on blue-600 background would have poor contrast; white text maintains visibility
- **How to avoid:** White text on blue is more accessible but less visually distinctive than colored text; reduces visual hierarchy slightly

### Changed hero section background from blue-600 to yellow-500 with coordinated text color shifts (white→gray-900, blue-100→yellow-900/yellow-800) (2026-03-12)
- **Context:** Color scheme update requiring comprehensive contrast and accessibility adjustments across component
- **Why:** Yellow-500 requires dark text for readability. Light text on bright yellow backgrounds fails WCAG contrast ratios. Using gray-900 and yellow-900 ensures AA compliance while maintaining visual hierarchy
- **Rejected:** Keeping white text on yellow-500 (fails WCAG AA contrast ratio of 4.5:1); using yellow-600 or yellow-400 without text adjustment
- **Trade-offs:** More text color changes required than typical color swap (3 different text colors now instead of 1). Increased complexity but mandatory for accessibility
- **Breaking if changed:** Keeping original white text on yellow background will fail accessibility audits and reduce readability. Tests will fail if not updated to verify new color classes

#### [Gotcha] Button styling required inverted color scheme: background changed to gray-900 with yellow-500 text (inverse of section colors) to maintain contrast (2026-03-12)
- **Situation:** Buttons sitting on yellow-500 background needed sufficient contrast for interaction targets
- **Root cause:** Buttons on same-color backgrounds (yellow button on yellow background) have zero contrast. Using inverse colors (dark background, bright text) creates visual distinction and meets accessibility minimums
- **How to avoid:** Buttons now visually distinct from background (good for UX) but create higher visual weight requiring careful layout consideration

### Updated outline button hover state from 'hover:bg-white/10' to 'hover:bg-yellow-400' for secondary call-to-action (2026-03-12)
- **Context:** Outline button needed hover feedback that works on yellow background context
- **Why:** White hover overlay (10% opacity) becomes barely visible on yellow-500. Using yellow-400 creates sufficient lightness shift to indicate interactivity while remaining in color family
- **Rejected:** Keeping white overlay hover (poor visibility on yellow); using gray overlay (breaks color consistency)
- **Trade-offs:** Hover state is now more visible but uses adjacent Tailwind color which requires harder cognitive mapping than simple opacity shift
- **Breaking if changed:** If hover state removed or reverted, button loses affordance for interactivity. Users may not recognize it as clickable on yellow backgrounds

#### [Pattern] Color system coordination across component, test, and documentation layers (2026-03-13)
- **Problem solved:** Changing hero section color from yellow to pink required synchronized updates across: component classes, test assertions, and inline comments
- **Why this works:** UI color changes must maintain consistency across presentation, verification, and maintainability layers. Misalignment causes test failures and confusion
- **Trade-offs:** More changes to coordinate (easier to break) vs better maintainability and test reliability

#### [Pattern] Color theming implemented via Tailwind CSS utility classes rather than CSS variables or theme configuration (2026-03-13)
- **Problem solved:** Changing hero section from pink to red required updating 5 separate Tailwind classes across multiple elements (bg-pink-500, text-pink-900, text-pink-800, text-pink-500, hover:bg-pink-400)
- **Why this works:** Direct class substitution provides immediate visual feedback and is simple for one-off changes, but the approach scales poorly when theme colors need to change across entire application
- **Trade-offs:** Easy to implement one change, hard to maintain consistency across codebase. Changes require multiple file updates. If a new red shade is needed later, scattered references break DRY principle

### Color scheme migration from red to yellow in HeroSection component using Tailwind CSS utility classes (2026-03-14)
- **Context:** Updating hero banner appearance required systematic color replacement across multiple Tailwind classes (bg-*, text-*, hover:*)
- **Why:** Tailwind's utility-first approach enables consistent color updates by replacing class names rather than modifying CSS values. Using semantic color tokens (red-500, yellow-500) maintains design system consistency and scales to multiple shade variations (400, 500, 800, 900)
- **Rejected:** Direct CSS modification or inline styles would require duplicating color logic across multiple elements and lose the design system relationship
- **Trade-offs:** Utility class approach requires updating multiple class strings but guarantees consistency across all color applications and hover states. Alternative of CSS variables would centralize change but add runtime overhead.
- **Breaking if changed:** If Tailwind color palette is replaced without remapping classes, the entire color scheme breaks across the component. Direct CSS overrides via specificity would silently override intended colors.

### Preserved contrast ratios by keeping text colors (gray-900) consistent with new background while updating accent colors (red→yellow) (2026-03-14)
- **Context:** Yellow background has different luminosity than red, potentially affecting text readability if not carefully managed
- **Why:** Tailwind's color scale (900 shade) maintains sufficient contrast against both red-500 and yellow-500 backgrounds. Updating only accent colors (text-*-500, text-*-800, text-*-900) tied to background ensures proportional contrast. Primary text (gray-900) works on both backgrounds.
- **Rejected:** Could have changed all colors including gray-900 to different shades, but this would require contrast testing and compound changes
- **Trade-offs:** Limiting scope to red→yellow replacements reduces risk but requires validating yellow shade maintains acceptable contrast (yellow is lower luminosity than red)
- **Breaking if changed:** If background shade changes (yellow-400 vs yellow-600), text contrast assumptions may fail and require re-evaluation

### Changed hero section background from yellow-500 to cyan-500 with corresponding text color from gray-900 to white (2026-03-14)
- **Context:** Banner color redesign required updating not just the primary background color but also all dependent text colors and button states to maintain contrast ratios
- **Why:** Yellow backgrounds with gray/dark text had sufficient contrast, but cyan backgrounds required white text for WCAG compliance. This cascading change prevented partial updates that would have left inaccessible color combinations
- **Rejected:** Could have kept yellow text on cyan (poor contrast) or dark gray text on cyan (insufficient contrast). Could have applied changes only to main background without updating overlay, buttons, and text colors (visual inconsistency)
- **Trade-offs:** Changing to white text increases contrast (accessibility gain) but removes the warm yellow aesthetic. Button styling becomes inverted (white primary button instead of dark) which may feel less prominent
- **Breaking if changed:** If only background color is changed without text color updates, page becomes inaccessible with contrast ratio failures. Button hover states and secondary button styling depend on coordinated color strategy

#### [Pattern] Applied systematic color replacement across button states (primary: bg-white text-cyan-600, hover states: cyan-400/cyan-50) rather than ad-hoc color updates (2026-03-14)
- **Problem solved:** Multiple UI elements depend on primary brand color - buttons, text, overlays, hover states. A single color value change shouldn't require individual component updates
- **Why this works:** Centralizing color strategy through Tailwind classes ensures consistency and makes future color changes maintainable. Button states (normal/hover) must coordinate with background to maintain accessibility
- **Trade-offs:** Using Tailwind utilities requires knowing the color palette and how contrasts work, but eliminates hardcoded color values. More upfront thinking, less technical debt