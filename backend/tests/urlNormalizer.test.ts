import { describe, it, expect } from 'vitest';
import { normalizeUrl, isSameDomain } from '../src/services/crawler/urlNormalizer.js';

describe('URL Normalizer', () => {
  it('strips hash fragments and trailing slashes from URLs', () => {
    expect(normalizeUrl('https://example.com/doctors/#team')).toBe('https://example.com/doctors');
    expect(normalizeUrl('https://example.com/cardiology/')).toBe('https://example.com/cardiology');
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('strips tracking and analytics parameters while preserving functional parameters', () => {
    const raw = 'https://example.com/contact?utm_source=google&utm_medium=cpc&branch=south';
    expect(normalizeUrl(raw)).toBe('https://example.com/contact?branch=south');
  });

  it('filters out non-HTML schemes and binary downloads', () => {
    expect(normalizeUrl('mailto:info@hospital.com')).toBeNull();
    expect(normalizeUrl('tel:+919845012345')).toBeNull();
    expect(normalizeUrl('javascript:void(0)')).toBeNull();
    expect(normalizeUrl('https://example.com/brochure.pdf')).toBeNull();
    expect(normalizeUrl('https://example.com/logo.png')).toBeNull();
  });

  it('resolves relative URLs against base host', () => {
    expect(normalizeUrl('/doctors/dr-sharma', 'https://example.com')).toBe(
      'https://example.com/doctors/dr-sharma'
    );
  });

  it('accurately verifies same-domain boundaries', () => {
    expect(isSameDomain('https://hospital.com/about', 'https://hospital.com')).toBe(true);
    expect(isSameDomain('https://sub.hospital.com/about', 'https://hospital.com', true)).toBe(true);
    expect(isSameDomain('https://anotherhospital.com', 'https://hospital.com')).toBe(false);
  });
});
