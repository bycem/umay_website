import { describe, it, expect } from 'vitest';
import { sanitizeContent } from '../netlify/lib/sanitize';

describe('sanitizeContent', () => {
  it('script tag\'ini atar', () => {
    expect(sanitizeContent('<p>a</p><script>alert(1)</script>')).toBe('<p>a</p>');
  });
  it('event handler attribute\'larını atar', () => {
    expect(sanitizeContent('<img src="https://e.com/a.jpg" onerror="x()">')).toBe('<img src="https://e.com/a.jpg" />');
  });
  it('izinli biçimlendirmeyi korur', () => {
    const html = '<h2>B</h2><p><strong>k</strong> <em>i</em> <u>u</u> <s>s</s></p><blockquote>q</blockquote><ul><li>x</li></ul>';
    expect(sanitizeContent(html)).toBe(html);
  });
  it('javascript: href\'i atar', () => {
    expect(sanitizeContent('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
  });
  it('style ve class attribute\'larını atar', () => {
    expect(sanitizeContent('<p style="color:red" class="x">a</p>')).toBe('<p>a</p>');
  });
});
