import type { EscapeStack } from '../../core/escape-stack';
import { trapTabKey } from '../../core/focus-trap';

const BACKDROP_IDS = [
  'skip-link',
  'site-nav',
  'main-content',
  'disclaimer-bar',
  'site-footer',
  'a11yBtn',
  'waFloat',
] as const;

export function initModals(
  page: Document,
  escapeStack: EscapeStack,
  pageScroll: HTMLElement,
): { closeOpen: () => void } {
  let lastFocus: HTMLElement | null = null;
  const releases = new Map<HTMLElement, () => void>();

  function setBackdropHidden(hidden: boolean): void {
    for (const id of BACKDROP_IDS) {
      const element = page.getElementById(id);
      if (!element) throw new Error(`Missing required element #${id}`);
      if (hidden) element.setAttribute('aria-hidden', 'true');
      else element.removeAttribute('aria-hidden');
    }
  }

  function closeModal(modal: HTMLElement): void {
    modal.classList.remove('open');
    releases.get(modal)?.();
    releases.delete(modal);
    if (!page.querySelector('.modal-overlay.open')) {
      page.body.classList.remove('is-scroll-locked');
      pageScroll.classList.remove('is-scroll-locked');
      setBackdropHidden(false);
    }
    lastFocus?.focus();
  }

  function openModal(id: string, opener: HTMLElement): void {
    const modal = page.getElementById(id);
    if (!(modal instanceof HTMLElement)) throw new Error(`Missing dialog #${id}`);
    lastFocus = opener;
    modal.classList.add('open');
    page.body.classList.add('is-scroll-locked');
    pageScroll.classList.add('is-scroll-locked');
    setBackdropHidden(true);
    releases.set(
      modal,
      escapeStack.push(() => {
        closeModal(modal);
      }),
    );
    modal.querySelector<HTMLElement>('.modal-close')?.focus();
  }

  page.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const opener = target.closest<HTMLElement>('[data-open-modal]');
    if (opener) {
      event.preventDefault();
      const id = opener.getAttribute('data-open-modal');
      if (!id) throw new Error('data-open-modal is missing a dialog id');
      openModal(id, opener);
      return;
    }

    const closer = target.closest<HTMLElement>('[data-close-modal]');
    if (closer) {
      const modal = closer.closest<HTMLElement>('.modal-overlay');
      if (modal) closeModal(modal);
      return;
    }

    if (target instanceof HTMLElement && target.classList.contains('modal-overlay'))
      closeModal(target);
  });

  page.addEventListener('keydown', (event) => {
    const open = page.querySelector<HTMLElement>('.modal-overlay.open');
    if (open) trapTabKey(open, event);
  });

  return {
    closeOpen() {
      const open = page.querySelector<HTMLElement>('.modal-overlay.open');
      if (open) closeModal(open);
    },
  };
}
