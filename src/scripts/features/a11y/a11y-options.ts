import type { A11yOptionKey } from './a11y-state';

export interface A11yOption {
  key: A11yOptionKey;
  className: string;
}

export const A11Y_OPTIONS: readonly A11yOption[] = [
  { key: 'links', className: 'a11y-links' },
  { key: 'contrast', className: 'a11y-contrast' },
  { key: 'contrastDark', className: 'a11y-contrast-dark' },
  { key: 'spacing', className: 'a11y-spacing' },
  { key: 'text', className: 'a11y-text' },
  { key: 'images', className: 'a11y-hide-images' },
  { key: 'motion', className: 'a11y-motion' },
  { key: 'leading', className: 'a11y-leading' },
  { key: 'font', className: 'a11y-font' },
  { key: 'sat', className: 'a11y-sat' },
];
