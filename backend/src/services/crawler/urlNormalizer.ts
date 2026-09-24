import { URL } from 'url';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  '_ga',
  '_gl',
]);

const IGNORED_EXTENSIONS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.webp',
  '.mp4',
  '.mp3',
  '.avi',
  '.mov',
  '.zip',
  '.tar',
  '.gz',
  '.rar',
  '.7z',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.css',
  '.js',
  '.xml',
  '.json',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.ico',
]);

const IGNORED_SCHEMES = ['mailto:', 'tel:', 'javascript:', 'data:', 'whatsapp:', 'callto:', 'sms:'];

export interface NormalizeUrlOptions {
  stripQueryParams?: boolean;
  baseHost?: string;
  allowSubdomains?: boolean;
}

/**
 * Normalizes a URL string, returning standard form or null if invalid/ignored.
 */
export function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Check for ignored schemes
  for (const scheme of IGNORED_SCHEMES) {
    if (trimmed.toLowerCase().startsWith(scheme)) {
      return null;
    }
  }

  let parsed: URL;
  try {
    if (baseUrl) {
      parsed = new URL(trimmed, baseUrl);
    } else {
      parsed = new URL(trimmed);
    }
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  // Remove hash fragment
  parsed.hash = '';

  // Filter out tracking query parameters
  const searchParams = new URLSearchParams(parsed.search);
  const keysToDelete: string[] = [];
  for (const key of searchParams.keys()) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      keysToDelete.push(key);
    }
  }
  for (const key of keysToDelete) {
    searchParams.delete(key);
  }

  // Sort remaining query params for determinism
  searchParams.sort();
  parsed.search = searchParams.toString();

  // Normalize pathname: remove multiple consecutive slashes
  let pathname = parsed.pathname.replace(/\/+/g, '/');

  // Strip trailing slash unless it's root
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  parsed.pathname = pathname;

  // Check extension against ignored list
  const lowerPath = parsed.pathname.toLowerCase();
  for (const ext of IGNORED_EXTENSIONS) {
    if (lowerPath.endsWith(ext)) {
      return null;
    }
  }

  return parsed.toString();
}

/**
 * Checks if a candidate URL belongs to the same domain / subdomains as the root base URL.
 */
export function isSameDomain(candidateUrl: string, rootBaseUrl: string, allowSubdomains = true): boolean {
  try {
    const cand = new URL(candidateUrl);
    const root = new URL(rootBaseUrl);

    const candHost = cand.hostname.toLowerCase().replace(/^www\./, '');
    const rootHost = root.hostname.toLowerCase().replace(/^www\./, '');

    if (candHost === rootHost) return true;

    if (allowSubdomains) {
      return candHost.endsWith(`.${rootHost}`);
    }

    return false;
  } catch {
    return false;
  }
}
