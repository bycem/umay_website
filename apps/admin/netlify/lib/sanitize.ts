import sanitizeHtml from 'sanitize-html';

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['h1', 'h2', 'h3', 'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'pre', 'code', 'ol', 'ul', 'li', 'a', 'img'],
    allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
    allowedSchemes: ['http', 'https'],
    disallowedTagsMode: 'discard',
  });
}
