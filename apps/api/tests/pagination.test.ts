import { describe, expect, it } from 'vitest';
import { encodeCursor, pageFromRows, parseCursor, parseLimit, parseSearch, QueryValidationError } from '../src/lib/pagination';

describe('pilot pagination contract', () => {
  it('enforces positive bounded integer limits', () => {
    expect(parseLimit(undefined)).toBe(25);
    expect(parseLimit('100')).toBe(100);
    for (const value of ['0','-1','1.5','101','no']) expect(() => parseLimit(value)).toThrow(QueryValidationError);
  });

  it('round-trips opaque stable cursors and rejects malformed input', () => {
    const cursor=encodeCursor({at:'2026-08-23T00:00:00.000Z',id:'same-time-b'});
    expect(parseCursor(cursor)).toEqual({at:'2026-08-23T00:00:00.000Z',id:'same-time-b'});
    expect(() => parseCursor('not-a-cursor')).toThrow(QueryValidationError);
  });

  it('returns a final partial page without a cursor and no duplicate sentinel row', () => {
    const rows=[{id:'c',createdAt:new Date('2026-08-23')},{id:'b',createdAt:new Date('2026-08-23')},{id:'a',createdAt:new Date('2026-08-22')}];
    const first=pageFromRows(rows,2,(row)=>row.createdAt.toISOString());
    expect(first.items.map((row)=>row.id)).toEqual(['c','b']);
    expect(first.nextCursor).toBeTruthy();
    const final=pageFromRows(rows.slice(2),2,(row)=>row.createdAt.toISOString());
    expect(final.items.map((row)=>row.id)).toEqual(['a']);
    expect(final.nextCursor).toBeNull();
  });

  it('trims search, treats empty as absent, and bounds length',()=>{
    expect(parseSearch('  bridge  ')).toBe('bridge');
    expect(parseSearch('   ')).toBeUndefined();
    expect(()=>parseSearch('x'.repeat(121))).toThrow(QueryValidationError);
  });
});
