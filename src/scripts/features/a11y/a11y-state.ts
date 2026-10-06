export const A11Y_OPTION_KEYS = [
  'links',
  'contrast',
  'contrastDark',
  'spacing',
  'text',
  'images',
  'motion',
  'leading',
  'font',
  'sat',
] as const;

export type A11yOptionKey = (typeof A11Y_OPTION_KEYS)[number];

export const ALIGN_CYCLE = ['', 'right', 'center', 'left'] as const;
export type TextAlign = (typeof ALIGN_CYCLE)[number];

export type A11yState = Record<A11yOptionKey, boolean> & { align: TextAlign };

export function isA11yOptionKey(value: string | null): value is A11yOptionKey {
  return A11Y_OPTION_KEYS.some((key) => key === value);
}

export function emptyA11y(): A11yState {
  return {
    align: '',
    links: false,
    contrast: false,
    contrastDark: false,
    spacing: false,
    text: false,
    images: false,
    motion: false,
    leading: false,
    font: false,
    sat: false,
  };
}

function isTextAlign(value: unknown): value is TextAlign {
  return ALIGN_CYCLE.some((align) => align === value);
}

export function parseA11y(raw: string | null): A11yState {
  const state = emptyA11y();
  if (!raw) return state;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return state;
    const record = saved as Record<string, unknown>;
    for (const key of A11Y_OPTION_KEYS) {
      const value = record[key];
      if (typeof value === 'boolean') state[key] = value;
    }
    if (isTextAlign(record.align)) state.align = record.align;
    return state;
  } catch {
    return emptyA11y();
  }
}

export function toggleA11yOption(state: A11yState, key: A11yOptionKey): A11yState {
  const next: A11yState = { ...state, [key]: !state[key] };
  if (key === 'contrast' && next.contrast) next.contrastDark = false;
  if (key === 'contrastDark' && next.contrastDark) next.contrast = false;
  return next;
}

export function cycleAlign(state: A11yState): A11yState {
  const index = ALIGN_CYCLE.indexOf(state.align);
  const next = ALIGN_CYCLE[(index + 1) % ALIGN_CYCLE.length];
  if (next === undefined) return state;
  return { ...state, align: next };
}
