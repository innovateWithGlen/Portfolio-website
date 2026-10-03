'use client';

import { useEffect } from 'react';

/**
 * Pointer-driven polish that leaves the native cursor alone:
 * - moves the background spotlight with the pointer
 * - subtle magnetic pull + click ripple on the primary CTAs
 * The browser's own pointer (with its hand cursor on links) is never replaced.
 */
export default function InteractionEffects() {
  useEffect(() => {
    const root = document.documentElement;

    // Drives the background spotlight so cursor + background feel connected.
    const onMove = (event: MouseEvent) => {
      root.style.setProperty('--mx', `${event.clientX}px`);
      root.style.setProperty('--my', `${event.clientY}px`);
    };

    // Subtle magnetic pull + click ripple for the primary CTAs.
    const magnetics = Array.from(
      document.querySelectorAll<HTMLElement>('.hero-button, .nav-book'),
    );
    const cleanups: Array<() => void> = [];
    magnetics.forEach((el) => {
      el.classList.add('magnetic');
      const onMagnetMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        el.style.setProperty('translate', `${(x * 0.1).toFixed(1)}px ${(y * 0.14).toFixed(1)}px`);
      };
      const onMagnetLeave = () => el.style.setProperty('translate', '');
      const onRipple = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'cta-ripple';
        const diameter = Math.max(rect.width, rect.height) * 2.1;
        ripple.style.width = `${diameter}px`;
        ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        el.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 750);
      };
      el.addEventListener('mousemove', onMagnetMove);
      el.addEventListener('mouseleave', onMagnetLeave);
      el.addEventListener('click', onRipple);
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMagnetMove);
        el.removeEventListener('mouseleave', onMagnetLeave);
        el.removeEventListener('click', onRipple);
        el.classList.remove('magnetic');
        el.style.setProperty('translate', '');
      });
    });

    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
