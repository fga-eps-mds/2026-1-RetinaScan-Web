const rawBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? '';

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseWithApi = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

  return `${baseWithApi}${normalizedPath}`;
}
