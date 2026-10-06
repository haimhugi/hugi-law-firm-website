/** The type argument lets the caller name the element it expects, instead of casting. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- see the comment above
export function requireElement<T extends Element>(id: string, root: ParentNode = document): T {
  const element = root.querySelector<T>(`#${CSS.escape(id)}`);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element;
}

/** The type argument lets the caller name the element it expects, instead of casting. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- see the comment above
export function requireChild<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element ${selector}`);
  return element;
}
