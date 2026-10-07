import { siteConfig } from './config/site';
import { requireElement } from './core/dom';
import { createEscapeStack } from './core/escape-stack';
import { createLocalStorageStore } from './core/storage';
import { initA11yPanel } from './features/a11y/a11y-panel';
import { initContactForm } from './features/contact/contact-form';
import { createWeb3FormsSubmitter } from './features/contact/form-submitter';
import { initAccordion } from './features/faq/accordion';
import { initModals } from './features/modal/modal-manager';
import { initFocusScroll } from './features/navigation/focus-scroll';
import { initHashScroll } from './features/navigation/hash-scroll';
import { initMobileMenu } from './features/navigation/mobile-menu';
import { initNavPicker } from './features/navigation/nav-picker';
import { initThemeToggle } from './features/theme/theme-toggle';
import { he } from './i18n/he';

const store = createLocalStorageStore();
const escapeStack = createEscapeStack();

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') escapeStack.handle(event);
});

initThemeToggle({
  root: document.documentElement,
  button: requireElement<HTMLButtonElement>('themeBtn'),
  iconSun: requireElement<SVGElement>('iconSun'),
  iconMoon: requireElement<SVGElement>('iconMoon'),
  store,
  storageKey: siteConfig.themeStorageKey,
});

const pageScroll = requireElement<HTMLElement>('page-scroll');
const floaters = document.querySelector('.floaters');
if (!(floaters instanceof HTMLElement)) throw new Error('Missing .floaters');
initFocusScroll(pageScroll, floaters);
initHashScroll(pageScroll);

initMobileMenu({
  button: requireElement<HTMLButtonElement>('hamBtn'),
  menu: requireElement<HTMLElement>('mobileMenu'),
  escapeStack,
  openLabel: he.menuOpen,
  closeLabel: he.menuClose,
});

const navPick = requireElement('navPick');
if (!(navPick instanceof HTMLDetailsElement)) throw new Error('#navPick must be a details element');
initNavPicker(navPick, escapeStack);

initAccordion(document);

const modals = initModals(document, escapeStack, pageScroll);

initA11yPanel({
  root: document.documentElement,
  panel: requireElement<HTMLElement>('a11yPanel'),
  openButton: requireElement<HTMLButtonElement>('a11yBtn'),
  closeButton: requireElement<HTMLButtonElement>('a11yPanelClose'),
  resetButton: requireElement<HTMLButtonElement>('a11yReset'),
  alignButton: requireElement<HTMLButtonElement>('a11yAlign'),
  store,
  storageKey: siteConfig.a11yStorageKey,
  escapeStack,
  closeOpenModal: modals.closeOpen,
  labels: he.align,
});

initContactForm(
  requireElement<HTMLFormElement>('contactForm'),
  createWeb3FormsSubmitter(siteConfig.formEndpoint),
  {
    timeoutMs: siteConfig.submitTimeoutMs,
    copy: {
      nameRequired: he.nameRequired,
      phoneRequired: he.phoneRequired,
      phoneInvalid: he.phoneInvalid,
      fixFields: he.fixFields,
      label: he.submitLabel,
      pending: he.submitPending,
      sent: he.submitSent,
      success: he.submitOk,
      rejected: he.submitRejected,
      timeout: he.submitTimeout,
      offline: he.submitOffline,
    },
  },
);
