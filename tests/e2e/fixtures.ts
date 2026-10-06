import fs from 'node:fs';
import { test as base, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { productionHeaders } from '../support/parse-headers';

const HEADERS = productionHeaders(
  fs.readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8'),
);

export const test = base.extend({
  page: async ({ page }, use) => {
    const problems: string[] = [];
    await page.exposeBinding('__reportCspViolation', (_source, message: string) => {
      problems.push(`CSP: ${message}`);
    });
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (event) => {
        window.__reportCspViolation(
          `${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`,
        );
      });
    });
    page.on('pageerror', (error) => {
      problems.push(`JS error: ${error.message}`);
    });
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.hostname !== '127.0.0.1' && url.hostname !== 'api.web3forms.com') {
        problems.push(`Third-party request: ${url.href}`);
      }
    });
    await page.route('http://127.0.0.1:4173/**', async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const response = await route.fetch();
      await route.fulfill({ response, headers: { ...response.headers(), ...HEADERS } });
    });

    await use(page);

    expect(problems, 'CSP violations, JS errors or third-party requests').toEqual([]);
  },
});

export { expect };

export async function gotoHome(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/index.html');
  await page.evaluate(() => document.fonts.ready);
}

export async function expectNoA11yViolations(
  page: import('@playwright/test').Page,
  include?: string,
): Promise<void> {
  await page.waitForTimeout(400);
  let builder = new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
    'best-practice',
  ]);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  expect(
    violations.map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
    ),
  ).toEqual([]);
}

export async function toggleA11yOption(
  page: import('@playwright/test').Page,
  key: string,
): Promise<void> {
  await page.click('#a11yBtn');
  await page.click(`[data-a11y="${key}"]`);
  await page.click('#a11yPanelClose');
}

export async function mockWeb3Forms(
  page: import('@playwright/test').Page,
  handler: Parameters<import('@playwright/test').Page['route']>[1],
): Promise<void> {
  await page.route('https://api.web3forms.com/submit', handler);
}
