import {
  test,
  expect,
  gotoHome,
  expectNoA11yViolations,
  toggleA11yOption,
  mockWeb3Forms,
} from './fixtures';

test.describe('page basics', () => {
  test('loads with no cookies, no third-party requests and no console errors', async ({
    page,
    context,
  }) => {
    await gotoHome(page);
    await expect(page.locator('h1')).toBeVisible();
    expect(await context.cookies()).toEqual([]);
  });

  test('the production security headers are applied, with the CSP enforced', async ({ page }) => {
    const response = await page.goto('/index.html');
    if (!response) throw new Error('No response for /index.html');
    const headers = response.headers();
    expect(headers['content-security-policy']).toContain("script-src 'self'");
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    const inlineScriptRan = await page.evaluate(
      () =>
        new Promise((resolve) => {
          document.addEventListener(
            'securitypolicyviolation',
            (e) => {
              e.stopImmediatePropagation();
              resolve(false);
            },
            { capture: true, once: true },
          );
          window.__inlineRan = false;
          const s = document.createElement('script');
          s.textContent = 'window.__inlineRan = true';
          document.head.appendChild(s);
          setTimeout(() => {
            resolve(window.__inlineRan);
          }, 500);
        }),
    );
    expect(inlineScriptRan).toBe(false);
  });

  test('SEO and sharing tags are present and valid', async ({ page, request }) => {
    await gotoHome(page);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{80,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /og-share\.jpg$/,
    );
    const ld: unknown = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? '',
    );
    if (!ld || typeof ld !== 'object' || !('@type' in ld))
      throw new Error('Missing structured data');
    expect(ld['@type']).toBe('LegalService');
    for (const path of [
      '/robots.txt',
      '/sitemap.xml',
      '/media/og-share.jpg',
      '/favicon-32.png',
      '/apple-touch-icon.png',
    ]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });

  test('404 page is accessible and links home', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page.locator('a[href="/"]')).toBeVisible();
    await expectNoA11yViolations(page);
  });
});

test.describe('accessibility scans', () => {
  test('light theme', async ({ page }) => {
    await gotoHome(page);
    await expectNoA11yViolations(page);
  });

  test('dark theme', async ({ page }) => {
    await gotoHome(page);
    await page.click('#themeBtn');
    await expectNoA11yViolations(page);
  });

  for (const preset of ['contrast', 'contrastDark', 'links', 'text', 'spacing']) {
    test(`accessibility menu preset: ${preset}`, async ({ page }) => {
      await gotoHome(page);
      await toggleA11yOption(page, preset);
      await expectNoA11yViolations(page);
    });
  }

  test('accessibility panel open, with an option selected, in dark theme', async ({ page }) => {
    await gotoHome(page);
    await page.click('#themeBtn');
    await page.click('#a11yBtn');
    await page.click('[data-a11y="links"]');
    await expectNoA11yViolations(page, '#a11yPanel');
  });

  test('accessibility statement dialog', async ({ page }) => {
    await gotoHome(page);
    await page.click('[data-open-modal="accessibilityModal"]');
    await expectNoA11yViolations(page, '#accessibilityModal');
  });

  test('contact form showing errors', async ({ page }) => {
    await gotoHome(page);
    await page.click('#submitBtn');
    await expectNoA11yViolations(page, '#contact');
  });

  test('dark contrast keeps form errors readable', async ({ page }) => {
    await gotoHome(page);
    await toggleA11yOption(page, 'contrastDark');
    await page.click('#submitBtn');
    await expectNoA11yViolations(page, '#contact');
  });

  test('mobile menu open', async ({ page, isMobile }) => {
    if (!isMobile) await page.setViewportSize({ width: 390, height: 844 });
    await gotoHome(page);
    await page.click('#hamBtn');
    await expectNoA11yViolations(page, '#mobileMenu');
  });
});

test.describe('keyboard and dialogs', () => {
  test.skip(({ isMobile }) => isMobile, 'keyboard behaviour is desktop-only');

  test('accessibility panel is non-modal and Escape returns focus', async ({ page }) => {
    await gotoHome(page);
    await page.click('#a11yBtn');
    await expect(page.locator('#a11yPanel')).not.toHaveAttribute('aria-modal', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#a11yPanel')).toBeHidden();
    await expect(page.locator('#a11yBtn')).toBeFocused();
  });

  test('privacy dialog keeps focus inside and Escape returns focus to the opener', async ({
    page,
  }) => {
    await gotoHome(page);
    const opener = page.locator('.foot-legal [data-open-modal="privacyModal"]');
    await opener.click();
    const close = page.locator('#privacyModal .modal-close');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('#privacyModal'))).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(page.locator('#privacyModal')).not.toHaveClass(/open/);
    await expect(opener).toBeFocused();
  });
});

test.describe('contact form', () => {
  test('only name and phone are required', async ({ page }) => {
    await gotoHome(page);
    await page.click('#submitBtn');
    await expect(page.locator('#fname-error')).toHaveText('נא למלא שם מלא.');
    await expect(page.locator('#fphone-error')).toHaveText('נא למלא מספר טלפון.');
    await expect(page.locator('#fname')).toBeFocused();
  });

  test('a phone field with only spaces counts as empty', async ({ page }) => {
    await gotoHome(page);
    await page.fill('#fname', 'בדיקה');
    await page.fill('#fphone', '   ');
    await page.click('#submitBtn');
    await expect(page.locator('#fphone-error')).toHaveText('נא למלא מספר טלפון.');
  });

  test('a phone without enough digits is rejected', async ({ page }) => {
    await gotoHome(page);
    await page.fill('#fname', 'בדיקה');
    await page.fill('#fphone', 'abc');
    await page.click('#submitBtn');
    await expect(page.locator('#fphone-error')).toHaveText('נא להזין מספר טלפון עם 7 ספרות לפחות.');
    await expect(page.locator('#fphone')).toBeFocused();
  });

  test('successful send clears the form and the button resets on new input', async ({ page }) => {
    let sentPhone;
    await mockWeb3Forms(page, async (route) => {
      sentPhone = /name="phone"\r\n\r\n([^\r]*)/.exec(route.request().postData() || '')?.[1];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"success":true}',
      });
    });
    await gotoHome(page);
    await page.fill('#fname', 'בדיקה');
    await page.fill('#fphone', 'נייד: 054 123 4567');
    await page.click('#submitBtn');
    await expect(page.locator('#formMsg')).toHaveText('ההודעה נשלחה בהצלחה. נחזור אליכם בהקדם.');
    expect(sentPhone).toBe('נייד: 054 123 4567');
    await expect(page.locator('#fname')).toHaveValue('');
    await expect(page.locator('#submitBtn')).toBeEnabled();
    await page.fill('#fname', 'פנייה נוספת');
    await expect(page.locator('#submitBtn')).toHaveText('שלח הודעה');
  });

  test('server error keeps the input and offers the office phone', async ({ page }) => {
    await mockWeb3Forms(page, (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false}' }),
    );
    await gotoHome(page);
    await page.fill('#fname', 'בדיקה');
    await page.fill('#fphone', '0541234567');
    await page.click('#submitBtn');
    await expect(page.locator('#formMsg')).toContainText('03-566-5775');
    await expect(page.locator('#fname')).toHaveValue('בדיקה');
    await expect(page.locator('#submitBtn')).toBeEnabled();
  });

  test('a request that never answers times out and keeps the input', async ({ page }) => {
    test.slow();
    await mockWeb3Forms(page, () => {});
    await gotoHome(page);
    await page.fill('#fname', 'בדיקה');
    await page.fill('#fphone', '0541234567');
    await page.fill('#fmsg', 'חוזה שכירות');
    await page.click('#submitBtn');
    await expect(page.locator('#formMsg')).toContainText('השליחה לא הושלמה בזמן', {
      timeout: 25_000,
    });
    await expect(page.locator('#fmsg')).toHaveValue('חוזה שכירות');
    await expect(page.locator('#submitBtn')).toBeEnabled();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('content and contact details are visible', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.contact-phones a[href="tel:035665775"]')).toBeVisible();
  });
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('smooth scrolling is turned off', async ({ page }) => {
    await gotoHome(page);
    expect(await page.$eval('#page-scroll', (el) => getComputedStyle(el).scrollBehavior)).toBe(
      'auto',
    );
  });
});

test.describe('hash links', () => {
  test('opening the page at a section scrolls that section below the navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html#contact');
    await page.evaluate(() => document.fonts.ready);
    const position = await page.evaluate(() => {
      const contact = document.querySelector('#contact');
      const nav = document.querySelector('#site-nav');
      const scroller = document.querySelector('#page-scroll');
      if (!contact || !nav || !scroller) return null;
      return {
        scrollTop: scroller.scrollTop,
        contactTop: contact.getBoundingClientRect().top,
        navBottom: nav.getBoundingClientRect().bottom,
      };
    });
    if (!position) throw new Error('contact section was not measured');
    expect(position.scrollTop).toBeGreaterThan(200);
    expect(position.contactTop).toBeGreaterThanOrEqual(position.navBottom - 2);
    expect(position.contactTop).toBeLessThan(position.navBottom + 24);
  });
});

test.describe('layout', () => {
  test('no horizontal scrolling at 320px with large text, spacing, line height and readable font', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await gotoHome(page);
    for (const preset of ['text', 'spacing', 'leading', 'font'])
      await toggleA11yOption(page, preset);
    await page.waitForTimeout(300);
    const { scrollWidth, clientWidth } = await page.$eval('#page-scroll', (el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    await page.locator('#fmsg-note').scrollIntoViewIfNeeded();
    const covered = await page.evaluate(() => {
      const floaters = [...document.querySelectorAll('.floaters > *')].map((el) =>
        el.getBoundingClientRect(),
      );
      return [
        ...document.querySelectorAll('#contact .wrap p, #contact .wrap label, #contact .wrap h2'),
      ]
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return floaters.some(
            (floater) =>
              box.left < floater.right &&
              box.right > floater.left &&
              box.top < floater.bottom &&
              box.bottom > floater.top,
          );
        })
        .map((el) => (el.textContent || '').trim());
    });
    expect(covered).toEqual([]);
  });

  test('floating buttons do not cover footer links at the bottom of the page', async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) await page.setViewportSize({ width: 390, height: 844 });
    await gotoHome(page);
    await page.$eval('#page-scroll', (el) => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'instant' });
    });
    await page.waitForTimeout(200);
    const covered = await page.evaluate(() => {
      const floaters = [...document.querySelectorAll('.floaters > *')].map((f) =>
        f.getBoundingClientRect(),
      );
      return [...document.querySelectorAll('footer a, footer button')]
        .filter((el) => {
          const a = el.getBoundingClientRect();
          return floaters.some(
            (b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top,
          );
        })
        .map((el) => el.textContent.trim());
    });
    expect(covered).toEqual([]);
  });
});
