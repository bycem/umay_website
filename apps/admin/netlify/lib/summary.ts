export function makeSummary(html: string, maxLen = 150): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length <= maxLen ? text : text.slice(0, maxLen).trimEnd() + '...';
}
