import { describe, it, expect } from 'vitest';
import { makeSummary } from '../netlify/lib/summary';

describe('makeSummary', () => {
  it('HTML tag\'lerini temizler', () => {
    expect(makeSummary('<p>Merhaba <strong>dünya</strong></p>')).toBe('Merhaba dünya');
  });
  it('boşlukları tekilleştirir', () => {
    expect(makeSummary('<p>a</p>\n<p>b</p>')).toBe('a b');
  });
  it('150 karakterden uzunsa keser ve ... ekler', () => {
    const out = makeSummary('<p>' + 'x'.repeat(200) + '</p>');
    expect(out).toHaveLength(153);
    expect(out.endsWith('...')).toBe(true);
  });
  it('kısa metni olduğu gibi bırakır', () => {
    expect(makeSummary('<p>kısa</p>')).toBe('kısa');
  });
  it('boş içerikte boş string döner', () => {
    expect(makeSummary('')).toBe('');
  });
});
