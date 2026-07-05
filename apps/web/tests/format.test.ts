import { describe, it, expect } from 'vitest';
import { formatDateTr } from '../src/lib/format';

describe('formatDateTr', () => {
  it('tr-TR uzun ay formatlar', () => {
    expect(formatDateTr('2026-07-02T10:00:00Z')).toBe('2 Temmuz 2026');
  });
  it('Date nesnesi kabul eder', () => {
    expect(formatDateTr(new Date('2026-01-15T00:00:00Z'))).toBe('15 Ocak 2026');
  });
});
