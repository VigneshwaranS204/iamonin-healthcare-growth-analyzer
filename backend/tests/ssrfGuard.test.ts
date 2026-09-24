import { describe, it, expect } from 'vitest';
import { isPrivateIPv4, isPrivateIPv6, validateUrlForSSRF } from '../src/services/crawler/ssrfGuard.js';

describe('SSRF Guard', () => {
  it('identifies private IPv4 addresses accurately', () => {
    expect(isPrivateIPv4('127.0.0.1')).toBe(true);
    expect(isPrivateIPv4('10.0.0.1')).toBe(true);
    expect(isPrivateIPv4('172.16.0.1')).toBe(true);
    expect(isPrivateIPv4('172.31.255.255')).toBe(true);
    expect(isPrivateIPv4('192.168.1.1')).toBe(true);
    expect(isPrivateIPv4('169.254.169.254')).toBe(true); // AWS/GCP metadata
    expect(isPrivateIPv4('0.0.0.0')).toBe(true);

    // Public IPs should return false
    expect(isPrivateIPv4('8.8.8.8')).toBe(false);
    expect(isPrivateIPv4('1.1.1.1')).toBe(false);
    expect(isPrivateIPv4('104.26.10.228')).toBe(false);
  });

  it('identifies private IPv6 addresses accurately', () => {
    expect(isPrivateIPv6('::1')).toBe(true);
    expect(isPrivateIPv6('fc00::1')).toBe(true);
    expect(isPrivateIPv6('fe80::1')).toBe(true);
  });

  it('rejects disallowed protocols and internal hostnames', async () => {
    const fileUrl = await validateUrlForSSRF('file:///etc/passwd');
    expect(fileUrl.isValid).toBe(false);

    const ftpUrl = await validateUrlForSSRF('ftp://example.com/file');
    expect(ftpUrl.isValid).toBe(false);

    const localhostUrl = await validateUrlForSSRF('http://localhost:3000');
    expect(localhostUrl.isValid).toBe(false);

    const loopbackUrl = await validateUrlForSSRF('http://127.0.0.1:8080');
    expect(loopbackUrl.isValid).toBe(false);

    const metadataUrl = await validateUrlForSSRF('http://169.254.169.254/latest/meta-data/');
    expect(metadataUrl.isValid).toBe(false);
  });

  it('permits valid public URLs', async () => {
    const publicUrl = await validateUrlForSSRF('https://example.com');
    expect(publicUrl.isValid).toBe(true);
  });
});
