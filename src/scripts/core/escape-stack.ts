export interface EscapeStack {
  push(close: () => void): () => void;
  handle(event: KeyboardEvent): boolean;
}

/** Closes the most recently opened overlay. Overlays also drop their handler when closed another way. */
export function createEscapeStack(): EscapeStack {
  const stack: Array<() => void> = [];

  return {
    push(close) {
      stack.push(close);
      return () => {
        const index = stack.lastIndexOf(close);
        if (index !== -1) stack.splice(index, 1);
      };
    },
    handle(event) {
      const close = stack.pop();
      if (!close) return false;
      event.preventDefault();
      close();
      return true;
    },
  };
}
