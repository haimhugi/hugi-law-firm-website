export function initAccordion(root: ParentNode): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>('.faq-q')) {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const answer = item?.querySelector<HTMLElement>('.faq-a');
      if (!item || !answer) throw new Error('FAQ question is missing its answer');
      const wasOpen = button.getAttribute('aria-expanded') === 'true';

      for (const entry of root.querySelectorAll('.faq-item')) {
        const question = entry.querySelector('.faq-q');
        const entryAnswer = entry.querySelector<HTMLElement>('.faq-a');
        if (!question || !entryAnswer) throw new Error('FAQ item is incomplete');
        question.setAttribute('aria-expanded', 'false');
        entryAnswer.hidden = true;
      }

      if (!wasOpen) {
        button.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  }
}
