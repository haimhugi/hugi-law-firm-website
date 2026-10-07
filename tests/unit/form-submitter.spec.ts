import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWeb3FormsSubmitter } from '../../src/scripts/features/contact/form-submitter';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createWeb3FormsSubmitter', () => {
  it('accepts a successful JSON response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))),
    );
    const result = await createWeb3FormsSubmitter('https://api.web3forms.com/submit').submit(
      new FormData(),
      new AbortController().signal,
    );
    expect(result.ok).toBe(true);
  });

  it('rejects an HTTP error even when the body says success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 500 }))),
    );
    const result = await createWeb3FormsSubmitter('https://api.web3forms.com/submit').submit(
      new FormData(),
      new AbortController().signal,
    );
    expect(result.ok).toBe(false);
  });
});
