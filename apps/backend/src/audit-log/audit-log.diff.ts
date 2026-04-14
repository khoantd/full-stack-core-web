const DEFAULT_DENYLIST = new Set([
  'password',
  'passwordHash',
  'hashedPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
]);

export type DiffEntry = { from?: unknown; to?: unknown };
export type Diff = Record<string, DiffEntry>;

function isDenylisted(field: string, denylist: Set<string>): boolean {
  if (denylist.has(field)) return true;
  const lower = field.toLowerCase();
  return denylist.has(lower);
}

export function buildCreateDiff(
  dto: Record<string, unknown>,
  opts?: { denylist?: Iterable<string> },
): Diff {
  const denylist = new Set(opts?.denylist ?? DEFAULT_DENYLIST);
  const diff: Diff = {};
  for (const [key, value] of Object.entries(dto)) {
    if (value === undefined) continue;
    if (isDenylisted(key, denylist)) continue;
    diff[key] = { to: value };
  }
  return diff;
}

export function buildUpdateDiff(params: {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  patch: Record<string, unknown>;
  opts?: { denylist?: Iterable<string> };
}): Diff {
  const denylist = new Set(params.opts?.denylist ?? DEFAULT_DENYLIST);
  const diff: Diff = {};

  for (const [key, newValue] of Object.entries(params.patch)) {
    if (newValue === undefined) continue;
    if (isDenylisted(key, denylist)) continue;

    const oldValue = params.before[key];
    const afterValue = params.after[key];
    if (oldValue === afterValue) continue;

    diff[key] = { from: oldValue, to: afterValue };
  }

  return diff;
}

export function buildDeleteDiff(
  snapshot: Record<string, unknown>,
  opts?: { allowlist?: string[]; denylist?: Iterable<string> },
): Diff {
  const denylist = new Set(opts?.denylist ?? DEFAULT_DENYLIST);
  const allow = opts?.allowlist;

  const diff: Diff = {};
  const entries = Object.entries(snapshot);
  for (const [key, value] of entries) {
    if (allow && !allow.includes(key)) continue;
    if (value === undefined) continue;
    if (isDenylisted(key, denylist)) continue;
    diff[key] = { from: value };
  }
  return diff;
}

