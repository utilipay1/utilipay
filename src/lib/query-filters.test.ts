import { toInFilter } from './query-filters';

describe('toInFilter', () => {
  it('splits comma-separated property ids into an $in query', () => {
    expect(toInFilter('abc123,def456')).toEqual({
      $in: ['abc123', 'def456'],
    });
  });

  it('keeps a single id as a one-item $in query', () => {
    expect(toInFilter('abc123')).toEqual({ $in: ['abc123'] });
  });

  it('returns undefined for empty or missing values', () => {
    expect(toInFilter(null)).toBeUndefined();
    expect(toInFilter('')).toBeUndefined();
    expect(toInFilter('  ,  ')).toBeUndefined();
  });

  it('trims whitespace around ids', () => {
    expect(toInFilter(' abc123 , def456 ')).toEqual({
      $in: ['abc123', 'def456'],
    });
  });
});
