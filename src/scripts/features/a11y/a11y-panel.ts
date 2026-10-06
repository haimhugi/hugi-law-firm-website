import type { EscapeStack } from '../../core/escape-stack';
import type { KeyValueStore } from '../../core/storage';
import { A11Y_OPTIONS } from './a11y-options';
import {
  cycleAlign,
  emptyA11y,
  isA11yOptionKey,
  parseA11y,
  toggleA11yOption,
  type A11yState,
  type TextAlign,
} from './a11y-state';

const ALIGN_CLASSES = ['a11y-align-right', 'a11y-align-center', 'a11y-align-left'];

export function initA11yPanel(options: {
  root: HTMLElement;
  panel: HTMLElement;
  openButton: HTMLButtonElement;
  closeButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  alignButton: HTMLButtonElement;
  store: KeyValueStore;
  storageKey: string;
  escapeStack: EscapeStack;
  closeOpenModal: () => void;
  labels: Record<TextAlign, string>;
}): void {
  let state = parseA11y(options.store.get(options.storageKey));
  let release = (): void => {};

  function apply(next: A11yState): void {
    for (const option of A11Y_OPTIONS) {
      options.root.classList.toggle(option.className, next[option.key]);
    }
    options.root.classList.remove(...ALIGN_CLASSES);
    if (next.align) options.root.classList.add(`a11y-align-${next.align}`);

    for (const button of options.root.querySelectorAll<HTMLButtonElement>('[data-a11y]')) {
      const key = button.getAttribute('data-a11y');
      button.setAttribute('aria-pressed', isA11yOptionKey(key) && next[key] ? 'true' : 'false');
    }
    options.alignButton.setAttribute('aria-pressed', next.align ? 'true' : 'false');
    options.alignButton.textContent = options.labels[next.align];
  }

  function save(next: A11yState): void {
    state = next;
    options.store.set(options.storageKey, JSON.stringify(state));
    apply(state);
  }

  function close(): void {
    if (options.panel.hidden) return;
    options.panel.hidden = true;
    options.openButton.setAttribute('aria-expanded', 'false');
    release();
    release = () => {};
    options.openButton.focus();
  }

  function open(): void {
    options.closeOpenModal();
    options.panel.hidden = false;
    options.openButton.setAttribute('aria-expanded', 'true');
    release();
    release = options.escapeStack.push(close);
    options.closeButton.focus();
  }

  apply(state);

  options.openButton.addEventListener('click', () => {
    if (options.panel.hidden) open();
    else close();
  });
  options.closeButton.addEventListener('click', close);
  options.resetButton.addEventListener('click', () => {
    save(emptyA11y());
  });

  for (const button of options.panel.querySelectorAll<HTMLButtonElement>('[data-a11y]')) {
    button.addEventListener('click', () => {
      const key = button.getAttribute('data-a11y');
      if (!isA11yOptionKey(key)) return;
      save(toggleA11yOption(state, key));
    });
  }

  options.alignButton.addEventListener('click', () => {
    save(cycleAlign(state));
  });
}
