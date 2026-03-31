# Implementation Plan: Feature Dependency Warnings

## Overview

Enhance the existing `FeaturesPage` component with dependency-aware toggle logic, a confirmation dialog, and a pre-save validation guard. All changes are frontend-only in TypeScript/React.

## Tasks

- [x] 1. Add dependency map and utility functions
  - Create `FEATURE_DEPENDENCIES` constant in `apps/frontend/app/dashboard/settings/features/page.tsx` (or a co-located `feature-dependencies.ts` file)
  - Implement `checkDependencies(enabled, feature, nextState)` returning `DependencyCheckResult`
  - Implement `validateFeatureSet(enabled)` returning an error string or `null`
  - Define `DependencyCheckResult` and `PendingToggle` interfaces
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 5.2_

  - [ ]* 1.1 Write property test for `checkDependencies` — violation always triggers warning
    - **Property 1: Dependency violation always triggers a warning**
    - **Validates: Requirements 2.1, 3.1**

  - [ ]* 1.2 Write property test for `checkDependencies` — no-violation toggles produce no warning
    - **Property 5: No-violation toggles produce no warning and no cascade**
    - **Validates: Requirements 2.6, 3.5**

  - [ ]* 1.3 Write property test for `validateFeatureSet` — saved set is always dependency-consistent
    - **Property 6: Saved feature set is always dependency-consistent**
    - **Validates: Requirements 5.2**

  - [ ]* 1.4 Write property test for dependency map driving all warning logic
    - **Property 8: Dependency map drives all warning logic**
    - **Validates: Requirements 1.4**

- [x] 2. Implement `DependencyWarningDialog` component
  - Create `apps/frontend/app/dashboard/settings/features/DependencyWarningDialog.tsx`
  - Wrap shadcn/ui `AlertDialog` with props: `open`, `pending`, `featureMeta`, `onConfirm`, `onCancel`
  - Render plain-language description covering both disable and enable scenarios
  - Include "Apply Changes" confirm button and "Cancel" button
  - _Requirements: 2.2, 2.3, 3.2, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 2.1 Write property test for dialog message containing all relevant feature names
    - **Property 7: Dialog message contains all relevant feature names**
    - **Validates: Requirements 4.1, 4.2**

- [x] 3. Wire dependency logic into `FeaturesPage`
  - Add `pendingToggle` state (`PendingToggle | null`)
  - Replace existing `toggle` function with one that calls `checkDependencies` and either calls `applyToggle` directly or sets `pendingToggle`
  - Add `applyToggle` function that mutates the `enabled` set with cascade changes and sets `dirty`
  - Add confirm handler: call `applyToggle` with pending data, clear `pendingToggle`
  - Add cancel handler: clear `pendingToggle` only
  - Render `<DependencyWarningDialog>` in the JSX, bound to `pendingToggle`
  - _Requirements: 2.1, 2.4, 2.5, 2.6, 3.1, 3.3, 3.4, 3.5_

  - [ ]* 3.1 Write property test for confirm-disable cascading to all dependents
    - **Property 2: Confirming a disable cascades to all dependents**
    - **Validates: Requirements 2.2, 2.4**

  - [ ]* 3.2 Write property test for confirm-enable cascading to all required features
    - **Property 3: Confirming an enable cascades to all required features**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 3.3 Write property test for cancel leaving state unchanged
    - **Property 4: Cancel always leaves state unchanged**
    - **Validates: Requirements 2.5, 3.4, 4.4**

- [x] 4. Add pre-save validation guard to `save` function
  - Call `validateFeatureSet(enabled)` before `updateFeatures.mutate`
  - If validation returns an error string, call `toast.error(message)` and return early
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use **fast-check** (already available or add as dev dependency)
- All logic is frontend-only; no backend changes required
- The `FEATURE_DEPENDENCIES` map is the single source of truth — adding a new entry automatically enforces it
