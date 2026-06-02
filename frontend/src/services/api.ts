const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const normalizedApiBaseUrl = (() => {
  if (!rawApiBaseUrl) {
    return "/api";
  }

  const withoutTrailingSlash = rawApiBaseUrl.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
})();

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedApiBaseUrl}${normalizedPath}`;
}
