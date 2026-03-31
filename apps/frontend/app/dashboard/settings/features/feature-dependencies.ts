import { type FeatureKey } from "@/types/tenant.type";

// Maps each feature to the features it REQUIRES (its dependencies)
export const FEATURE_DEPENDENCIES: Partial<Record<FeatureKey, FeatureKey[]>> = {
  payments: ["events"],
  products: ["categories"],
};

export interface DependencyCheckResult {
  requiresWarning: boolean;
  /** Features that will be automatically disabled alongside the toggled feature */
  willAlsoDisable: FeatureKey[];
  /** Features that will be automatically enabled alongside the toggled feature */
  willAlsoEnable: FeatureKey[];
}

export interface PendingToggle {
  feature: FeatureKey;
  nextState: boolean;
  willAlsoDisable: FeatureKey[];
  willAlsoEnable: FeatureKey[];
}

/**
 * Checks whether toggling `feature` to `nextState` would violate any declared
 * dependency and computes the cascade side-effects.
 */
export function checkDependencies(
  enabled: Set<FeatureKey>,
  feature: FeatureKey,
  nextState: boolean
): DependencyCheckResult {
  if (nextState) {
    // Enabling: find required features of `feature` that are not yet enabled
    const required = FEATURE_DEPENDENCIES[feature] ?? [];
    const willAlsoEnable = required.filter((req) => !enabled.has(req));
    return {
      requiresWarning: willAlsoEnable.length > 0,
      willAlsoDisable: [],
      willAlsoEnable,
    };
  } else {
    // Disabling: find all currently-enabled features that list `feature` as a dependency
    const willAlsoDisable = (Object.entries(FEATURE_DEPENDENCIES) as [FeatureKey, FeatureKey[]][])
      .filter(([dependent, deps]) => enabled.has(dependent) && deps.includes(feature))
      .map(([dependent]) => dependent);
    return {
      requiresWarning: willAlsoDisable.length > 0,
      willAlsoDisable,
      willAlsoEnable: [],
    };
  }
}

/**
 * Validates that the given enabled set has no broken dependencies.
 * Returns an error string if invalid, or `null` if the set is consistent.
 *
 * @param enabled - The set of currently enabled feature keys.
 * @param labelOf - Optional resolver that maps a FeatureKey to a human-readable label.
 *                  Defaults to returning the raw key if not provided.
 */
export function validateFeatureSet(
  enabled: Set<FeatureKey>,
  labelOf: (key: FeatureKey) => string = (key) => key
): string | null {
  for (const [dependent, required] of Object.entries(FEATURE_DEPENDENCIES) as [FeatureKey, FeatureKey[]][]) {
    if (enabled.has(dependent)) {
      for (const req of required) {
        if (!enabled.has(req)) {
          return `"${labelOf(dependent as FeatureKey)}" requires "${labelOf(req)}" to be enabled.`;
        }
      }
    }
  }
  return null;
}
