/** The floating buttons sit over the page; nudge keyboard focus out from under them. */
export function initFocusScroll(pageScroll: HTMLElement, floaters: HTMLElement): void {
  document.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!pageScroll.contains(target) || !target.matches(':focus-visible')) return;
    const focused = target.getBoundingClientRect();
    const floating = floaters.getBoundingClientRect();
    const overlaps =
      focused.left < floating.right &&
      focused.right > floating.left &&
      focused.top < floating.bottom &&
      focused.bottom > floating.top;
    const shift = focused.bottom - floating.top + 12;
    if (overlaps && focused.top - shift > 80) pageScroll.scrollBy({ top: shift });
  });
}
