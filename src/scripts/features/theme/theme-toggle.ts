import type { KeyValueStore } from '../../core/storage';

export function initThemeToggle(options: {
  root: HTMLElement;
  button: HTMLButtonElement;
  iconSun: SVGElement;
  iconMoon: SVGElement;
  store: KeyValueStore;
  storageKey: string;
  media?: MediaQueryList;
}): void {
  const media = options.media ?? window.matchMedia('(prefers-color-scheme: dark)');

  function isDark(): boolean {
    const theme = options.root.getAttribute('data-theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return media.matches;
  }

  function render(): void {
    const dark = isDark();
    options.iconSun.classList.toggle('is-hidden', !dark);
    options.iconMoon.classList.toggle('is-hidden', dark);
  }

  const saved = options.store.get(options.storageKey);
  if (saved === 'dark' || saved === 'light') options.root.setAttribute('data-theme', saved);
  render();

  options.button.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    options.root.setAttribute('data-theme', next);
    options.store.set(options.storageKey, next);
    render();
  });
}
