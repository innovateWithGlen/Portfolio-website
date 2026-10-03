'use client';

import { useEffect } from 'react';

// Content below the hero quietly fades up as it enters the viewport,
// with a small stagger between siblings. Progressive enhancement only:
// without JavaScript (or with reduced motion) everything is simply visible.
const SELECTORS = [
  '.value-strip-inner span',
  '.section-kicker',
  '.section-title',
  '.section-intro',
  '.portrait-card',
  '.about-content',
  '.service-card',
  '.services-cta',
  '.footer-inner > *',
].join(', ');

export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    // Contact is a conversion destination: its heading and booking link must
    // always be visible immediately after a navigation jump, even if the
    // IntersectionObserver callback has not fired yet.
    const elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS))
      .filter((el) => !el.closest('#contact'));
    const siblingIndex = new Map<Element, number>();
    elements.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const index = siblingIndex.get(parent) ?? 0;
      siblingIndex.set(parent, index + 1);
      el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 70}ms`);
      el.classList.add('reveal');
    });

    const timers = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          el.classList.add('in-view');
          // Once revealed, hand transitions back to each element's own CSS
          // (cards keep their fast hover response, no lingering delays).
          const t = window.setTimeout(() => {
            el.classList.remove('reveal', 'in-view');
            el.style.removeProperty('--reveal-delay');
            timers.delete(t);
          }, 1000);
          timers.add(t);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    );
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      elements.forEach((el) => {
        el.classList.remove('reveal', 'in-view');
        el.style.removeProperty('--reveal-delay');
      });
    };
  }, []);

  return null;
}
