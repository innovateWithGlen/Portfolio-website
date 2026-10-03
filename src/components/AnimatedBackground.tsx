'use client';

import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Pulse = { x: number; y: number; r: number; max: number };

const LINK_DIST = 150;
const CURSOR_DIST = 170;

/**
 * Tech-themed ambient background:
 * - fine blueprint grid with light pulses traveling along its lines (CSS)
 * - a "constellation" canvas: drifting nodes, linked when close, that also
 *   connect to the cursor — plus occasional sonar pings from a node
 * - soft slate orbs, a cursor spotlight and film grain for depth
 * Decorative only (pointer-events: none). With reduced motion everything
 * renders as a calm static frame.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shell = document.querySelector('.site-shell');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let last = performance.now();
    let pulseTimer = 1.6;
    const mouse = { x: -1e4, y: -1e4 };

    const seed = () => {
      const count = Math.max(26, Math.min(72, Math.floor((w * h) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 18, // px per second — a calm drift
        vy: (Math.random() - 0.5) * 18,
        r: 1 + Math.random(),
      }));
      pulses = [];
    };

    const draw = (dt: number) => {
      const light = shell?.classList.contains('theme-light') ?? false;
      const rgb = light ? '84,100,122' : '172,189,212';
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -10) n.x = w + 10;
        else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        else if (n.y > h + 10) n.y = -10;
      }

      // Links between nearby nodes, and from nodes to the cursor.
      const linkBase = light ? 0.15 : 0.17;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * linkBase;
          ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const dxm = a.x - mouse.x;
        const dym = a.y - mouse.y;
        const dm2 = dxm * dxm + dym * dym;
        if (dm2 < CURSOR_DIST * CURSOR_DIST) {
          const alpha = (1 - Math.sqrt(dm2) / CURSOR_DIST) * (light ? 0.2 : 0.24);
          ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      const nodeAlpha = light ? 0.4 : 0.5;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${nodeAlpha})`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sonar pings expanding from a random node now and then.
      const pingBase = light ? 0.3 : 0.35;
      for (const p of pulses) {
        const alpha = (1 - p.r / p.max) * pingBase;
        ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
        p.r += 26 * dt;
      }
      pulses = pulses.filter((p) => p.r < p.max);
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) draw(0); // static frame
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    if (!reduced) {
      window.addEventListener('mousemove', onMouse, { passive: true });
      const tick = (t: number) => {
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        pulseTimer += dt;
        if (pulseTimer > 2.6 && nodes.length) {
          pulseTimer = 0;
          const n = nodes[Math.floor(Math.random() * nodes.length)];
          pulses.push({ x: n.x, y: n.y, r: 0, max: 60 + Math.random() * 30 });
        }
        draw(dt);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div className="bg-scene" aria-hidden="true">
      <div className="bg-orb bg-orb-a" />
      <div className="bg-orb bg-orb-b" />
      <div className="bg-orb bg-orb-c" />
      <div className="bg-grid">
        <span className="bg-beam bg-beam-h bg-beam-h1" />
        <span className="bg-beam bg-beam-h bg-beam-h2" />
        <span className="bg-beam bg-beam-v bg-beam-v1" />
        <span className="bg-beam bg-beam-v bg-beam-v2" />
      </div>
      <canvas ref={canvasRef} className="bg-particles" />
      <div className="bg-spotlight" />
      <div className="bg-noise" />
    </div>
  );
}
