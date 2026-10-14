import { onBeforeUnmount, onMounted } from 'vue';

export function useKeyboardNav(onPrev: () => void, onNext: () => void) {
  function onKey(e: KeyboardEvent) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    const el = e.target;
    if (
      el instanceof HTMLElement &&
      (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
    ) {
      return;
    }
    if (document.querySelector('.q-dialog')) return;

    if (e.key === 'ArrowLeft') onPrev();
    else onNext();
  }

  onMounted(() => window.addEventListener('keydown', onKey));
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
}
