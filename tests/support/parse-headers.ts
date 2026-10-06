export function parseGlobalHeaders(text: string): Record<string, string> {
  const headers: Record<string, string> = {};
  let inGlobalRule = false;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      inGlobalRule = line.trim() === '/*';
      continue;
    }
    if (!inGlobalRule) continue;
    const separator = line.indexOf(':');
    const name = line.slice(0, separator).trim();
    if (!name) continue;
    headers[name] = line.slice(separator + 1).trim();
  }
  return headers;
}

/** Headers from the global `/*` rule, with the CSP enforced for local http tests. */
export function productionHeaders(text: string): Record<string, string> {
  const headers = parseGlobalHeaders(text);
  const csp = headers['Content-Security-Policy-Report-Only'] ?? headers['Content-Security-Policy'];
  if (!csp) throw new Error('Missing Content-Security-Policy in _headers');
  delete headers['Content-Security-Policy-Report-Only'];
  delete headers['Strict-Transport-Security'];
  headers['Content-Security-Policy'] = csp.replace(/;\s*upgrade-insecure-requests/, '');
  return headers;
}
