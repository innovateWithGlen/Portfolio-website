'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PortfolioProject } from '@/data/types';

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 19 19 5M9 5h10v10" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5m6-7-7 7 7 7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14m-6-7 7 7-7 7" />
    </svg>
  );
}

type ProjectsGridProps = {
  projects: PortfolioProject[];
};

const AUTO_SPEED_PX_PER_SEC = 50;
const RESUME_DELAY_MS = 3000;

/**
 * "Selected work": an auto-moving infinite carousel the user can also
 * scroll back and forth. Auto-advance runs via requestAnimationFrame on
 * scrollLeft (so native swipe, mouse drag, buttons and keyboard all work),
 * wraps seamlessly at the halfway point (two identical groups), and pauses
 * while hovering, focusing, dragging, or shortly after any manual interaction.
 */
export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  const pauseState = useRef({ hovering: false, focused: false, visible: true, cooldownUntil: 0 });
  const [canPrev, setCanPrev] = useState(false);
  const [progress, setProgress] = useState(0);

  const halfScrollWidth = useCallback(() => {
    const el = listRef.current;
    if (!el) return 0;
    return el.scrollWidth / 2;
  }, []);

  const updateScrollState = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const half = halfScrollWidth();
    setCanPrev(el.scrollLeft > 4);
    // Progress maps onto one loop (0..1 across half the track) since the
    // second half is a seamless duplicate of the first.
    setProgress(half > 0 ? Math.min(1, Math.max(0, (el.scrollLeft % half) / half)) : 0);
  }, [halfScrollWidth]);

  const pokeCooldown = useCallback(() => {
    pauseState.current.cooldownUntil = Date.now() + RESUME_DELAY_MS;
  }, []);

  // Auto-advance loop with seamless forward wrap.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const s = pauseState.current;
      const paused =
        s.hovering ||
        s.focused ||
        dragState.current.down ||
        document.hidden ||
        !s.visible ||
        Date.now() < s.cooldownUntil;
      if (!paused) {
        el.scrollLeft += AUTO_SPEED_PX_PER_SEC * dt;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
        updateScrollState();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [updateScrollState, projects.length]);

  // Keep buttons / progress in sync with manual scrolling + viewport changes.
  useEffect(() => {
    updateScrollState();
    const el = listRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, projects.length]);

  // Only auto-scroll while the carousel is actually on screen.
  useEffect(() => {
    const el = listRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => { pauseState.current.visible = entry.isIntersecting; },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    pokeCooldown();
    const card = el.querySelector<HTMLElement>('.project-card');
    const amount = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }, [pokeCooldown]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Only start a drag with mouse / pen; touch uses native swipe scrolling.
    if (event.pointerType === 'touch') return;
    const el = listRef.current;
    if (!el) return;
    pokeCooldown();
    dragState.current = { down: true, startX: event.clientX, startScroll: el.scrollLeft, moved: false };
    el.classList.add('is-dragging');
    el.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = listRef.current;
    const state = dragState.current;
    if (!state.down || !el) return;
    const dx = event.clientX - state.startX;
    if (Math.abs(dx) > 6) state.moved = true;
    if (state.moved) {
      el.scrollLeft = state.startScroll - dx;
      pokeCooldown();
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = listRef.current;
    if (dragState.current.down) pokeCooldown();
    dragState.current.down = false;
    el?.classList.remove('is-dragging');
    try {
      el?.releasePointerCapture?.(event.pointerId);
    } catch {
      // No-op: pointer already released.
    }
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    pauseState.current.hovering = false;
    endDrag(event);
  };

  const suppressClickAfterDrag = (event: React.SyntheticEvent) => {
    if (dragState.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragState.current.moved = false;
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByPage(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByPage(-1);
    }
  };

  const renderGroup = (copy: number) => (
    <div className="project-group" key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
      {projects.map((project, index) => (
        <a
          className="project-card"
          key={`${project.id}-${copy}`}
          href={project.url}
          target="_blank"
          rel="noreferrer"
          tabIndex={copy === 1 ? -1 : undefined}
          draggable={false}
        >
          <div className="project-image-wrap">
            <div className="project-image-fallback" aria-hidden="true">
              <span>GM / 0{index + 1}</span>
              <strong>{project.title}</strong>
            </div>
            <img
              className="project-image"
              src={project.image}
              alt={`${project.title} website preview`}
              loading="lazy"
              draggable={false}
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="project-content">
            <div className="project-topline">
              <span className="project-category">{project.category}</span>
              <span className="project-index">0{index + 1} / {String(projects.length).padStart(2, '0')}</span>
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <span className="project-visit">View live project <ArrowUpRightIcon /></span>
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <section id="projects" className="section projects-section">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">03 / Selected work</span>
            <h2 className="section-title">The work speaks <span>for itself.</span></h2>
          </div>
          <div className="projects-heading-side">
            <p className="section-intro">Thoughtful digital experiences, built for real businesses and already live in the world.</p>
            <div className="projects-controls" aria-label="Scroll selected work">
              <button
                type="button"
                className="project-nav-btn"
                onClick={() => scrollByPage(-1)}
                disabled={!canPrev}
                aria-label="Scroll projects backward"
              >
                <ArrowLeftIcon />
              </button>
              <button
                type="button"
                className="project-nav-btn"
                onClick={() => scrollByPage(1)}
                aria-label="Scroll projects forward"
              >
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed scroll container so cards can slide edge-to-edge. */}
      <div
        className="project-list"
        ref={listRef}
        tabIndex={0}
        role="region"
        aria-label="Selected work projects — auto-scrolling, drag or swipe to explore"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={() => { pauseState.current.hovering = true; }}
        onFocus={() => { pauseState.current.focused = true; }}
        onBlur={() => { pauseState.current.focused = false; }}
        onWheel={pokeCooldown}
        onTouchStart={pokeCooldown}
        onClickCapture={suppressClickAfterDrag}
        onKeyDown={onKeyDown}
      >
        <div className="project-track">
          {renderGroup(0)}
          {renderGroup(1)}
        </div>
      </div>

      <div className="site-container">
        <div className="project-progress" aria-hidden="true">
          <div className="project-progress-bar" style={{ transform: `scaleX(${progress || 0})` }} />
        </div>
        <p className="project-hint">Auto-scrolling — drag or swipe to explore →</p>
      </div>
    </section>
  );
}
