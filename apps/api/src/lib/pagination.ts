export const PILOT_DEFAULT_LIMIT = 25;
export const PILOT_MAX_LIMIT = 100;
export const SMALL_REGISTRY_MAX = 250;
export const MAP_MAX_ITEMS = 250;

export class QueryValidationError extends Error {
  readonly code = 'INVALID_QUERY';
}

export interface StableCursor { at: string; id: string }
export interface Page<T> { items: T[]; nextCursor: string | null; limit: number; truncated?: boolean }

export function parseLimit(value: unknown, fallback = PILOT_DEFAULT_LIMIT, maximum = PILOT_MAX_LIMIT): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new QueryValidationError('limit must be a positive integer.');
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > maximum) throw new QueryValidationError(`limit must be between 1 and ${maximum}.`);
  return limit;
}

export function parseSearch(value: unknown, maximum = 120): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new QueryValidationError('search must be a string.');
  const search = value.trim();
  if (search.length > maximum) throw new QueryValidationError(`search must not exceed ${maximum} characters.`);
  return search || undefined;
}

export function parseEnum<T extends string>(value: unknown, allowed: readonly T[], name: string): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !allowed.includes(value as T)) throw new QueryValidationError(`${name} is invalid.`);
  return value as T;
}

export function parseUuidQuery(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new QueryValidationError(`${name} must be a valid UUID.`);
  return value;
}

export function encodeCursor(value: StableCursor): string {
  return Buffer.from(JSON.stringify({ v: 1, ...value }), 'utf8').toString('base64url');
}

export function parseCursor(value: unknown): StableCursor | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > 512) throw new QueryValidationError('cursor is malformed.');
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Record<string, unknown>;
    if (parsed.v !== 1 || typeof parsed.at !== 'string' || Number.isNaN(Date.parse(parsed.at)) || typeof parsed.id !== 'string' || !parsed.id) throw new Error();
    return { at: parsed.at, id: parsed.id };
  } catch { throw new QueryValidationError('cursor is malformed.'); }
}

export function pageFromRows<T extends { id: string }>(rows: T[], limit: number, cursorOf: (row: T) => string, extras: Partial<Page<T>> = {}): Page<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);
  return { items, nextCursor: hasMore && last ? encodeCursor({ at: cursorOf(last), id: last.id }) : null, limit, ...extras };
}

export function queryError(res: { status(code: number): { json(body: unknown): unknown } }, error: unknown): unknown | undefined {
  if (!(error instanceof QueryValidationError)) return undefined;
  return res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
}
