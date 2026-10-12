/**
 * Phone: while a calculator's result card is below the screen, a bar pinned to the bottom shows the
 * key figure; a tap scrolls to the card (RECETTE §5, rule of 2026-10-11). Added on the client only:
 * the bar is not in the built HTML, so no text is shown twice in the page source.
 */
import { useEffect, useState, type RefObject } from 'react';

export function useBelow(ref: RefObject<HTMLElement | null>) {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setBelow(!e.isIntersecting && e.boundingClientRect.top > 0));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return below;
}

export function StickyKey({ show, card, label, value }: { show: boolean; card: RefObject<HTMLElement | null>; label: string; value: string }) {
  if (!show) return null;
  return (
    <button type="button" aria-hidden="true" tabIndex={-1} onClick={() => card.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      className="fixed inset-x-0 bottom-0 z-40 flex items-baseline justify-between gap-3 border-t border-accent-200 bg-accent-50 px-4 py-3 text-left shadow-lg lg:hidden">
      <span className="text-sm font-medium text-navy-700">{label}</span>
      <span className="tabular-nums shrink-0 text-xl font-bold text-navy-900">{value}</span>
    </button>
  );
}
