import { describe, expect, it } from 'vitest';
import {
  cycleAlign,
  emptyA11y,
  parseA11y,
  toggleA11yOption,
} from '../../src/scripts/features/a11y/a11y-state';

describe('accessibility state', () => {
  it('starts with every option off', () => {
    const state = emptyA11y();
    expect(state.align).toBe('');
    expect(state.contrast).toBe(false);
    expect(state.contrastDark).toBe(false);
  });

  it('ignores missing, broken and unexpected saved values', () => {
    expect(parseA11y(null)).toEqual(emptyA11y());
    expect(parseA11y('{')).toEqual(emptyA11y());
    expect(
      parseA11y(JSON.stringify({ links: 'yes', align: 'justify', contrast: true })),
    ).toMatchObject({
      links: false,
      align: '',
      contrast: true,
    });
  });

  it('keeps only known boolean options and a known alignment', () => {
    const parsed = parseA11y(JSON.stringify({ text: true, align: 'center', extra: true }));
    expect(parsed.text).toBe(true);
    expect(parsed.align).toBe('center');
  });

  it('turns the other contrast mode off when one is turned on', () => {
    const high = toggleA11yOption({ ...emptyA11y(), contrastDark: true }, 'contrast');
    expect(high.contrast).toBe(true);
    expect(high.contrastDark).toBe(false);

    const dark = toggleA11yOption(high, 'contrastDark');
    expect(dark.contrast).toBe(false);
    expect(dark.contrastDark).toBe(true);
  });

  it('cycles alignment and returns to the default', () => {
    const right = cycleAlign(emptyA11y());
    const center = cycleAlign(right);
    const left = cycleAlign(center);
    const cleared = cycleAlign(left);
    expect([right.align, center.align, left.align, cleared.align]).toEqual([
      'right',
      'center',
      'left',
      '',
    ]);
  });
});
