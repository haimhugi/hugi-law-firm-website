import type { EscapeStack } from '../../core/escape-stack';

export function initMobileMenu(options: {
  button: HTMLButtonElement;
  menu: HTMLElement;
  escapeStack: EscapeStack;
  openLabel: string;
  closeLabel: string;
}): void {
  let release = (): void => {};

  function close(): void {
    options.menu.classList.remove('open');
    options.button.setAttribute('aria-expanded', 'false');
    options.button.setAttribute('aria-label', options.openLabel);
    release();
    release = () => {};
  }

  for (const link of options.menu.querySelectorAll('a')) {
    link.addEventListener('click', close);
  }

  options.button.addEventListener('click', () => {
    const open = options.menu.classList.toggle('open');
    options.button.setAttribute('aria-expanded', String(open));
    options.button.setAttribute('aria-label', open ? options.closeLabel : options.openLabel);
    release();
    release = () => {};
    if (!open) return;
    release = options.escapeStack.push(() => {
      close();
      options.button.focus();
    });
    options.menu.querySelector<HTMLElement>('a')?.focus();
  });
}
