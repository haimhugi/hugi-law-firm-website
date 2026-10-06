import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseGlobalHeaders, productionHeaders } from '../support/parse-headers';

const sample = `
# comment
/*
  Content-Security-Policy-Report-Only: default-src 'self'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=31536000
  X-Frame-Options: DENY

https://example.test/*
  X-Robots-Tag: noindex
`;

describe('Cloudflare _headers parser', () => {
  it('reads only the global rule and skips comments', () => {
    expect(parseGlobalHeaders(sample)['X-Frame-Options']).toBe('DENY');
    expect(parseGlobalHeaders(sample)['X-Robots-Tag']).toBeUndefined();
  });

  it('enforces the policy and drops headers that do not apply to local http', () => {
    const headers = productionHeaders(sample);
    expect(headers['Content-Security-Policy']).toBe("default-src 'self'");
    expect(headers['Content-Security-Policy-Report-Only']).toBeUndefined();
    expect(headers['Strict-Transport-Security']).toBeUndefined();
    expect(headers['X-Frame-Options']).toBe('DENY');
  });

  it('keeps the real site policy free of inline styles', () => {
    const headers = productionHeaders(
      readFileSync(path.join(process.cwd(), 'public', '_headers'), 'utf8'),
    );
    expect(headers['Content-Security-Policy']).toContain("style-src 'self'");
    expect(headers['Content-Security-Policy']).not.toContain('unsafe-inline');
    expect(headers['Content-Security-Policy']).toContain("script-src 'self'");
  });
});
