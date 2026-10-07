import { afterEach, describe, expect, it, vi } from 'vitest';
import { elementForHash, initHashScroll } from '../../src/scripts/features/navigation/hash-scroll';

function rect(top: number): DOMRect {
  return new DOMRect(0, top, 100, 200);
}

function element(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (!(found instanceof HTMLElement)) throw new Error(`missing #${id}`);
  return found;
}

afterEach(() => {
  document.body.innerHTML = '';
  history.replaceState(null, '', location.pathname);
});

describe('hash scrolling', () => {
  it('accepts a section id and rejects anything else', () => {
    document.body.innerHTML = '<div id="page"><section id="contact"></section></div>';
    const root = element('page');
    expect(elementForHash('#contact', root)?.id).toBe('contact');
    expect(elementForHash('#missing', root)).toBeNull();
    expect(elementForHash('#', root)).toBeNull();
    expect(elementForHash('contact', root)).toBeNull();
  });

  it('moves the page panel to the section when the address hash is opened', () => {
    document.body.innerHTML = `
      <nav id="site-nav"></nav>
      <div id="page-scroll">
        <section id="contact"></section>
      </div>`;
    const pageScroll = element('page-scroll');
    const contact = element('contact');
    const nav = element('site-nav');
    vi.spyOn(contact, 'getBoundingClientRect').mockReturnValue(rect(900));
    vi.spyOn(pageScroll, 'getBoundingClientRect').mockReturnValue(rect(0));
    Object.defineProperty(nav, 'offsetHeight', { value: 66 });
    Object.defineProperty(pageScroll, 'scrollTop', { value: 0, writable: true });

    location.hash = '#contact';
    initHashScroll(pageScroll);

    expect(pageScroll.scrollTop).toBe(900 - 74);
  });

  it('follows a same-page link into the page panel', () => {
    document.body.innerHTML = `
      <nav id="site-nav"></nav>
      <div id="page-scroll">
        <a href="#about">אודות</a>
        <section id="about"></section>
      </div>`;
    const pageScroll = element('page-scroll');
    const about = element('about');
    const nav = element('site-nav');
    vi.spyOn(about, 'getBoundingClientRect').mockReturnValue(rect(500));
    vi.spyOn(pageScroll, 'getBoundingClientRect').mockReturnValue(rect(0));
    Object.defineProperty(nav, 'offsetHeight', { value: 66 });
    Object.defineProperty(pageScroll, 'scrollTop', { value: 0, writable: true });

    initHashScroll(pageScroll);
    const link = document.querySelector('a');
    if (!(link instanceof HTMLAnchorElement)) throw new Error('missing link');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));

    expect(location.hash).toBe('#about');
    expect(pageScroll.scrollTop).toBe(500 - 74);
  });
});
