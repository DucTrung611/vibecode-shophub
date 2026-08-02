const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:6060/api/v1";
const apiOrigin = apiBaseUrl.replace(/\/api\/v\d+\/?$/, "");

/** Backend-uploaded assets (product/shop images) are served at `/uploads/*`, outside
 * the `/api/v1` prefix — resolve the relative path the API returns into an absolute URL. */
export function getAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}
