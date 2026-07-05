// SPA-side copy of the image URL regex used in netlify/lib/imageUrl.ts.
// Kept as a separate constant so the admin SPA does not import from netlify/.
export const IMAGE_URL_RE = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
