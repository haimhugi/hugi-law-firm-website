import { describe, expect, it } from 'vitest';
import { createEscapeStack } from '../../src/scripts/core/escape-stack';

function escapeKey(): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
}

describe('escape stack', () => {
  it('closes the most recently opened overlay first', () => {
    const stack = createEscapeStack();
    const closed: string[] = [];
    stack.push(() => {
      closed.push('menu');
    });
    stack.push(() => {
      closed.push('dialog');
    });

    const event = escapeKey();
    expect(stack.handle(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(closed).toEqual(['dialog']);

    expect(stack.handle(escapeKey())).toBe(true);
    expect(closed).toEqual(['dialog', 'menu']);
    expect(stack.handle(escapeKey())).toBe(false);
  });

  it('skips an overlay that has already closed itself', () => {
    const stack = createEscapeStack();
    const closed: string[] = [];
    const removeMenu = stack.push(() => {
      closed.push('menu');
    });
    stack.push(() => {
      closed.push('dialog');
    });
    removeMenu();

    expect(stack.handle(escapeKey())).toBe(true);
    expect(closed).toEqual(['dialog']);
    expect(stack.handle(escapeKey())).toBe(false);
  });
});
