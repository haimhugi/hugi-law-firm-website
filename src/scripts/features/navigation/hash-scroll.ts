const HASH_ID = /^[A-Za-z][\w:-]*$/;

/** A section id from a same-page link, or null when the hash is not one of ours. */
export function elementForHash(hash: string, root: ParentNode): HTMLElement | null {
  if (!hash.startsWith('#') || hash.length < 2) return null;
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
  if (!HASH_ID.test(id)) return null;
  const target = root.querySelector(`#${CSS.escape(id)}`);
  return target instanceof HTMLElement ? target : null;
}

/**
 * The document itself does not scroll: `body` is locked and `#page-scroll` moves.
 * Phones do not follow a `#section` link into that inner panel, so jump it ourselves,
 * just below the fixed navigation.
 */
export function scrollPageToTarget(
  pageScroll: HTMLElement,
  target: HTMLElement,
  navHeight: number,
): void {
  const top =
    target.getBoundingClientRect().top -
    pageScroll.getBoundingClientRect().top +
    pageScroll.scrollTop -
    navHeight;
  const previous = pageScroll.style.scrollBehavior;
  pageScroll.style.scrollBehavior = 'auto';
  pageScroll.scrollTop = Math.max(0, top);
  pageScroll.style.scrollBehavior = previous;
}

export function initHashScroll(pageScroll: HTMLElement): void {
  function navHeight(): number {
    const nav = document.getElementById('site-nav');
    return nav instanceof HTMLElement ? nav.offsetHeight + 8 : 80;
  }

  function alignToHash(hash: string): void {
    const target = elementForHash(hash, pageScroll);
    if (target) scrollPageToTarget(pageScroll, target, navHeight());
  }

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const source = event.target;
    if (!(source instanceof Element)) return;
    const link = source.closest('a[href]');
    if (!(link instanceof HTMLAnchorElement)) return;
    const url = new URL(link.href, location.href);
    if (
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      url.search !== location.search
    ) {
      return;
    }
    if (!elementForHash(url.hash, pageScroll)) return;
    event.preventDefault();
    if (location.hash !== url.hash) location.hash = url.hash;
    alignToHash(url.hash);
  });

  window.addEventListener('hashchange', () => {
    alignToHash(location.hash);
  });
  alignToHash(location.hash);
  window.addEventListener('load', () => {
    alignToHash(location.hash);
  });
}
