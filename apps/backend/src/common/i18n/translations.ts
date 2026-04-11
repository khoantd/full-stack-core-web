export type LocaleCode = string;

/**
 * Generic per-locale translation container.
 *
 * Stored as an object keyed by locale: `{ en: {...}, fr: {...} }`.
 * We keep this intentionally flexible so it can be reused across modules.
 */
export type Translations<T extends Record<string, unknown>> = Partial<
  Record<LocaleCode, Partial<T>>
>;

export function overlayTranslatedFields<T extends Record<string, unknown>>(
  base: T,
  translations: Translations<T> | undefined,
  locale: string | undefined,
): T {
  if (!locale) return base;
  const patch = translations?.[locale];
  if (!patch) return base;
  return { ...base, ...patch };
}

export function upsertTranslation<T extends Record<string, unknown>>(
  translations: Translations<T> | undefined,
  locale: string,
  patch: Partial<T>,
): Translations<T> {
  return {
    ...(translations ?? {}),
    [locale]: {
      ...(translations?.[locale] ?? {}),
      ...patch,
    },
  };
}

