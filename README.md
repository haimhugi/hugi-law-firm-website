# Hugi Law Firm website

Official site of Hugi Law Office (משרד עורכי דין חוגי), a family-run firm in Ramat Gan.

**Live:** [hugilaw.co.il](https://hugilaw.co.il/)

![The homepage hero, with the city skyline, the firm name, and the phone number in the navigation](docs/screenshot.png)

Hebrew, right-to-left, one page. Fonts and images are self-hosted. The only request that leaves the site is the contact form, which posts to Web3Forms.

## Stack

- [Vite](https://vite.dev/) builds the static site. Pages live in `src/`, and hashed files land in `dist/assets/`.
- TypeScript, strict, for the page behavior. `src/scripts/main.ts` is the only place that wires features together.
- CSS split by component. `src/styles/main.css` only lists the import order.
- Vitest for the pure logic. Playwright and axe-core for the built site in Chrome, Firefox, WebKit, and mobile Safari.
- Cloudflare serves `dist/`. `wrangler.jsonc` points at that folder and serves the built 404 page for unknown paths. This repo does not deploy anything.

## Layout

```
src/
  index.html, 404.html
  styles/          base, layout, components, a11y preferences
  scripts/
    main.ts        composition root
    config/        phone, form endpoint, timeouts
    i18n/          Hebrew strings used by scripts
    core/          DOM lookup, storage, focus trap, Escape stack
    features/      theme, navigation, FAQ, modals, accessibility panel, contact form
  assets/          fonts and images (fingerprinted by the build)
public/            _headers, robots.txt, sitemap.xml, favicons, media/
tests/e2e/         Playwright
tests/unit/        Vitest
```

Features receive the elements, the storage, and the form submitter they need. Adding an accessibility option is a row in `src/scripts/features/a11y/a11y-options.ts`. Each open overlay registers its own Escape handler, so there is no central key-order chain.

## Scripts

Requires Node 22 or newer (`engines` and `.nvmrc`).

| Command               | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | Local site with reload                              |
| `npm run check`       | Typecheck, lint, unit tests, and a production build |
| `npm run test:e2e`    | Builds, then runs Playwright against the preview    |
| `npm run test:chrome` | The same suite, Chrome only                         |
| `npm run build`       | Writes `dist/`                                      |

`npm run check` covers ESLint (strict TypeScript), Stylelint, html-validate, and Prettier.

## Quality bar

- Content Security Policy is enforced from `public/_headers`. Styles and scripts are same-origin only. There is no `unsafe-inline`.
- axe-core runs in the light theme, the dark theme, and each accessibility preset, including the open panel, dialogs, form errors, and the mobile menu.
- The browser tests fail if the page sets a cookie, logs a console error, or requests any host other than itself and `api.web3forms.com`.
- Built files under `/assets/` are cached for a year. Their names change when the content changes. `public/media/` stays at fixed URLs because Open Graph and the structured data point at them.
