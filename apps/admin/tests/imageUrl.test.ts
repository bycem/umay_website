import { describe, it, expect } from 'vitest';
import { isValidImageUrl } from '../netlify/lib/imageUrl';

describe('isValidImageUrl', () => {
  it.each([
    'https://ex.com/a.jpg', 'http://ex.com/b.PNG', 'https://ex.com/c.webp?w=100',
    'https://ex.com/d.svg', 'https://ex.com/e.jpeg', 'https://ex.com/f.gif',
  ])('geçerli: %s', (u) => expect(isValidImageUrl(u)).toBe(true));
  it.each([
    'ftp://ex.com/a.jpg', 'https://ex.com/a.pdf', 'javascript:alert(1)',
    'https://ex.com/noext', '/relative/a.jpg', '',
  ])('geçersiz: %s', (u) => expect(isValidImageUrl(u)).toBe(false));
});
