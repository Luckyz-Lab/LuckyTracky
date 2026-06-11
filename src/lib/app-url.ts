export function getAppOrigin(requestUrl: string): string {
  // 1. Explicit override (recommended: set this in Vercel env vars)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (siteUrl) return siteUrl;

  // 2. Vercel stable production URL (auto-injected by Vercel, no protocol prefix)
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return `https://${vercelProd}`;

  // 3. Fallback to request origin (local dev)
  const url = new URL(requestUrl);
  if (url.hostname === "0.0.0.0") url.hostname = "localhost";
  return url.origin;
}

export function getAppUrl(requestUrl: string, path: string) {
  return new URL(path, getAppOrigin(requestUrl));
}
