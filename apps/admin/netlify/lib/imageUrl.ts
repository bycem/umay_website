export const IMAGE_URL_RE = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
export function isValidImageUrl(url: string): boolean {
  return IMAGE_URL_RE.test(url);
}
