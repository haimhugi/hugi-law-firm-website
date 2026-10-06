import type { EscapeStack } from '../../core/escape-stack';

export function initNavPicker(details: HTMLDetailsElement, escapeStack: EscapeStack): void {
  let release = (): void => {};

  details.addEventListener('toggle', () => {
    release();
    release = () => {};
    if (!details.open) return;
    release = escapeStack.push(() => {
      details.open = false;
      details.querySelector<HTMLElement>('summary')?.focus();
    });
  });
}
